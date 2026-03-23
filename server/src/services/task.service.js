let tasks = [];
let idCounter = 1;

// Obtener todas las tareas
const obtenerTodas = () => {
  return tasks;
};

// Crear tarea
const crearTarea = (data) => {
  const nuevaTarea = {
    id: idCounter++,
    titulo: data.titulo,
    progreso: data.progreso || 0
  };

  tasks.push(nuevaTarea);
  return nuevaTarea;
};

// Eliminar tarea
const eliminarTarea = (id) => {
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    throw new Error('NOT_FOUND');
  }

  tasks.splice(index, 1);
};

module.exports = {
  obtenerTodas,
  crearTarea,
  eliminarTarea
};