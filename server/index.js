require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path'); // ← faltaba esto

const taskRoutes = require('./src/routes/task.routes');

const PORT = process.env.PORT || 3000;
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../'))); // ← corregido pp → app

// Rutas de la API
app.use(express.static(path.join(__dirname, '../')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Middleware de errores
app.use((err, req, res, next) => {
  if (err.message === 'NOT_FOUND') {
    return res.status(404).json({
      error: 'Recurso no encontrado'
    });
  }
  console.error(err);
  res.status(500).json({
    error: 'Error interno del servidor'
  });
});

// Arranque del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});