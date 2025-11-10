const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const feedbacks = [];
let nextId = 1;

app.use(express.urlencoded({ extended: false }));

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Feedback do Curso</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem auto; max-width: 600px; }
    form { display: flex; flex-direction: column; gap: 1rem; }
    label { font-weight: bold; }
    input[type="text"], textarea { padding: 0.5rem; font-size: 1rem; }
    button { width: fit-content; padding: 0.5rem 1rem; font-size: 1rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Envie seu Feedback</h1>
  <form action="/feedbacks/enviar" method="POST">
    <div>
      <label for="nome">Nome</label>
      <input type="text" id="nome" name="nome" required />
    </div>
    <div>
      <label for="comentario">Comentário</label>
      <textarea id="comentario" name="comentario" rows="5" required></textarea>
    </div>
    <button type="submit">Enviar</button>
  </form>
  <p><a href="/feedbacks/lista">Ver feedbacks enviados</a></p>
</body>
</html>`);
});

app.post('/feedbacks/enviar', (req, res) => {
  const nome = (req.body.nome || '').trim();
  const comentario = (req.body.comentario || '').trim();

  if (nome && comentario) {
    feedbacks.push({
      id: nextId++,
      nome,
      comentario,
    });
  }

  res.redirect('/feedbacks/lista');
});

app.get('/feedbacks/lista', (req, res) => {
  const feedbackItems = feedbacks.length
    ? feedbacks
        .map(
          (feedback) => `
      <li>
        <strong>${escapeHtml(feedback.nome)}</strong><br />
        <span>${escapeHtml(feedback.comentario)}</span>
        <form action="/feedbacks/remover" method="POST" style="margin-top: 0.5rem;">
          <input type="hidden" name="id" value="${feedback.id}" />
          <button type="submit">Remover</button>
        </form>
      </li>`
        )
        .join('')
    : '<li>Nenhum feedback enviado ainda.</li>';

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Feedbacks Enviados</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 2rem auto; max-width: 700px; }
    ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 1.5rem; }
    li { border: 1px solid #ccc; padding: 1rem; border-radius: 0.5rem; }
    form { display: inline-block; }
    button { margin-top: 0.5rem; padding: 0.4rem 0.8rem; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Feedbacks Enviados</h1>
  <ul>
    ${feedbackItems}
  </ul>
  <p><a href="/">Voltar para o formulário</a></p>
</body>
</html>`);
});

app.post('/feedbacks/remover', (req, res) => {
  const id = parseInt(req.body.id, 10);
  const index = feedbacks.findIndex((feedback) => feedback.id === id);
  if (index !== -1) {
    feedbacks.splice(index, 1);
  }

  res.redirect('/feedbacks/lista');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
