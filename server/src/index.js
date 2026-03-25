require('dotenv').config();
const express = require('express');
const cors = require('cors');

const taskRoutes = require('./routes/task.routes');

const PORT = process.env.PORT || 4000;
const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());

// Rutas de la API
app.use('/api/v1/tasks', taskRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

app.use((err, req, res, next) => {

// 🔥 4. middleware de errores (AQUÍ)
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
});
// Arranque del servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
