const fs = require("fs");
const path = require("path");

// ✅ Sube dos niveles desde services/ → server/data/
const DATA_FILE = path.join(__dirname, "..", "..", "data", "tasks.json");

let tasks = [];
let idCounter = 1;

function cargarDesdeDisco() {
    try {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return;
        tasks = parsed;
        const maxId = tasks.reduce((max, t) => (typeof t?.id === "number" ? Math.max(max, t.id) : max), 0);
        idCounter = maxId + 1;
    } catch (err) {
        if (err?.code !== "ENOENT") {
            console.error("Error leyendo tasks.json:", err);
        }
    }
}

function guardarEnDisco() {
    try {
        const dir = path.dirname(DATA_FILE);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf-8");
    } catch (err) {
        // En Vercel el filesystem es de solo lectura, los datos solo persisten en memoria
        console.warn("No se pudo guardar en disco:", err.message);
    }
}

cargarDesdeDisco();

const obtenerTodas = () => tasks;

const crearTarea = (data) => {
    const nuevaTarea = {
        id: idCounter++,
        titulo: data.titulo,
        progreso: data.progreso || 0,
        descripcion: data.descripcion || ""
    };
    tasks.push(nuevaTarea);
    guardarEnDisco();
    return nuevaTarea;
};

const eliminarTarea = (id) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) throw new Error('NOT_FOUND');
    tasks.splice(index, 1);
    guardarEnDisco();
};

module.exports = { obtenerTodas, crearTarea, eliminarTarea };