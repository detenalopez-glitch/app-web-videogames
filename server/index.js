require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const taskRoutes = require('./src/routes/task.routes');

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());

// ✅ Rutas de la API
app.use('/api/v1/tasks', taskRoutes);

// ✅ Servir frontend
app.use(express.static(path.join(__dirname, '..')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Middleware de errores
app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});