// index.js
// npm install express body-parser node-fetch@2
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json());

// ===== CONFIG =====
const PORT = process.env.PORT || 3000;
const IG_TOKEN = process.env.IG_TOKEN || '<IGAAXyZCcz6eItBZAFFIVENEVnhiSGtyLXdLdTQtTjlOLW9rRkV4QkJpNUJFbktyZAGlSUWVGWGNoSHBfQnlZAUk43bzBSWUZAsVG1hX0J0WWRHcXFTZA3Nkcng1SjNiT1Rhc3JLYndEaVZAzdEhMMFlwMXFWRmZALUUtYc1F2Y0lMOFZAvcwZDZD
>'; 
const MEDIA_ID = '17957370383995377'; // <-- tu vídeo específico

// ===== Endpoint para traer TODOS los comentarios =====
// GET /comments
app.get('/comments', async (req, res) => {
  try {
    const fields = 'id,text,username,timestamp';
    let url = `https://graph.facebook.com/v23.0/${MEDIA_ID}/comments?fields=${encodeURIComponent(fields)}&limit=100&access_token=${IG_TOKEN}`;
    const all = [];

    // Paginación: recorre todas las páginas
    while (url) {
      const r = await fetch(url);
      const j = await r.json();
      if (j.error) {
        console.error('IG API error:', j.error);
        return res.status(400).json(j);
      }
      all.push(...(j.data || []));
      url = j.paging && j.paging.next ? j.paging.next : null;
    }

    // Filtrar solo username y text
    const clean = all.map(c => ({
      username: c.username,
      text: c.text
    }));

    console.log('Comentarios encontrados:', JSON.stringify(clean, null, 2));
    res.status(200).json(clean);
  } catch (e) {
    console.error('Error al traer comentarios:', e);
    res.status(500).send('Error interno');
  }
});

// ===== Health =====
app.get('/', (_, res) => res.send('ok'));

// ===== Iniciar servidor =====
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
