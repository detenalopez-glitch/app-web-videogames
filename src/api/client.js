// Cliente para consumir la API desde el frontend
// Cambia la URL base según tu entorno


const API_BASE = "http://localhost:3000/tasks";


export async function getTasks() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al obtener tareas");
    return res.json();
}


export async function createTask({ titulo, progreso, descripcion }) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, progreso, descripcion })
    });
    if (!res.ok) throw new Error("Error al crear tarea");
    return res.json();
}


export async function deleteTask(id) {
    const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE"
    });
    if (!res.ok) throw new Error("Error al eliminar tarea");
    return res.json();
}


