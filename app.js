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

        let colorClass = "";
        if (juego.porcentaje == 100) {
            colorClass = "border-green-500 bg-green-50";
        } else if (juego.porcentaje >= 50) {
            colorClass = "border-orange-500 bg-orange-50";
        } else {
            colorClass = "border-red-500 bg-red-50";
        }

        const div = document.createElement("div");
        div.classList.add("juego");

        div.innerHTML = `
            <div class="platino border-4 ${colorClass}">
                <h4>${juego.nombre}</h4>
                <p>${juego.descripcion}</p>
                <span class="badge alta">${juego.porcentaje}%</span>
            </div>
            <button onclick="confirmarEliminar(` + index + `)">Eliminar</button>
        `;

        if (juego.porcentaje == 100) {
            lista100.appendChild(div);
        } else {
            listaIncompletos.appendChild(div);
        }
    });
}

function confirmarEliminar(index) {
    console.log("Index recibido:", index);
    if (confirm("¿Estás seguro de que quieres eliminar este juego?")) {
        eliminarJuego(index);
    }
}
// Función para eliminar un juego
function eliminarJuego(index) {
    console.log("Eliminando index", index);
    juegos.splice(index, 1);
    console.log("Juegos restantes:", juegos);
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
        renderizarJuegos();
    }

});
// Función para alternar el modo oscuro
const toggle = document.getElementById("darkModeToggle");

toggle.addEventListener("click", function() {
    document.documentElement.classList.toggle("dark");
});