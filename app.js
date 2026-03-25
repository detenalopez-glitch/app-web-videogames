import { getTasks, createTask, deleteTask } from "./src/api/client.js";

const formularioJuego = document.getElementById("form-juego");
const inputNombreJuego = document.getElementById("input-juego");
const inputDescripcionJuego = document.getElementById("input-descripcion");
const inputPorcentajeJuego = document.getElementById("input-porcentaje");
const listaJuegosCompletos = document.getElementById("lista-juegos-100");
const listaJuegosIncompletos = document.getElementById("lista-juegos-incompletos");

let juegosDelUsuario = [];
let usuarioActual = "";
// Estado del filtro
let filtroEstado = "todos";
let filtroBusqueda = "";

// ----- Estado de red (loading / success / error) -----
let redCargando = false;

function setLoadingUI() {
  redCargando = true;
  if (listaJuegosCompletos) {
    listaJuegosCompletos.innerHTML = '<p class="text-sm text-blue-200">Cargando...</p>';
  }
  if (listaJuegosIncompletos) {
    listaJuegosIncompletos.innerHTML = '<p class="text-sm text-blue-200">Cargando...</p>';
  }

  // Deshabilita el submit mientras llega la respuesta
  if (formularioJuego) {
    const boton = formularioJuego.querySelector('button[type="submit"]');
    if (boton) boton.disabled = true;
  }
}

function setErrorUI(mensaje) {
  redCargando = false;
  if (listaJuegosCompletos) {
    listaJuegosCompletos.innerHTML = `<p class="text-sm text-red-300">Error: ${mensaje}</p>`;
  }
  if (listaJuegosIncompletos) {
    listaJuegosIncompletos.innerHTML = `<p class="text-sm text-red-300">Error: ${mensaje}</p>`;
  }

  if (formularioJuego) {
    const boton = formularioJuego.querySelector('button[type="submit"]');
    if (boton) boton.disabled = false;
  }
}

function setSuccessUI() {
  redCargando = false;
  if (formularioJuego) {
    const boton = formularioJuego.querySelector('button[type="submit"]');
    if (boton) boton.disabled = false;
  }
}
/**
 * Filtra los juegos por nombre según el texto del buscador.
 * @param {Array} juegos - Lista de juegos.
 * @param {string} texto - Texto a buscar.
 * @returns {Array} Juegos filtrados.
 */
function filtrarPorNombre(juegos, texto) {
    if (!texto) return juegos;
    return juegos.filter(juego => juego.nombre.toLowerCase().includes(texto.toLowerCase()));
}

// Escucha el input del buscador
document.addEventListener("DOMContentLoaded", function() {
    const buscador = document.getElementById("buscador-juegos");
    if (buscador) {
        buscador.addEventListener("input", function(e) {
            filtroBusqueda = e.target.value;
            renderizarJuegos();
        });
    }
});

/**
 * Normaliza un valor de porcentaje a un número entre 0 y 100.
 * @param {number|string} valor - Valor introducido por el usuario.
 * @returns {number} Porcentaje limitado entre 0 y 100.
 */
function normalizarPorcentaje(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return 0;
    return Math.min(100, Math.max(0, numero));
}

/**
 * Devuelve las clases de estilo correspondientes a un porcentaje.
 * @param {number} porcentaje - Porcentaje del progreso del juego.
 * @returns {{ borderClass: string, progressColor: string }} Clases CSS para borde y barra de progreso.
 */
function obtenerEstilosPorcentaje(porcentaje) {
    if (porcentaje === 100) {
        return {
            borderClass: "border-green-500",
            progressColor: "bg-green-500",
        };
    }
    if (porcentaje >= 50) {
        return {
            borderClass: "border-orange-500",
            progressColor: "bg-orange-500",
        };
    }
    return {
        borderClass: "border-red-500",
        progressColor: "bg-red-500",
    };
}

/**
 * En esta versión el frontend depende del backend para persistir.
 * No usamos localStorage para “usuario” (backend no maneja usuario).
 * @returns {string}
 */
function obtenerUsuario() {
    usuarioActual = "anonimo";
    return usuarioActual;
}

/**
 * Crea el elemento DOM de una tarjeta de juego.
 * @param {{ nombre: string, descripcion: string, porcentaje: number }} juego - Datos del juego.
 * @param {number} porcentaje - Porcentaje normalizado del juego.
 * @param {{ borderClass: string, progressColor: string }} estilos - Clases de estilo según el porcentaje.
 * @param {() => void} onEliminarClick - Callback que se ejecuta al hacer clic en "Eliminar".
 * @returns {HTMLDivElement} Tarjeta lista para insertarse en el DOM.
 */
function crearTarjetaJuego(juego, porcentaje, estilos, onEliminarClick) {
    const { borderClass, progressColor } = estilos;

    const tarjeta = document.createElement("div");
    tarjeta.className = `relative rounded-xl border-4 ${borderClass} bg-gray-800 bg-opacity-90 p-8 mb-6 shadow-lg flex flex-col`;

    tarjeta.innerHTML = `
        <div class="flex flex-col gap-2">
            <h4 class="text-lg font-bold mb-1">${juego.nombre}</h4>
            <p class="text-base mb-3">${juego.descripcion}</p>
            <div class="w-full bg-gray-700 rounded-full h-6 mt-2 mb-2 overflow-hidden">
                <div class="h-6 rounded-full flex items-center justify-center font-bold text-white text-sm transition-all duration-500 ${progressColor}"
                    style="width: ${porcentaje}%; min-width: 2.5rem;">
                    ${porcentaje}%
                </div>
            </div>
            <div class="flex justify-between items-center gap-2 px-2 pb-4 pt-3 mt-auto">
                <button class="btn-eliminar bg-gray-700 hover:bg-red-700 text-white text-xs px-3 py-1 rounded-lg font-bold shadow transition w-1/2 mr-1">
                    <span style="font-size:1.1em;vertical-align:middle;">🗑️</span> Eliminar
                </button>
                <button class="btn-editar bg-gray-700 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg font-bold shadow transition w-1/2 ml-1">
                    <span style="font-size:1.1em;vertical-align:middle;">✏️</span> Editar
                </button>
            </div>
    `;
    // Botón editar
    const botonEditar = tarjeta.querySelector(".btn-editar");
    if (botonEditar) {
        botonEditar.addEventListener("click", function() {
            mostrarFormularioEdicion(juego);
        });
    }

    const botonEliminar = tarjeta.querySelector(".btn-eliminar");
    if (botonEliminar) {
        botonEliminar.addEventListener("click", onEliminarClick);
    }

    return tarjeta;
}

/**
 * Maneja el envío del formulario de juegos: valida datos y agrega un nuevo juego.
 * @param {SubmitEvent} e - Evento de envío del formulario.
 */
formularioJuego.addEventListener("submit", function(e) {
    e.preventDefault();

    const nombreJuego = inputNombreJuego.value.trim();
    const descripcionJuego = inputDescripcionJuego.value.trim();
    const valorPorcentaje = inputPorcentajeJuego.value.trim();

    // Validación: nombre obligatorio
    if (!nombreJuego) {
        alert("Por favor, ingresa el nombre del juego.");
        inputNombreJuego.focus();
        return;
    }

    // Validación: descripción mínima
    if (descripcionJuego.length < 3) {
        alert("La descripción debe tener al menos 3 caracteres.");
        inputDescripcionJuego.focus();
        return;
    }

    // Validación: porcentaje numérico entre 0 y 100
    const numeroPorcentaje = Number(valorPorcentaje);
    if (Number.isNaN(numeroPorcentaje)) {
        alert("Por favor, ingresa un porcentaje numérico entre 0 y 100.");
        inputPorcentajeJuego.focus();
        return;
    }
    if (numeroPorcentaje < 0 || numeroPorcentaje > 100) {
        alert("El porcentaje debe estar entre 0 y 100.");
        inputPorcentajeJuego.focus();
        return;
    }

    // Validación: evitar juegos duplicados por nombre (ignorando mayúsculas/minúsculas)
    const juegoExistente = juegosDelUsuario.some(
        (juego) => juego.nombre.toLowerCase() === nombreJuego.toLowerCase()
    );
    if (juegoExistente) {
        alert("Ya tienes un juego con ese nombre en la lista.");
        inputNombreJuego.focus();
        return;
    }

    const porcentajeNormalizado = normalizarPorcentaje(numeroPorcentaje);

    const nuevoJuego = {
        nombre: nombreJuego,
        descripcion: descripcionJuego,
        porcentaje: porcentajeNormalizado,
    };

    agregarJuego(nuevoJuego);

    inputNombreJuego.value = "";
    inputDescripcionJuego.value = "";
    inputPorcentajeJuego.value = "";
}); // Función para agregar un juego

/**
 * Agrega un juego al listado del usuario y actualiza la vista y el almacenamiento.
 * @param {{ nombre: string, descripcion: string, porcentaje: number }} juego - Juego a añadir.
 */
function agregarJuego(juego) {
    setLoadingUI();
    // Llamada al backend para crear la tarea con todos los campos necesarios
    createTask({
        nombre: juego.nombre,
        descripcion: juego.descripcion,
        porcentaje: juego.porcentaje
    })
        .then(() => cargarJuegosDesdeBackend())
        .then(() => setSuccessUI())
        .catch((err) => setErrorUI(err?.message || "Error al crear la tarea"));
}
/**
 * Renderiza en el DOM la lista de juegos completos e incompletos del usuario actual.
 */
function renderizarJuegos() {
    listaJuegosCompletos.innerHTML = "";
    listaJuegosIncompletos.innerHTML = "";

    // Filtrar por estado
    let juegosFiltrados = juegosDelUsuario;
    if (filtroEstado === "completados") {
        juegosFiltrados = juegosFiltrados.filter(j => normalizarPorcentaje(j.porcentaje) === 100);
    } else if (filtroEstado === "incompletos") {
        juegosFiltrados = juegosFiltrados.filter(j => normalizarPorcentaje(j.porcentaje) < 100);
    }
    // Filtrar por nombre
    juegosFiltrados = filtrarPorNombre(juegosFiltrados, filtroBusqueda);

    juegosFiltrados.forEach(function(juego, index) {
        const porcentaje = normalizarPorcentaje(juego.porcentaje);
        const estilos = obtenerEstilosPorcentaje(porcentaje);
        const tarjetaJuego = crearTarjetaJuego(
            juego,
            porcentaje,
            estilos,
            function () {
                confirmarEliminar(juego.id);
            }
        );
        tarjetaJuego.dataset.index = index;
        if (porcentaje === 100) {
            listaJuegosCompletos.appendChild(tarjetaJuego);
        } else {
            listaJuegosIncompletos.appendChild(tarjetaJuego);
        }
    });
}

// Formulario flotante para editar juego
function mostrarFormularioEdicion(juego) {
    // Crear fondo modal
    const fondo = document.createElement("div");
    fondo.style.position = "fixed";
    fondo.style.top = "0";
    fondo.style.left = "0";
    fondo.style.width = "100vw";
    fondo.style.height = "100vh";
    fondo.style.background = "rgba(0,0,0,0.5)";
    fondo.style.zIndex = "1000";

    // Crear formulario
    const form = document.createElement("form");
    form.className = "bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col gap-4 max-w-md mx-auto mt-32";
    form.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Editar juego</h3>
        <input type="text" name="nombre" value="${juego.nombre}" class="border p-2 rounded" required>
        <input type="text" name="descripcion" value="${juego.descripcion}" class="border p-2 rounded" required>
        <input type="number" name="porcentaje" value="${juego.porcentaje}" min="0" max="100" class="border p-2 rounded w-28" required>
        <div class="flex gap-2">
            <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">Guardar</button>
            <button type="button" class="bg-gray-400 hover:bg-gray-500 text-black px-4 py-2 rounded btn-cerrar">Cancelar</button>
        </div>
    `;

    fondo.appendChild(form);
    document.body.appendChild(fondo);

    // Cerrar modal
    form.querySelector(".btn-cerrar").addEventListener("click", function() {
        document.body.removeChild(fondo);
    });

    // Guardar cambios
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nombre = form.nombre.value.trim();
        const descripcion = form.descripcion.value.trim();
        const porcentaje = normalizarPorcentaje(form.porcentaje.value);

        if (!nombre) {
            alert("El nombre es obligatorio.");
            return;
        }
        if (descripcion.length < 3) {
            alert("La descripción debe tener al menos 3 caracteres.");
            return;
        }
        if (porcentaje < 0 || porcentaje > 100) {
            alert("El porcentaje debe estar entre 0 y 100.");
            return;
        }

        // Evitar duplicados por nombre (excepto el mismo juego)
        const index = juegosDelUsuario.findIndex(j => j.nombre === juego.nombre && j.descripcion === juego.descripcion && j.porcentaje === juego.porcentaje);
        if (index !== -1) {
            // Verificar si el nuevo nombre ya existe en otro juego
            const nombreDuplicado = juegosDelUsuario.some((j, i) => i !== index && j.nombre.toLowerCase() === nombre.toLowerCase());
            if (nombreDuplicado) {
                alert("Ya tienes un juego con ese nombre.");
                return;
            }
            juegosDelUsuario[index] = { nombre, descripcion, porcentaje };
            guardarEnLocalStorage();
            renderizarJuegos();
        }
        document.body.removeChild(fondo);
    });
}

/**
 * Muestra un cuadro de confirmación antes de eliminar un juego.
 * @param {number} index - Índice del juego en el arreglo `juegosDelUsuario`.
 */
function confirmarEliminar(id) {
    mostrarPopupEliminar(function(confirmado) {
        if (confirmado) {
            eliminarJuego(id);
        }
    });

// Popup para confirmar eliminación
function mostrarPopupEliminar(callback) {
    const fondo = document.createElement("div");
    fondo.style.position = "fixed";
    fondo.style.top = "0";
    fondo.style.left = "0";
    fondo.style.width = "100vw";
    fondo.style.height = "100vh";
    fondo.style.background = "rgba(80,80,80,0.5)";
    fondo.style.zIndex = "1000";

    const modal = document.createElement("div");
    modal.className = "popup-centro bg-gray-200 dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col gap-4";
    modal.style.position = "absolute";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.innerHTML = `
        <h3 class="text-lg font-bold mb-2">¿Seguro que quieres eliminar este juego?</h3>
        <div class="flex gap-2">
            <button class="btn-popup btn-si">Sí</button>
            <button class="btn-popup btn-no">No</button>
        </div>
    `;
    fondo.appendChild(modal);
    document.body.appendChild(fondo);
    // Estilos botones
    fondo.querySelectorAll('.btn-popup').forEach(btn => {
        btn.style.border = '2px solid #8B5CF6'; // morado
        btn.style.background = 'transparent';
        btn.style.color = '#fff';
        btn.style.padding = '0.5rem 1.5rem';
        btn.style.borderRadius = '0.5rem';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'background 0.2s';
        btn.addEventListener('mouseover', () => {
            btn.style.background = '#8B5CF6';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.background = 'transparent';
        });
    });
    modal.querySelector(".btn-si").addEventListener("click", function() {
        document.body.removeChild(fondo);
        callback(true);
    });
    modal.querySelector(".btn-no").addEventListener("click", function() {
        document.body.removeChild(fondo);
        callback(false);
    });
}
}
/**
 * Elimina un juego por índice y actualiza almacenamiento y renderizado.
 * @param {number} index - Índice del juego a eliminar.
 */
function eliminarJuego(index) {
    setLoadingUI();
    // Se espera que index sea el id real de la tarea en el backend
    deleteTask(index)
        .then(() => cargarJuegosDesdeBackend())
        .then(() => setSuccessUI())
        .catch((err) => setErrorUI(err?.message || "Error al eliminar la tarea"));
}
/**
 * Persistencia local ya no se usa: el backend es la fuente de la verdad.
 */
function guardarEnLocalStorage() {
    // No-op: la persistencia ahora es manejada por el backend
}

function mapearTareaATareaUI(tarea) {
    return {
        id: tarea.id,
        nombre: tarea.titulo,
        descripcion: "",
        porcentaje: tarea.progreso,
    };
}

/**
 * Carga las tareas desde el backend y refresca la UI.
 * Maneja estados: loading / success / error.
 */
async function cargarJuegosDesdeBackend() {
    setLoadingUI();
    try {
        const tareas = await getTasks();
        juegosDelUsuario = tareas.map(mapearTareaATareaUI);
        renderizarJuegos();
        setSuccessUI();
    } catch (err) {
        setErrorUI(err?.message || "Error al cargar las tareas");
    }
}
//cargar datos al iniciar la página
window.addEventListener("DOMContentLoaded", function() {
    // Sidebar menú (abre/cierra con el mismo botón, sin depender de clases de Tailwind)
    const sidebar = document.getElementById("sidebarMenu");
    const menuToggle = document.getElementById("menuToggle");
    let menuAbierto = false;

    if (sidebar) {
        // Aseguramos estado inicial oculto por si las clases CSS no están aplicadas
        sidebar.style.transform = "translateX(-100%)";
    }

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            menuAbierto = !menuAbierto;
            sidebar.style.transform = menuAbierto ? "translateX(0)" : "translateX(-100%)";
        });
    }

    // Opciones de menú: al hacer clic, se cierra el sidebar
    const menuInicio = document.getElementById("menuInicio");
    const menuJuegos100 = document.getElementById("menuJuegos100");
    const menuPorCompletar = document.getElementById("menuPorCompletar");
    [menuInicio, menuJuegos100, menuPorCompletar].forEach(item => {
        if (item && sidebar) {
            item.addEventListener("click", () => {
                menuAbierto = false;
                sidebar.style.transform = "translateX(-100%)";
                // Aquí puedes agregar lógica para mostrar la sección correspondiente
            });
        }
    });
    // Filtros de estado
    const radiosFiltro = [
        document.getElementById("filtro-todos"),
        document.getElementById("filtro-completados"),
        document.getElementById("filtro-incompletos")
    ];
    radiosFiltro.forEach(radio => {
        if (radio) {
            radio.addEventListener("change", function() {
                filtroEstado = radio.value;
                renderizarJuegos();
            });
        }
    });

    // Carga desde backend (sin localStorage)
    cargarJuegosDesdeBackend();

    const botonDark = document.getElementById("darkModeToggle");
    if (botonDark) {
        botonDark.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
        });
    }
});