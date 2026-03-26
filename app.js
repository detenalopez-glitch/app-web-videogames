import { getTasks, createTask, deleteTask } from "./src/api/client.js";

const formularioJuego = document.getElementById("form-juego");
const inputNombreJuego = document.getElementById("input-juego");
const inputDescripcionJuego = document.getElementById("input-descripcion");
const inputPorcentajeJuego = document.getElementById("input-porcentaje");
const listaJuegosCompletos = document.getElementById("lista-juegos-100");
const listaJuegosIncompletos = document.getElementById("lista-juegos-incompletos");

let juegosDelUsuario = [];
let usuarioActual = "";
let filtroEstado = "todos";
let filtroBusqueda = "";
let estadoCarga = false;
let estadoError = "";

function filtrarPorNombre(juegos, texto) {
    if (!texto) return juegos;
    return juegos.filter(juego => juego.nombre.toLowerCase().includes(texto.toLowerCase()));
}

function normalizarPorcentaje(valor) {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return 0;
    return Math.min(100, Math.max(0, numero));
}

function obtenerEstilosPorcentaje(porcentaje) {
    if (porcentaje === 100) {
        return { borderClass: "border-green-500", progressColor: "bg-green-500" };
    }
    if (porcentaje >= 50) {
        return { borderClass: "border-orange-500", progressColor: "bg-orange-500" };
    }
    return { borderClass: "border-red-500", progressColor: "bg-red-500" };
}


// Solicita el usuario solo una vez al iniciar la app
function solicitarUsuarioAlInicio(callback) {
    const usuarioGuardado = localStorage.getItem("usuarioApp");
    if (usuarioGuardado) {
        usuarioActual = usuarioGuardado;
        callback();
    } else {
        mostrarPopupUsuario(function(nombreUsuario) {
            usuarioActual = nombreUsuario || "anonimo";
            localStorage.setItem("usuarioApp", usuarioActual);
            callback();
        });
    }
}

function mostrarPopupUsuario(callback) {
    const fondo = document.createElement("div");
    fondo.style.position = "fixed";
    fondo.style.top = "0";
    fondo.style.left = "0";
    fondo.style.width = "100vw";
    fondo.style.height = "100vh";
    fondo.style.background = "rgba(80,80,80,0.5)";
    fondo.style.zIndex = "1000";

    const form = document.createElement("form");
    form.className = "popup-centro bg-gray-200 dark:bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col gap-4";
    form.style.position = "absolute";
    form.style.top = "50%";
    form.style.left = "50%";
    form.style.transform = "translate(-50%, -50%)";
    form.innerHTML = `
        <h3 class="text-lg font-bold mb-2">Ingresa tu nombre de usuario</h3>
        <input type="text" name="usuario" class="border p-2 rounded" required autofocus>
        <div class="flex gap-2">
            <button type="submit" class="btn-popup">Aceptar</button>
            <button type="button" class="btn-popup btn-cerrar">Cancelar</button>
        </div>
    `;
    fondo.appendChild(form);
    document.body.appendChild(fondo);

    fondo.querySelectorAll('.btn-popup').forEach(btn => {
        btn.style.border = '2px solid #8B5CF6';
        btn.style.background = 'transparent';
        btn.style.color = '#fff';
        btn.style.padding = '0.5rem 1.5rem';
        btn.style.borderRadius = '0.5rem';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'background 0.2s';
        btn.addEventListener('mouseover', () => { btn.style.background = '#8B5CF6'; });
        btn.addEventListener('mouseout', () => { btn.style.background = 'transparent'; });
    });

    form.querySelector(".btn-cerrar").addEventListener("click", function() {
        document.body.removeChild(fondo);
        callback("anonimo");
    });
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nombre = form.usuario.value.trim();
        document.body.removeChild(fondo);
        callback(nombre);
    });
}

// ✅ Carga juegos desde la API
async function cargarJuegos() {
    estadoCarga = true;
    estadoError = "";
    renderizarJuegos();
    try {
        const tareas = await getTasks();
        juegosDelUsuario = tareas.map(t => ({
            id: t.id,
            nombre: t.titulo,
            descripcion: t.descripcion || "",
            porcentaje: t.progreso
        }));
    } catch (error) {
        console.error("Error cargando juegos:", error);
        juegosDelUsuario = [];
        estadoError = "Error al cargar los juegos. Intenta de nuevo.";
    } finally {
        estadoCarga = false;
        renderizarJuegos();
    }
}

function crearTarjetaJuego(juego, porcentaje, estilos, onEliminarClick) {
    const { borderClass, progressColor } = estilos;
    const tarjeta = document.createElement("div");
    tarjeta.className = `relative rounded-xl border-4 ${borderClass} bg-gray-800 bg-opacity-90 p-8 mb-6 shadow-lg flex flex-col transition-opacity duration-500 opacity-0`;
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
        </div>
    `;

    tarjeta.querySelector(".btn-editar").addEventListener("click", function() {
        mostrarFormularioEdicion(juego);
    });
    tarjeta.querySelector(".btn-eliminar").addEventListener("click", onEliminarClick);

    // Forzar reflujo y luego hacer visible para activar la transición
    setTimeout(() => {
        tarjeta.style.opacity = '1';
    }, 10);
    return tarjeta;
}

formularioJuego.addEventListener("submit", function(e) {
    e.preventDefault();

    const nombreJuego = inputNombreJuego.value.trim();
    const descripcionJuego = inputDescripcionJuego.value.trim();
    const valorPorcentaje = inputPorcentajeJuego.value.trim();

    if (!nombreJuego) {
        alert("Por favor, ingresa el nombre del juego.");
        inputNombreJuego.focus();
        return;
    }
    if (descripcionJuego.length < 3) {
        alert("La descripción debe tener al menos 3 caracteres.");
        inputDescripcionJuego.focus();
        return;
    }
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
    const juegoExistente = juegosDelUsuario.some(
        (juego) => juego.nombre.toLowerCase() === nombreJuego.toLowerCase()
    );
    if (juegoExistente) {
        alert("Ya tienes un juego con ese nombre en la lista.");
        inputNombreJuego.focus();
        return;
    }

    const porcentajeNormalizado = normalizarPorcentaje(numeroPorcentaje);
    agregarJuego({ nombre: nombreJuego, descripcion: descripcionJuego, porcentaje: porcentajeNormalizado });

    inputNombreJuego.value = "";
    inputDescripcionJuego.value = "";
    inputPorcentajeJuego.value = "";
});

// ✅ Agrega juego via API
async function agregarJuego(juego) {
    try {
        const creado = await createTask({
            titulo: juego.nombre,
            progreso: juego.porcentaje,
            descripcion: juego.descripcion
        });
        juego.id = creado.id;
        juegosDelUsuario.push(juego);

        // Verificar si el juego cumple los filtros activos
        let cumpleFiltro = true;
        if (filtroEstado === "completados" && normalizarPorcentaje(juego.porcentaje) !== 100) cumpleFiltro = false;
        if (filtroEstado === "incompletos" && normalizarPorcentaje(juego.porcentaje) === 100) cumpleFiltro = false;
        if (filtroBusqueda && !juego.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase())) cumpleFiltro = false;

        if (cumpleFiltro) {
            const porcentaje = normalizarPorcentaje(juego.porcentaje);
            const estilos = obtenerEstilosPorcentaje(porcentaje);
            const tarjetaJuego = crearTarjetaJuego(
                juego,
                porcentaje,
                estilos,
                function() { confirmarEliminar(juegosDelUsuario.length - 1); }
            );
            tarjetaJuego.dataset.index = juegosDelUsuario.length - 1;
            if (porcentaje === 100) {
                listaJuegosCompletos.appendChild(tarjetaJuego);
            } else {
                listaJuegosIncompletos.appendChild(tarjetaJuego);
            }
        }
    } catch (error) {
        alert("Error al guardar el juego: " + error.message);
    }
}

function renderizarJuegos() {
    listaJuegosCompletos.innerHTML = "";
    listaJuegosIncompletos.innerHTML = "";

    // Estado de carga
    if (estadoCarga) {
        const loader = document.createElement("div");
        loader.className = "text-center text-lg text-purple-500 py-8 animate-pulse";
        loader.textContent = "Cargando juegos...";
        listaJuegosCompletos.appendChild(loader);
        listaJuegosIncompletos.appendChild(loader.cloneNode(true));
        return;
    }

    // Estado de error
    if (estadoError) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "text-center text-lg text-red-500 py-8";
        errorDiv.textContent = estadoError;
        listaJuegosCompletos.appendChild(errorDiv);
        listaJuegosIncompletos.appendChild(errorDiv.cloneNode(true));
        return;
    }

    let juegosFiltrados = juegosDelUsuario;
    if (filtroEstado === "completados") {
        juegosFiltrados = juegosFiltrados.filter(j => normalizarPorcentaje(j.porcentaje) === 100);
    } else if (filtroEstado === "incompletos") {
        juegosFiltrados = juegosFiltrados.filter(j => normalizarPorcentaje(j.porcentaje) < 100);
    }
    juegosFiltrados = filtrarPorNombre(juegosFiltrados, filtroBusqueda);

    juegosFiltrados.forEach(function(juego, index) {
        const porcentaje = normalizarPorcentaje(juego.porcentaje);
        const estilos = obtenerEstilosPorcentaje(porcentaje);
        const tarjetaJuego = crearTarjetaJuego(juego, porcentaje, estilos, function() {
            confirmarEliminar(index);
        });
        tarjetaJuego.dataset.index = index;
        if (porcentaje === 100) {
            listaJuegosCompletos.appendChild(tarjetaJuego);
        } else {
            listaJuegosIncompletos.appendChild(tarjetaJuego);
        }
    });
}

function mostrarFormularioEdicion(juego) {
    const fondo = document.createElement("div");
    fondo.style.position = "fixed";
    fondo.style.top = "0";
    fondo.style.left = "0";
    fondo.style.width = "100vw";
    fondo.style.height = "100vh";
    fondo.style.background = "rgba(0,0,0,0.5)";
    fondo.style.zIndex = "1000";

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

    form.querySelector(".btn-cerrar").addEventListener("click", function() {
        document.body.removeChild(fondo);
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const nombre = form.nombre.value.trim();
        const descripcion = form.descripcion.value.trim();
        const porcentaje = normalizarPorcentaje(form.porcentaje.value);

        if (!nombre) { alert("El nombre es obligatorio."); return; }
        if (descripcion.length < 3) { alert("La descripción debe tener al menos 3 caracteres."); return; }

        const index = juegosDelUsuario.findIndex(j => j.id === juego.id);
        if (index !== -1) {
            const nombreDuplicado = juegosDelUsuario.some((j, i) => i !== index && j.nombre.toLowerCase() === nombre.toLowerCase());
            if (nombreDuplicado) { alert("Ya tienes un juego con ese nombre."); return; }
            juegosDelUsuario[index] = { ...juego, nombre, descripcion, porcentaje };
            // Actualizar solo la tarjeta correspondiente
            const selector = `[data-index="${index}"]`;
            const tarjetaAntigua = document.querySelector(selector);
            if (tarjetaAntigua && tarjetaAntigua.parentNode) {
                const estilos = obtenerEstilosPorcentaje(porcentaje);
                const nuevaTarjeta = crearTarjetaJuego(juegosDelUsuario[index], porcentaje, estilos, function() { confirmarEliminar(index); });
                nuevaTarjeta.dataset.index = index;
                tarjetaAntigua.parentNode.replaceChild(nuevaTarjeta, tarjetaAntigua);
            }
        }
        document.body.removeChild(fondo);
    });
}

function confirmarEliminar(index) {
    mostrarPopupEliminar(function(confirmado) {
        if (confirmado) eliminarJuego(index);
    });
}

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

    fondo.querySelectorAll('.btn-popup').forEach(btn => {
        btn.style.border = '2px solid #8B5CF6';
        btn.style.background = 'transparent';
        btn.style.color = '#fff';
        btn.style.padding = '0.5rem 1.5rem';
        btn.style.borderRadius = '0.5rem';
        btn.style.fontWeight = 'bold';
        btn.style.transition = 'background 0.2s';
        btn.addEventListener('mouseover', () => { btn.style.background = '#8B5CF6'; });
        btn.addEventListener('mouseout', () => { btn.style.background = 'transparent'; });
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


// ✅ Elimina juego via API y DOM incremental
async function eliminarJuego(index) {
    const juego = juegosDelUsuario[index];
    try {
        await deleteTask(juego.id);
        juegosDelUsuario.splice(index, 1);
        // Eliminar solo la tarjeta correspondiente del DOM
        const selector = `[data-index="${index}"]`;
        const tarjeta = document.querySelector(selector);
        if (tarjeta && tarjeta.parentNode) {
            tarjeta.parentNode.removeChild(tarjeta);
        }
        // Reasignar data-index a las tarjetas restantes
        document.querySelectorAll('[data-index]').forEach((el, i) => {
            el.dataset.index = i;
        });
    } catch (error) {
        alert("Error al eliminar: " + error.message);
    }
}

window.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById("sidebarMenu");
    const menuToggle = document.getElementById("menuToggle");
    let menuAbierto = false;

    if (sidebar) sidebar.style.transform = "translateX(-100%)";

    if (menuToggle && sidebar) {
        menuToggle.addEventListener("click", () => {
            menuAbierto = !menuAbierto;
            sidebar.style.transform = menuAbierto ? "translateX(0)" : "translateX(-100%)";
        });
    }

    const menuInicio = document.getElementById("menuInicio");
    const menuJuegos100 = document.getElementById("menuJuegos100");
    const menuPorCompletar = document.getElementById("menuPorCompletar");
    [menuInicio, menuJuegos100, menuPorCompletar].forEach(item => {
        if (item && sidebar) {
            item.addEventListener("click", () => {
                menuAbierto = false;
                sidebar.style.transform = "translateX(-100%)";
            });
        }
    });

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

    const buscador = document.getElementById("buscador-juegos");
    if (buscador) {
        buscador.addEventListener("input", function(e) {
            filtroBusqueda = e.target.value;
            renderizarJuegos();
        });
    }

    // Modo oscuro
    // Eliminar persistencia local de modo oscuro
    const botonDark = document.getElementById("darkModeToggle");
    if (botonDark) {
        botonDark.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
        });
    }

    // ✅ Solicita usuario solo una vez y luego carga los juegos
    solicitarUsuarioAlInicio(cargarJuegos);
});