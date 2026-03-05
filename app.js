const form = document.getElementById("form-juego");
const input = document.getElementById("input-juego");
const lista = document.getElementById("lista-juegos");

let juegos = []; 

form.addEventListener("submit", function(e) {
    e.preventDefault(); 

    const nombreJuego = input.value;

    agregarJuego(nombreJuego);

    input.value = "";
}); // Función para agregar un juego
function agregarJuego(nombre) {

    juegos.push(nombre);

    guardarEnLocalStorage();

    renderizarJuegos();
}
// Función para renderizar la lista de juegos
function renderizarJuegos() {

    lista.innerHTML = "";

    juegos.forEach(function(juego, index) {

        const div = document.createElement("div");
        div.classList.add("juego");

        div.innerHTML = `
            <span>${juego}</span>
            <button onclick="eliminarJuego(${index})">Eliminar</button>
        `;

        lista.appendChild(div);
    });
}
// Función para eliminar un juego
function eliminarJuego(index) {

    juegos.splice(index, 1);

    guardarEnLocalStorage();

    renderizarJuegos();
}
// Función para guardar la lista de juegos en localStorage
function guardarEnLocalStorage() {
    localStorage.setItem("juegos", JSON.stringify(juegos));
}
//cargar datos al iniciar la página
window.addEventListener("DOMContentLoaded", function() {

    const datosGuardados = localStorage.getItem("juegos");

    if (datosGuardados) {
        juegos = JSON.parse(datosGuardados);
        renderizarJuegos();
    }

});
