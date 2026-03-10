const form = document.getElementById("form-juego");
const input = document.getElementById("input-juego");
const inputDescripcion = document.getElementById("input-descripcion");
const inputPorcentaje = document.getElementById("input-porcentaje");
const lista100 = document.getElementById("lista-juegos-100");
const listaIncompletos = document.getElementById("lista-juegos-incompletos");

let juegos = [];
let usuarioActual = "";

// Función para obtener o crear usuario
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

form.addEventListener("submit", function(e) {
    e.preventDefault(); 

    const nuevoJuego = {
        nombre: input.value,
        descripcion: inputDescripcion.value,
        porcentaje: inputPorcentaje.value || 0
    };

    agregarJuego(nuevoJuego);

    input.value = "";
    inputDescripcion.value = "";
    inputPorcentaje.value = "";
}); // Función para agregar un juego
function agregarJuego(juego) {

    juegos.push(juego);

    guardarEnLocalStorage();

    renderizarJuegos();
}
// Función para renderizar la lista de juegos
function renderizarJuegos() {

    lista100.innerHTML = "";
    listaIncompletos.innerHTML = "";

    juegos.forEach(function(juego, index) {
            let borderClass = "";
            let progressColor = "";
            const porcentaje = parseInt(juego.porcentaje);
            if (porcentaje === 100) {
                borderClass = "border-green-500";
                progressColor = "bg-green-500";
            } else if (porcentaje >= 50) {
                borderClass = "border-orange-500";
                progressColor = "bg-orange-500";
            } else {
                borderClass = "border-red-500";
                progressColor = "bg-red-500";
            }

        const div = document.createElement("div");
            div.className = `relative rounded-xl border-4 ${borderClass} bg-gray-800 bg-opacity-90 p-8 mb-6 shadow-lg flex flex-col`;

        div.innerHTML = `
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
                <button onclick="confirmarEliminar(${index})" class="absolute top-3 right-3 bg-red-700 hover:bg-red-800 text-white text-xs px-3 py-1 rounded transition">Eliminar</button>
        `;

        if (parseInt(juego.porcentaje) === 100) {
            lista100.appendChild(div);
        } else {
            listaIncompletos.appendChild(div);
        }
    });
}

function confirmarEliminar(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este juego?")) {
        eliminarJuego(index);
    }
}
// Eliminar juego
function eliminarJuego(index) {
    juegos.splice(index, 1);
    guardarEnLocalStorage();
    renderizarJuegos();
}
// Función para guardar la lista de juegos en localStorage
function guardarEnLocalStorage() {
    localStorage.setItem("juegos_" + usuarioActual, JSON.stringify(juegos));
}
//cargar datos al iniciar la página
window.addEventListener("DOMContentLoaded", function() {

    const datosGuardados = localStorage.getItem("juegos");
    if (datosGuardados) {
        juegos = JSON.parse(datosGuardados);
    } else {
        // Juegos de prueba para ver los colores
        juegos = [
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