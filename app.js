const formularioJuego = document.getElementById("form-juego");
const inputNombreJuego = document.getElementById("input-juego");
const inputDescripcionJuego = document.getElementById("input-descripcion");
const inputPorcentajeJuego = document.getElementById("input-porcentaje");
const listaJuegosCompletos = document.getElementById("lista-juegos-100");
const listaJuegosIncompletos = document.getElementById("lista-juegos-incompletos");

let juegosDelUsuario = [];
let usuarioActual = "";

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
 * Obtiene el usuario actual desde localStorage o lo crea si no existe.
 * Actualiza la variable global `usuarioActual`.
 * @returns {string} Nombre del usuario actual.
 */
function obtenerUsuario() {
    let usuario = localStorage.getItem("usuario");
    if (!usuario) {
        usuario = prompt("Ingresa tu nombre de usuario:");
        if (usuario) {
            localStorage.setItem("usuario", usuario);
        } else {
            usuario = "anonimo";
        }
    }
    usuarioActual = usuario;
    return usuario;
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
        </div>
        <button class="btn-eliminar absolute top-3 right-3 bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded transition">
            Eliminar
        </button>
    `;

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
    juegosDelUsuario.push(juego);
    guardarEnLocalStorage();
    renderizarJuegos();
}
/**
 * Renderiza en el DOM la lista de juegos completos e incompletos del usuario actual.
 */
function renderizarJuegos() {
    listaJuegosCompletos.innerHTML = "";
    listaJuegosIncompletos.innerHTML = "";

    juegosDelUsuario.forEach(function(juego, index) {
        const porcentaje = normalizarPorcentaje(juego.porcentaje);
        const estilos = obtenerEstilosPorcentaje(porcentaje);

        const tarjetaJuego = crearTarjetaJuego(
            juego,
            porcentaje,
            estilos,
            function () {
                confirmarEliminar(index);
            }
        );

        if (porcentaje === 100) {
            listaJuegosCompletos.appendChild(tarjetaJuego);
        } else {
            listaJuegosIncompletos.appendChild(tarjetaJuego);
        }
    });
}

/**
 * Muestra un cuadro de confirmación antes de eliminar un juego.
 * @param {number} index - Índice del juego en el arreglo `juegosDelUsuario`.
 */
function confirmarEliminar(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este juego?")) {
        eliminarJuego(index);
    }
}
/**
 * Elimina un juego por índice y actualiza almacenamiento y renderizado.
 * @param {number} index - Índice del juego a eliminar.
 */
function eliminarJuego(index) {
    juegosDelUsuario.splice(index, 1);
    guardarEnLocalStorage();
    renderizarJuegos();
}
/**
 * Guarda la lista de juegos del usuario actual en localStorage.
 */
function guardarEnLocalStorage() {
    localStorage.setItem("juegos_" + usuarioActual, JSON.stringify(juegosDelUsuario));
}
//cargar datos al iniciar la página
window.addEventListener("DOMContentLoaded", function() {

    obtenerUsuario();

    const datosGuardados = localStorage.getItem("juegos_" + usuarioActual);
    if (datosGuardados) {
        juegosDelUsuario = JSON.parse(datosGuardados);
    } else {
        // Juegos de prueba para ver los colores
        juegosDelUsuario = [
            { nombre: "Juego Verde", descripcion: "Completado al 100%", porcentaje: 100 },
            { nombre: "Juego Naranja", descripcion: "Completado al 75%", porcentaje: 75 },
            { nombre: "Juego Rojo", descripcion: "Completado al 30%", porcentaje: 30 }
        ];
    }
    renderizarJuegos();

    // Persistencia del modo oscuro
    if (localStorage.getItem("modoOscuro") === "true") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }

    const botonDark = document.getElementById("darkModeToggle");
    if (botonDark) {
        botonDark.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark");
            localStorage.setItem("modoOscuro", document.documentElement.classList.contains("dark"));
        });
    }
});