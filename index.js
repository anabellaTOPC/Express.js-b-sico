const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // asegúrate de instalarlo: npm install node-fetch
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'verifica123';

// Ruta para validación (Meta Webhook GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verificado correctamente ✅');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Ruta para recibir mensajes reales (POST)
app.post('/webhook', async (req, res) => {
  console.log("Mensaje recibido:", JSON.stringify(req.body, null, 2));
  res.sendStatus(200); // Respuesta a Meta

  // REENVÍO a Power Automate (solo si tienes ya tu URL)
  try {
    await fetch('https://TU-WEBHOOK-DE-POWER-AUTOMATE', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    console.log("➡️ Datos reenviados a Power Automate");
  } catch (err) {
    console.error("Error al reenviar:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
