# app-web-videogames
Hacer una app web para organizar el porcentaje de trofeos de los videojuegos

# 🎮 GameTracker Pro: Tu Odisea Gamer bajo Control

**GameTracker** es una plataforma web diseñada para entusiastas de los videojuegos que buscan transformar su "backlog" infinito en una lista de conquistas. Centraliza tu progreso, gestiona tus horas de juego y celebra tus logros en una sola interfaz intuitiva.

---

## 🚀 Características Principales

Nuestra aplicación está diseñada para cubrir todo el ciclo de vida de un jugador:

*   **⏱️ Seguimiento de Horas en Tiempo Real:** Registra sesiones de juego precisas y visualiza el tiempo total invertido por título o plataforma.
*   **📚 Gestión de Backlog Inteligente:** Organiza tus juegos pendientes, "en progreso", "completados" o "abandonados" con etiquetas personalizadas.
*   **🏆 Sistema de Logros y Progresión:** Visualiza tu porcentaje de completitud (100% Run) y desbloquea medallas internas de la plataforma.
*   **📊 Estadísticas de Juego:** Gráficos detallados sobre tus géneros más jugados y tendencias mensuales.

---

## 🛠️ Stack Tecnológico

Elegimos herramientas de alto rendimiento para garantizar una experiencia de usuario fluida:

- **Frontend:** [React.js](https://reactjs.org) / [Next.js 14](https://nextjs.org) (App Router)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com)
- **Backend:** [Node.js](https://nodejs.org) con Express
- **Base de Datos:** [PostgreSQL](https://www.postgresql.org) (o MongoDB, según tu elección)
- **Autenticación:** NextAuth.js o Firebase Auth

# 🎮 App Web Videojuegos

Aplicación web fullstack para gestionar y hacer seguimiento del progreso de tus videojuegos. Permite añadir juegos con un porcentaje de completado, editarlos, eliminarlos y filtrarlos por estado.

---

## 🌐 Demo en producción

[https://app-web-videogames.vercel.app](https://app-web-videogames.vercel.app)

---

## 🏗️ Arquitectura del proyecto

```
Pagina web app/
├── index.html              # Punto de entrada del frontend
├── app.js                  # Lógica del frontend (ES Modules)
├── styles.css              # CSS compilado por Tailwind
├── tailwind.css            # CSS fuente de Tailwind
├── tailwind.config.js      # Configuración de Tailwind
├── package.json            # Dependencias del frontend
├── vercel.json             # Configuración de despliegue en Vercel
├── .gitignore
├── README.md
│
├── src/
│   └── api/
│       └── client.js       # Cliente HTTP del frontend (fetch a la API)
│
├── docs/
│   └── backend-api.md      # Documentación de herramientas del backend
│
└── server/                 # Backend Node.js + Express
    ├── index.js            # Punto de entrada del servidor
    ├── package.json        # Dependencias del backend
    ├── .env                # Variables de entorno (no subir a git)
    ├── vercel.json         # (mover a la raíz)
    │
    ├── data/
    │   └── tasks.json      # Persistencia de datos en disco (JSON)
    │
    └── src/
        ├── api/
        │   └── client.js   # (no usado en producción)
        ├── Config/
        │   └── env.js      # Carga y valida variables de entorno
        ├── controllers/
        │   └── task.controller.js   # Controladores HTTP
        ├── routes/
        │   └── task.routes.js       # Definición de rutas Express
        └── services/
            └── task.service.js      # Lógica de negocio y persistencia
```

---

## ⚙️ Funcionamiento de los middlewares

El servidor Express (`server/index.js`) aplica los siguientes middlewares en orden. El orden es crítico: Express ejecuta los middlewares de arriba a abajo.

### 1. `cors()`

```javascript
app.use(cors());
```

**CORS** (Cross-Origin Resource Sharing) es un mecanismo de seguridad del navegador que bloquea peticiones HTTP entre dominios distintos. Este middleware añade las cabeceras HTTP necesarias (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.) para permitir que el frontend pueda consumir la API aunque esté servido desde un origen diferente. Sin este middleware, el navegador bloquearía todas las peticiones al servidor.

### 2. `express.json()`

```javascript
app.use(express.json());
```

Middleware de parseo del cuerpo de la petición. Intercepta las peticiones entrantes con `Content-Type: application/json`, deserializa el cuerpo JSON y lo expone en `req.body`. Sin este middleware, `req.body` sería `undefined` en los endpoints POST y PUT.

### 3. `express.static()`

```javascript
app.use(express.static(path.join(__dirname, '..')));
```

Sirve los archivos estáticos del frontend (HTML, CSS, JS) directamente desde el sistema de archivos. Cuando el navegador solicita `/app.js` o `/styles.css`, Express busca el archivo en la carpeta raíz del proyecto y lo devuelve con el `Content-Type` correcto. Esto permite unificar frontend y backend en un único servidor.

### 4. Middleware de errores (Error Handler)

```javascript
app.use((err, req, res, next) => {
    if (err.message === 'NOT_FOUND') {
        return res.status(404).json({ error: 'Recurso no encontrado' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
});
```

Middleware especial de Express con **cuatro parámetros** (`err, req, res, next`). Express lo reconoce como manejador de errores cuando tiene exactamente esa firma. Se ejecuta automáticamente cuando cualquier controlador llama a `next(error)`. Centraliza el manejo de errores en un único lugar, evitando duplicar lógica de respuesta de error en cada controlador. Debe colocarse siempre **al final** de todos los middlewares y rutas.

---

## 📡 API REST — Referencia de endpoints

Base URL en local: `http://localhost:3000`  
Base URL en producción: `https://app-web-videogames.vercel.app`

---

### `GET /api/v1/tasks`

Devuelve la lista completa de tareas/juegos almacenados.

**Request**
```http
GET /api/v1/tasks HTTP/1.1
```

**Response 200 OK**
```json
[
  {
    "id": 1,
    "titulo": "The Legend of Zelda",
    "descripcion": "Juego de aventuras de Nintendo",
    "progreso": 75
  },
  {
    "id": 2,
    "titulo": "Dark Souls",
    "descripcion": "RPG de acción difícil",
    "progreso": 100
  }
]
```

**Ejemplo con fetch**
```javascript
const res = await fetch('/api/v1/tasks');
const juegos = await res.json();
```

**Ejemplo con curl**
```bash
curl http://localhost:3000/api/v1/tasks
```

---

### `POST /api/v1/tasks`

Crea un nuevo juego. El campo `titulo` es obligatorio y debe tener al menos 3 caracteres.

**Request**
```http
POST /api/v1/tasks HTTP/1.1
Content-Type: application/json

{
  "titulo": "Hollow Knight",
  "descripcion": "Metroidvania de Team Cherry",
  "progreso": 45
}
```

**Response 201 Created**
```json
{
  "id": 3,
  "titulo": "Hollow Knight",
  "descripcion": "Metroidvania de Team Cherry",
  "progreso": 45
}
```

**Response 400 Bad Request** (validación fallida)
```json
{
  "error": "El título es obligatorio y debe tener al menos 3 caracteres"
}
```

**Ejemplo con fetch**
```javascript
const res = await fetch('/api/v1/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: 'Hollow Knight',
    descripcion: 'Metroidvania de Team Cherry',
    progreso: 45
  })
});
const nuevoJuego = await res.json();
```

**Ejemplo con curl**
```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Hollow Knight","descripcion":"Metroidvania","progreso":45}'
```

---

### `DELETE /api/v1/tasks/:id`

Elimina un juego por su ID.

**Request**
```http
DELETE /api/v1/tasks/3 HTTP/1.1
```

**Response 200 OK**
```json
{ "success": true }
```

**Response 404 Not Found**
```json
{ "error": "Recurso no encontrado" }
```

**Response 400 Bad Request** (ID no numérico)
```json
{ "error": "ID inválido" }
```

**Ejemplo con fetch**
```javascript
await fetch(`/api/v1/tasks/3`, { method: 'DELETE' });
```

**Ejemplo con curl**
```bash
curl -X DELETE http://localhost:3000/api/v1/tasks/3
```

---

## 🗄️ Persistencia de datos

Los datos se almacenan en `server/data/tasks.json`. No se usa base de datos externa. Al arrancar el servidor, `task.service.js` carga el archivo en memoria. Cada operación de escritura (crear o eliminar) actualiza el archivo en disco de forma síncrona con `fs.writeFileSync`.

**Estructura del archivo:**
```json
[
  {
    "id": 1,
    "titulo": "Nombre del juego",
    "descripcion": "Descripción",
    "progreso": 100
  }
]
```

> ⚠️ En Vercel el sistema de archivos es de solo lectura, por lo que los datos no persisten entre deploys. Para producción real se recomienda usar una base de datos como MongoDB Atlas o PlanetScale.

---

## 🚀 Instalación y uso local

### Requisitos
- Node.js v18+
- npm

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/tu-repo.git
cd "Pagina web app"
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd server
npm install
```

### 4. Crear el archivo `.env` en `server/`
```env
PORT=3000
```

### 5. Compilar Tailwind CSS
```bash
cd ..
npm run build
```

### 6. Arrancar el servidor
```bash
cd server
node index.js
```

### 7. Abrir en el navegador
```
http://localhost:3000
```

---

## 🌍 Despliegue en Vercel

El proyecto está configurado para desplegarse automáticamente en Vercel al hacer push a la rama `main`.

**`vercel.json` (en la raíz):**
```json
{
  "version": 2,
  "builds": [
    { "src": "server/index.js", "use": "@vercel/node" },
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "." } }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server/index.js" },
    { "src": "/(.*\\.(js|css|html|png|jpg|svg|ico))", "dest": "/$1" },
    { "src": "/(.*)", "dest": "/server/index.js" }
  ]
}
```

**Configuración en Vercel Dashboard:**
- Framework Preset: `Other`
- Build Command: `npm run build`
- Output Directory: `.`
- Install Command: `npm install && cd server && npm install`

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, JavaScript (ES Modules), Tailwind CSS |
| Backend | Node.js, Express 5 |
| Persistencia | JSON en disco (`fs`) |
| Despliegue | Vercel |
| Estilos | Tailwind CSS v3 |
