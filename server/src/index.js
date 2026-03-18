require('dotenv').config({ path: './src/Config/.env' });
console.log("Contenido de process.env.PORT:", process.env.PORT);


const express = require('express');
const cors = require('cors');

// Convertimos a número para asegurar que app.listen no se líe
const PORT = parseInt(process.env.PORT) || 4000; 

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
});

// ¡IMPORTANTE! Asegúrate de que el console.log esté DENTRO de las llaves { }
app.listen(PORT, () => {
    console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});
