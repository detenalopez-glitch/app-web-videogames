const express = require('express');
const router = express.Router();

const taskController = require('../controllers/task.controller');

// GET todas las tareas
router.get('/', taskController.obtenerTareas);

// POST crear tarea
router.post('/', taskController.crearTarea);

// DELETE eliminar tarea
router.delete('/:id', taskController.eliminarTarea);

module.exports = router;