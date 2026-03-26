# Herramientas del ecosistema de APIs REST

Este documento explica qué son y para qué se usan las herramientas más relevantes en el desarrollo, prueba, documentación y monitorización de APIs REST.

---

## 🔄 Axios

### ¿Qué es?

Axios es una librería JavaScript para hacer peticiones HTTP desde el navegador y desde Node.js. Es una alternativa más potente y ergonómica a la API nativa `fetch`.

### ¿Por qué se usa?

A diferencia de `fetch`, Axios ofrece ventajas que simplifican el trabajo diario con APIs:

- **Transformación automática de JSON**: serializa y deserializa el cuerpo de la petición automáticamente, sin necesidad de llamar a `.json()` manualmente.
- **Interceptores**: permite ejecutar lógica antes de enviar una petición o antes de procesar una respuesta. Útil para añadir tokens de autenticación a todas las peticiones automáticamente.
- **Manejo de errores más claro**: lanza errores para cualquier respuesta con código de estado fuera del rango 2xx, mientras que `fetch` solo lanza errores de red.
- **Cancelación de peticiones**: permite cancelar peticiones en curso.
- **Compatibilidad**: funciona igual en el navegador y en Node.js.

### Ejemplo básico

```javascript
import axios from 'axios';

// GET
const { data } = await axios.get('/api/v1/tasks');

// POST
const { data: nuevaTarea } = await axios.post('/api/v1/tasks', {
  titulo: 'Hollow Knight',
  progreso: 45
});

// DELETE
await axios.delete(`/api/v1/tasks/${id}`);
```

### Ejemplo con interceptor (añadir token a todas las peticiones)

```javascript
axios.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  return config;
});
```

### ¿Cuándo usar Axios vs fetch?

Usa `fetch` para proyectos simples o cuando quieras evitar dependencias externas. Usa Axios cuando necesites interceptores, cancelación de peticiones, o compatibilidad isomórfica (mismo código en navegador y servidor).

---

## 🧪 Postman

### ¿Qué es?

Postman es una aplicación de escritorio y web que proporciona un entorno de desarrollo completo para construir, probar, documentar y compartir APIs. Es la herramienta más popular del ecosistema para interactuar con APIs REST de forma visual, sin necesidad de escribir código.

### ¿Para qué se usa?

- **Probar endpoints manualmente**: envía peticiones GET, POST, PUT, DELETE y otros métodos HTTP con cualquier cuerpo, cabeceras y parámetros.
- **Organizar peticiones en colecciones**: agrupa las peticiones de una API en carpetas para tenerlas siempre a mano.
- **Variables de entorno**: define variables como `{{base_url}}` que cambian según el entorno (local, staging, producción) sin modificar las peticiones.
- **Tests automáticos**: escribe scripts en JavaScript para validar la respuesta de cada endpoint automáticamente.
- **Documentación**: genera documentación de la API a partir de las colecciones.
- **Colaboración en equipo**: comparte colecciones con otros desarrolladores.

### Ejemplo de uso con esta API

Para probar el endpoint `POST /api/v1/tasks`:

1. Abre Postman y crea una nueva petición.
2. Selecciona el método `POST`.
3. Introduce la URL: `http://localhost:3000/api/v1/tasks`
4. En la pestaña `Body`, selecciona `raw` y `JSON`.
5. Escribe el cuerpo:
```json
{
  "titulo": "Hollow Knight",
  "descripcion": "Metroidvania de Team Cherry",
  "progreso": 45
}
```
6. Pulsa `Send` y observa la respuesta.

### Script de test en Postman

```javascript
pm.test("Status 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Tiene id", () => {
  const body = pm.response.json();
  pm.expect(body.id).to.be.a('number');
});
```

---

## 🚨 Sentry

### ¿Qué es?

Sentry es una plataforma de código abierto para la monitorización de errores y el seguimiento del rendimiento de aplicaciones en tiempo real. Funciona capturando automáticamente cualquier excepción o error que ocurra en el código, tanto en el frontend como en el backend, y enviando la información a un panel de control centralizado.

### ¿Para qué se usa?

En producción, los errores no siempre llegan al equipo de desarrollo. Un usuario puede encontrar un fallo y simplemente abandonar la aplicación sin reportarlo. Sentry soluciona este problema:

- **Detección automática de errores en producción**: captura excepciones no controladas en tiempo real sin que el usuario tenga que reportarlas.
- **Stack trace completo**: muestra exactamente en qué línea de código ocurrió el error, con el contexto completo (variables locales, cabeceras HTTP, sistema operativo del usuario, etc.).
- **Agrupación de errores**: agrupa errores similares para evitar ruido, mostrando cuántas veces ha ocurrido un mismo fallo.
- **Alertas**: envía notificaciones por email, Slack, Jira u otras integraciones cuando se produce un error crítico.
- **Monitorización del rendimiento**: mide tiempos de respuesta de la API, detecta cuellos de botella y mide métricas como Web Vitals en el frontend.

### Integración en Express (backend)

```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({
  dsn: 'https://<tu-clave>@sentry.io/<tu-proyecto>',
  tracesSampleRate: 1.0
});

// Añadir antes de los otros middlewares
app.use(Sentry.Handlers.requestHandler());

// Añadir antes del middleware de errores
app.use(Sentry.Handlers.errorHandler());
```

### Integración en el frontend (JavaScript)

```javascript
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: 'https://<tu-clave>@sentry.io/<tu-proyecto>',
  tracesSampleRate: 1.0
});
```

### ¿Cuándo es imprescindible?

Sentry es especialmente crítico cuando la aplicación está en producción con usuarios reales. En desarrollo local los errores son visibles en la consola, pero en producción Sentry es la única forma de enterarse de que algo está fallando sin esperar a que un usuario lo reporte.

---

## 📖 Swagger (OpenAPI)

### ¿Qué es?

Swagger es un conjunto de herramientas de código abierto basadas en el estándar **OpenAPI** para diseñar, construir, documentar y consumir APIs REST. Permite describir la estructura completa de una API (endpoints, parámetros, tipos de datos, respuestas posibles, autenticación) en un archivo JSON o YAML.

### ¿Para qué se usa?

- **Documentación interactiva**: genera automáticamente una interfaz web (Swagger UI) donde cualquier desarrollador puede explorar todos los endpoints de la API y hacer peticiones de prueba directamente desde el navegador, sin Postman ni curl.
- **Contrato entre frontend y backend**: el archivo de especificación OpenAPI actúa como contrato formal que describe exactamente cómo funciona la API, evitando malentendidos entre equipos.
- **Generación de código**: herramientas como Swagger Codegen pueden generar clientes de la API en múltiples lenguajes automáticamente a partir de la especificación.
- **Validación**: permite validar que las peticiones y respuestas cumplen con la especificación definida.

### Integración en Express con swagger-ui-express

```bash
npm install swagger-ui-express swagger-jsdoc
```

```javascript
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Videojuegos',
      version: '1.0.0',
      description: 'API REST para gestionar el progreso de videojuegos'
    },
    servers: [{ url: 'http://localhost:3000' }]
  },
  apis: ['./src/routes/*.js']
};

const spec = swaggerJsdoc(options);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec));
```

**Anotación en el router:**
```javascript
/**
 * @swagger
 * /api/v1/tasks:
 *   get:
 *     summary: Obtiene todos los juegos
 *     responses:
 *       200:
 *         description: Lista de juegos
 */
router.get('/', taskController.obtenerTareas);
```

Una vez configurado, la documentación interactiva estará disponible en `http://localhost:3000/api/docs`.

### Swagger vs Postman

Aunque ambas herramientas permiten explorar y probar APIs, tienen propósitos distintos. Postman está orientado al equipo de desarrollo para probar durante el desarrollo. Swagger está orientado a la documentación pública y al contrato formal de la API, siendo accesible directamente desde la URL del proyecto sin instalar nada.

---

## Comparativa rápida

| Herramienta | Categoría | Cuándo usarla |
|---|---|---|
| **Axios** | Cliente HTTP | Al consumir una API desde el frontend o desde Node.js |
| **Postman** | Testing y exploración | Durante el desarrollo para probar endpoints manualmente |
| **Sentry** | Monitorización | En producción para detectar errores automáticamente |
| **Swagger** | Documentación | Para documentar la API y facilitar su consumo por otros |