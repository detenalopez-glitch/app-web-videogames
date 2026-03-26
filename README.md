# 🎮 App Web Videojuegos

Aplicación web fullstack para gestionar y hacer seguimiento del progreso de tus videojuegos. Permite añadir juegos con un porcentaje de completado, editarlos, eliminarlos y filtrarlos por estado.

**Demo en producción:** [https://app-web-videogames.vercel.app](https://app-web-videogames.vercel.app)

---

# PARTE 1 — FRONTEND

## 🗂️ Arquitectura de carpetas del Frontend

```
Pagina web app/          ← Raíz del proyecto
├── index.html           ← Punto de entrada de la aplicación
├── app.js               ← Lógica principal del frontend (ES Modules)
├── styles.css           ← CSS compilado y listo para producción
├── tailwind.css         ← CSS fuente de Tailwind (input del compilador)
├── tailwind.config.js   ← Configuración del compilador de Tailwind
├── package.json         ← Dependencias y scripts del frontend
├── vercel.json          ← Configuración de despliegue en Vercel
└── src/
    └── api/
        └── client.js    ← Módulo de comunicación HTTP con la API REST
```

### ¿Por qué esta estructura?

Se ha optado por mantener el frontend en la raíz del proyecto con una carpeta `src/api/` para aislar la capa de comunicación con el servidor. Esto sigue el principio de **separación de responsabilidades**: `app.js` se encarga exclusivamente de la lógica de la interfaz (renderizado, eventos del DOM, filtros), mientras que `client.js` se encarga exclusivamente de las peticiones HTTP. Si en el futuro se cambia la URL base de la API o se migra de `fetch` a `axios`, solo hay que modificar `client.js` sin tocar la lógica de la interfaz.

---

## 📄 `index.html` — Punto de entrada

`index.html` es el único archivo HTML del proyecto. Actúa como el esqueleto de la aplicación. Define la estructura semántica de la página con elementos como `<header>`, `<main>`, `<aside>` y `<section>`, y delega toda la lógica al archivo `app.js` mediante una etiqueta `<script>` al final del `<body>`:

```html
<script type="module" src="app.js"></script>
```

El atributo `type="module"` es fundamental. Le indica al navegador que `app.js` es un **ES Module**, lo que habilita varias capacidades clave:

- **`import`/`export`**: permite importar funciones desde otros archivos (`client.js`) sin bundlers ni herramientas de compilación adicionales.
- **Modo estricto implícito**: los ES Modules se ejecutan siempre en strict mode, lo que previene errores silenciosos.
- **Ámbito aislado**: las variables declaradas en un módulo no contaminan el ámbito global (`window`).

Sin `type="module"`, el navegador lanzaría `SyntaxError: Unexpected token 'export'` al encontrar la instrucción `export` en `client.js`.

---

## 🎨 Sistema de estilos — Tailwind CSS

El proyecto usa **Tailwind CSS v3**, un framework de CSS de utilidad que genera clases CSS atómicas (como `bg-gray-800`, `rounded-xl`, `flex`) en lugar de componentes predefinidos.

### Flujo de compilación

```
tailwind.css  →  [compilador Tailwind]  →  styles.css
   (fuente)                                (producción)
```

El compilador analiza todos los archivos del proyecto en busca de clases de Tailwind usadas y genera un `styles.css` que contiene **únicamente las clases utilizadas**, eliminando todo el CSS no usado. Esto reduce el tamaño del archivo CSS final de varios MB a unos pocos KB.

**Para compilar en local:**
```bash
npm run build
# Ejecuta: npx tailwindcss -i ./tailwind.css -o ./styles.css
```

**`tailwind.config.js`** define qué archivos escanear para detectar clases:
```javascript
module.exports = {
  content: ["./*.html", "./*.js"],
  darkMode: 'class',
  theme: { extend: {} },
  plugins: []
}
```

La opción `darkMode: 'class'` activa el modo oscuro basado en la presencia de la clase `dark` en el elemento `<html>`, lo que permite alternar el tema con JavaScript:
```javascript
document.documentElement.classList.toggle('dark');
```

---

## ⚙️ `app.js` — Lógica principal del Frontend

`app.js` es el módulo central del frontend. Está organizado en capas de responsabilidad bien definidas.

### Importación del cliente HTTP

```javascript
import { getTasks, createTask, deleteTask } from "./src/api/client.js";
```

Al usar la ruta relativa `./src/api/client.js`, el navegador resuelve el módulo de forma nativa sin necesidad de un bundler como Webpack o Vite.

### Estado de la aplicación

```javascript
let juegosDelUsuario = [];   // Array en memoria con todos los juegos cargados
let usuarioActual = "";      // Nombre del usuario, persistido en localStorage
let filtroEstado = "todos";  // Estado del filtro activo: todos | completados | incompletos
let filtroBusqueda = "";     // Texto del buscador en tiempo real
```

Estas variables actúan como el **estado global** de la aplicación. Cualquier cambio en ellas se refleja en la UI llamando a `renderizarJuegos()`.

### Ciclo de vida de la aplicación

```
DOMContentLoaded
      │
      ▼
solicitarUsuarioAlInicio()   ← pide nombre si no está en localStorage
      │
      ▼
cargarJuegos()               ← GET /api/v1/tasks → llena juegosDelUsuario[]
      │
      ▼
renderizarJuegos()           ← construye el DOM a partir del estado
```

### Renderizado declarativo

`renderizarJuegos()` vacía completamente los contenedores del DOM y los reconstruye a partir del array `juegosDelUsuario` filtrado. El estado es la fuente de verdad, y el DOM es siempre una representación de ese estado.

```javascript
function renderizarJuegos() {
    listaJuegosCompletos.innerHTML = "";       // vacía el DOM
    listaJuegosIncompletos.innerHTML = "";
    // aplica filtros sobre juegosDelUsuario[]
    // construye y añade tarjetas al DOM
}
```

### Comunicación con la API (operaciones asíncronas)

Todas las operaciones que modifican datos son `async/await` para manejar la naturaleza asíncrona de las peticiones HTTP:

```javascript
async function cargarJuegos() { ... }       // GET
async function agregarJuego(juego) { ... }  // POST
async function eliminarJuego(index) { ... } // DELETE
```

---

## 🌐 `src/api/client.js` — Módulo HTTP del Frontend

Este módulo encapsula toda la comunicación con la API REST usando la API nativa `fetch`. Exporta tres funciones que corresponden a los tres endpoints de la API.

### URL base relativa

```javascript
const API_BASE = "/api/v1/tasks";
```

Al usar una ruta relativa (sin dominio), la URL se resuelve automáticamente contra el origen actual:
- En local: `http://localhost:3000/api/v1/tasks`
- En producción: `https://app-web-videogames.vercel.app/api/v1/tasks`

Esto elimina la necesidad de variables de entorno en el frontend y garantiza que el código funcione igual en cualquier entorno.

### Funciones exportadas

```javascript
export async function getTasks()                                      // GET
export async function createTask({ titulo, progreso, descripcion })   // POST
export async function deleteTask(id)                                  // DELETE
```

---

---

# PARTE 2 — BACKEND

## 🗂️ Arquitectura de carpetas del Backend

```
server/                          ← Raíz del backend
├── index.js                     ← Punto de entrada del servidor Express
├── package.json                 ← Dependencias y scripts del backend
├── .env                         ← Variables de entorno (no subir a git)
│
├── data/
│   └── tasks.json               ← Persistencia de datos en disco
│
└── src/
    ├── Config/
    │   └── env.js               ← Carga y expone variables de entorno
    ├── controllers/
    │   └── task.controller.js   ← Controladores HTTP (capa de entrada)
    ├── routes/
    │   └── task.routes.js       ← Definición y registro de rutas Express
    └── services/
        └── task.service.js      ← Lógica de negocio y acceso a datos
```

### ¿Por qué esta estructura en capas?

La arquitectura sigue el patrón **MVC simplificado** (Model-View-Controller) adaptado a APIs REST, separando las responsabilidades en tres capas:

| Capa | Archivo | Responsabilidad |
|------|---------|----------------|
| **Routes** | `task.routes.js` | Mapear URLs y métodos HTTP a controladores |
| **Controller** | `task.controller.js` | Recibir la petición HTTP, validar datos y devolver la respuesta |
| **Service** | `task.service.js` | Contener la lógica de negocio y el acceso a los datos |

Esta separación garantiza que cada capa pueda modificarse de forma independiente. Por ejemplo, se puede cambiar la fuente de datos de JSON a MongoDB modificando únicamente `task.service.js`, sin tocar los controladores ni las rutas.

---

## 🚪 `index.js` — Servidor Express y Middlewares

`index.js` es el punto de entrada del servidor. Instancia la aplicación Express, registra los middlewares globales, monta las rutas y arranca el servidor HTTP.

### Middlewares globales

Los middlewares en Express son funciones que interceptan el ciclo de vida de una petición HTTP antes de que llegue al controlador final. Se ejecutan **en el orden en que se registran**, lo cual es crítico.

#### 1. `cors()` — Cross-Origin Resource Sharing

```javascript
app.use(cors());
```

**CORS** es un mecanismo de seguridad implementado por los navegadores que bloquea por defecto las peticiones HTTP realizadas desde un origen distinto al del servidor. Este middleware inyecta las cabeceras HTTP necesarias en cada respuesta:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

Sin este middleware, cualquier petición `fetch` desde el frontend sería bloqueada con el error `CORS policy: No 'Access-Control-Allow-Origin' header`.

#### 2. `express.json()` — Body Parser

```javascript
app.use(express.json());
```

Intercepta las peticiones entrantes con `Content-Type: application/json`, lee el cuerpo como stream, lo acumula en un buffer y lo parsea con `JSON.parse()`. El resultado queda disponible en `req.body`. Sin este middleware, `req.body` sería `undefined` en todos los endpoints POST.

#### 3. `express.static()` — Servidor de archivos estáticos

```javascript
app.use(express.static(path.join(__dirname, '..')));
```

Sirve los archivos estáticos del frontend directamente como respuesta HTTP. Cuando llega una petición `GET /app.js`, Express busca el archivo en la carpeta raíz del proyecto y lo devuelve con el `Content-Type` correcto. `path.join(__dirname, '..')` construye la ruta de forma independiente del sistema operativo, evitando problemas con separadores de ruta en Windows (`\`) frente a Unix (`/`).

#### 4. Middleware de errores — Error Handler

```javascript
app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
```

Express reconoce un middleware como **manejador de errores** cuando tiene exactamente **cuatro parámetros** `(err, req, res, next)`. Se activa automáticamente cuando cualquier controlador llama a `next(error)`. Debe registrarse siempre **al final**, después de todas las rutas, porque Express procesa los middlewares en orden secuencial.

---

## 🛣️ `task.routes.js` — Definición de rutas

```javascript
router.get('/', taskController.obtenerTareas);
router.post('/', taskController.crearTarea);
router.delete('/:id', taskController.eliminarTarea);
```

El router agrupa las rutas bajo el prefijo `/api/v1/tasks` definido en `index.js`. El segmento `:id` es un **parámetro de ruta dinámico** cuyo valor Express expone en `req.params.id`. El prefijo `/api/v1/` es una convención de **versionado de APIs**: si se introduce una versión 2 con cambios incompatibles, puede coexistir en `/api/v2/` sin romper los clientes existentes.

---

## 🎮 `task.controller.js` — Capa de controladores

Los controladores reciben `(req, res, next)` y son responsables de validar los datos de entrada, llamar al servicio y devolver la respuesta HTTP. No contienen lógica de negocio.

### Validación en `crearTarea`

```javascript
if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    return res.status(400).json({
        error: 'El título es obligatorio y debe tener al menos 3 caracteres'
    });
}
```

Se devuelve **400 Bad Request** cuando los datos no cumplen los requisitos. El `return` cortocircuita la ejecución para evitar que el código continúe hacia el servicio con datos inválidos.

### Delegación de errores inesperados

```javascript
try {
    const nuevaTarea = taskService.crearTarea({ titulo, progreso });
    res.status(201).json(nuevaTarea);
} catch (error) {
    next(error);
}
```

Los errores inesperados del servicio se pasan al middleware de errores mediante `next(error)`, separando los errores esperados (validación → 400) de los inesperados (excepciones → 500).

---

## 🧠 `task.service.js` — Lógica de negocio y persistencia

El servicio es la capa más interna. Contiene la lógica de negocio y es la única capa que accede directamente a los datos.

### Persistencia en JSON

Los datos se almacenan en `tasks.json`. Al arrancar, `cargarDesdeDisco()` carga los datos en el array en memoria `tasks[]`. Las lecturas se sirven desde memoria (muy rápidas, sin I/O de disco), y las escrituras modifican el array y luego persisten el estado en disco con `fs.writeFileSync`.

### Gestión del ID autoincremental

```javascript
const maxId = tasks.reduce((max, t) =>
    (typeof t?.id === "number" ? Math.max(max, t.id) : max), 0);
idCounter = maxId + 1;
```

Al cargar desde disco, calcula el ID más alto existente y fija el contador a `maxId + 1`, garantizando que los IDs nunca se repiten aunque el servidor se reinicie.

### Lanzamiento de errores de dominio

```javascript
if (index === -1) throw new Error('NOT_FOUND');
```

El servicio lanza errores con mensajes semánticos del dominio (`'NOT_FOUND'`). El middleware de errores los interpreta y los transforma en respuestas HTTP con el código de estado apropiado (404). Este patrón desacopla la semántica del dominio de la semántica HTTP.

---

## 📡 API REST — Referencia de endpoints

Base URL local: `http://localhost:3000`
Base URL producción: `https://app-web-videogames.vercel.app`

### `GET /api/v1/tasks`
```bash
curl http://localhost:3000/api/v1/tasks
```
**Respuesta 200:**
```json
[
  { "id": 1, "titulo": "Hollow Knight", "descripcion": "Metroidvania", "progreso": 75 },
  { "id": 2, "titulo": "Dark Souls", "descripcion": "RPG difícil", "progreso": 100 }
]
```

### `POST /api/v1/tasks`
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Hollow Knight","descripcion":"Metroidvania","progreso":45}'
```
**Respuesta 201:**
```json
{ "id": 3, "titulo": "Hollow Knight", "descripcion": "Metroidvania", "progreso": 45 }
```
**Respuesta 400:**
```json
{ "error": "El título es obligatorio y debe tener al menos 3 caracteres" }
```

### `DELETE /api/v1/tasks/:id`
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/3
```
**Respuesta 200:**
```json
{ "success": true }
```
**Respuesta 404:**
```json
{ "error": "Recurso no encontrado" }
```

---

## 🛠️ Stack tecnológico completo

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend — Estructura | HTML5 | — |
| Frontend — Lógica | JavaScript ES Modules | ES2020+ |
| Frontend — Estilos | Tailwind CSS | v3 |
| Backend — Runtime | Node.js | v18+ |
| Backend — Framework | Express | v5 |
| Backend — Persistencia | JSON en disco (`fs`) | — |
| Despliegue | Vercel | — |

---

## 🚀 Instalación local

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/tu-repo.git
cd "Pagina web app"

# 2. Instalar dependencias del frontend
npm install

# 3. Instalar dependencias del backend
cd server && npm install && cd ..

# 4. Crear .env en server/
echo "PORT=3000" > server/.env

# 5. Compilar Tailwind CSS
npm run build

# 6. Arrancar el servidor
cd server && node index.js

# 7. Abrir en el navegador
# http://localhost:3000
```