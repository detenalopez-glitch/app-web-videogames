const taskService = require('../services/task.service');

// GET /tasks
const obtenerTareas = (req, res) => {
  const tasks = taskService.obtenerTodas();
  res.json(tasks);
};

// POST /tasks
const crearTarea = (req, res, next) => {
const { titulo, progreso } = req.body;

  // 🔴 VALIDACIÓN → RESPUESTA DIRECTA (400)
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    return res.status(400).json({
      error: 'El título es obligatorio y debe tener al menos 3 caracteres'
    });
  }

  if (progreso !== undefined && typeof progreso !== 'number') {
    return res.status(400).json({
      error: 'El progreso debe ser un número'
    });
  }

  try {
    const nuevaTarea = taskService.crearTarea({ titulo, progreso });
    res.status(201).json(nuevaTarea);
  } catch (error) {
    next(error); // solo errores reales
  }
};

// DELETE /tasks/:id
const eliminarTarea = (req, res, next) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      error: 'ID inválido'
    });
  }

  try {
    taskService.eliminarTarea(id);
    res.json({ success: true });
  } catch (error) {
    next(error); // 🔥 clave
  }
};

module.exports = {
  obtenerTareas,
  crearTarea,
  eliminarTarea
};