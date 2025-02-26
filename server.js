require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

// Configurar OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Usar la clave desde las variables de entorno
});

// Configurar almacenamiento de archivos
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Servir la interfaz HTML
app.use(express.static('public'));

// Ruta para manejar la subida y transcripción del audio
app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    // Leer el archivo de audio
    const audioFile = fs.createReadStream(req.file.path);

    // Transcribir el audio usando la API de OpenAI
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1', // Usar el modelo Whisper de OpenAI
    });

    // Eliminar archivo temporal
    fs.unlinkSync(req.file.path);

    // Enviar la transcripción como respuesta
    res.json({ text: transcription.text });
  } catch (error) {
    console.error('Error en la transcripción:', error);
    res.status(500).json({ error: 'Error en la transcripción' });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});