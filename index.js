const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // asegúrate de instalarlo: npm install node-fetch
const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = 'verifica123';
const POWER_AUTOMATE_WEBHOOK_URL = 'https://prod-172.westeurope.logic.azure.com:443/workflows/8d550d3c36104fdb9857414050b9a8c2/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d_Xb6GBRrWxUgTCLNH_1YEayLBVzbkA1ouLHY8lf_x8';

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

  // Reenvío a Power Automate
  try {
    const response = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("⚠️ Power Automate respondió con error:", response.status, text);
    } else {
      console.log("➡️ Datos reenviados correctamente a Power Automate");
    }
  } catch (err) {
    console.error("❌ Error al reenviar a Power Automate:", err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
