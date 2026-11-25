const express = require('express');
const tasks = require('./routes/tasks');

const app = express();

app.use((req, res, next) => {
  res.on('finish', () => {
    console.log(req.method, req.originalUrl, res.statusCode);
  });
  next();
});

app.use(express.json({ limit: '16kb' }));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/tasks', tasks);
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Request body is too large' });
  }
  const status = error.status >= 400 && error.status < 500 ? error.status : 500;
  return res.status(status).json({ error: status === 500 ? 'Internal server error' : 'Invalid request' });
});

module.exports = app;
