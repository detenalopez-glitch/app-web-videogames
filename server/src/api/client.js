const API_URL = "http://localhost:3000/api/v1/tasks";

/**
 * GET /api/v1/tasks
 * @returns {Promise<Array<{id:number, titulo:string, progreso:number}>>}
 */
export async function getTasks() {
  const res = await fetch(API_URL, { method: "GET" });
  if (!res.ok) {
    // Intenta obtener mensaje de error del servidor
    let data = {};
    try {
      data = await res.json();
    } catch (_) {}
    throw new Error(data.error || "Error al obtener las tareas");
  }
  return res.json();
}

/**
 * POST /api/v1/tasks
 * @param {{ titulo: string, progreso: number }} task
 * @returns {Promise<{id:number, titulo:string, progreso:number}>}
 */
export async function createTask(task) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });

  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch (_) {}
    throw new Error(data.error || "Error al crear la tarea");
  }

  return res.json();
}

/**
 * DELETE /api/v1/tasks/:id
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    let data = {};
    try {
      data = await res.json();
    } catch (_) {}
    throw new Error(data.error || "Error al eliminar la tarea");
  }
}