Este documento recoge las estrategias de prompt engineering que utilizo al trabajar con herramientas de inteligencia artificial, incluyendo ejemplos de prompts efectivos y cómo mejorarlos.

# Guía de Prompt Engineering para Desarrolladores

Esta guía recopila estrategias y ejemplos de prompts optimizados para mejorar la interacción con IAs (como Cursor o Claude) en el flujo de trabajo de desarrollo.

## Conceptos Clave

1. **Prompt**: Instrucción textual que guía a la IA.
2. **Contexto**: Información adicional (archivos, logs, reglas) que ayuda a la IA a no "alucinar".
3. **Restricciones**: Límites claros (ej. "no uses librerías externas") para filtrar la respuesta.

---

## Estrategias y Catálogo de Prompts

### 1. Definición de Rol (Persona Prompting)
**Por qué funciona:** Configura el tono, el nivel de tecnicismo y el enfoque de seguridad/arquitectura.
*   **Prompt:** *"Actúa como un Desarrollador Senior especializado en Seguridad. Revisa esta función de autenticación buscando posibles fugas de memoria o vulnerabilidades de inyección."*

### 2. Razonamiento Paso a Paso (Chain of Thought)
**Por qué funciona:** Obliga al modelo a descomponer la lógica antes de escribir el código, reduciendo errores en algoritmos complejos.
*   **Prompt:** *"Explica paso a paso la lógica necesaria para sincronizar este array local con la API de GitHub MCP y, una vez validado el proceso, genera el código en TypeScript."*

### 3. Ejemplos Dirigidos (Few-Shot Prompting)
**Por qué funciona:** Establece un estándar visual y estructural que la IA imitará exactamente.
*   **Prompt:** *"Genera logs de error siguiendo este formato: 
    - [ERROR][DB]: Fallo de conexión
    - [WARN][AUTH]: Intento fallido de login
    Tarea: Genera un log para un error de timeout en la API de GitHub."*

### 4. Refactorización con Restricciones
**Por qué funciona:** Evita que la IA sugiera cambios que rompan la compatibilidad o usen herramientas no deseadas.
*   **Prompt:** *"Refactoriza esta función para usar Async/Await. Restricción: No utilices librerías externas como Axios, usa el fetch nativo de Node.js."*

### 5. Documentador Automático (JSDoc/Markdown)
**Por qué funciona:** Extrae la intención del código y la traduce a lenguaje humano estructurado.
*   **Prompt:** *"Genera la documentación técnica de este componente en formato JSDoc, detallando tipos de datos, valores por defecto y un ejemplo de uso en React."*

### 6. Generador de Tests Unitarios
**Por qué funciona:** El rol de QA enfoca a la IA en buscar fallos de borde (edge cases) que un desarrollador suele ignorar.
*   **Prompt:** *"Actúa como un Ingeniero de QA. Escribe 5 tests unitarios para esta función usando Vitest, incluyendo un caso donde el input sea null."*

### 7. Explicador de Código (Rubber Ducking)
**Por qué funciona:** Ideal para entender legacy code o librerías complejas.
*   **Prompt:** *"Explica qué hace este bloque de código línea por línea como si se lo explicaras a un estudiante de primer año de programación."*

### 8. Optimizador de Consultas (DBA)
**Por qué funciona:** Aplica conocimientos específicos de indexación y rendimiento de bases de datos.
*   **Prompt:** *"Actúa como un DBA experto. Optimiza esta consulta SQL de PostgreSQL para evitar un Full Table Scan en una tabla con 500k registros."*

### 9. Creador de Commits y Changelogs
**Por qué funciona:** Mantiene la consistencia en el historial de versiones sin esfuerzo manual.
*   **Prompt:** *"Analiza mis cambios actuales y redacta un mensaje de commit siguiendo el estándar de 'Conventional Commits' (feat, fix, docs, etc.)."*

### 10. Debugger de Errores (Root Cause Analysis)
**Por qué funciona:** Al pedir múltiples soluciones, evitas que la IA se bloquee con una única respuesta errónea.
*   **Prompt:** *"Analiza este log de error [pegar log]. Propón 3 causas raíz posibles y la solución para la más probable basada en mi código actual."*
