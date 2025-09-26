// index.js (CommonJS)
// npm i express body-parser node-fetch@2
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
app.use(bodyParser.json({ verify: (req, res, buf) => { req.rawBody = buf; }}));

/* ====== ENV / CONFIG ====== */
const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'verifica123';
const IG_TOKEN = process.env.IG_TOKEN || ''; // <-- Pónlo en Render > Environment

/* ====== WEBHOOK META (VERIFICACIÓN) ====== */
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

/* ====== WEBHOOK META (EVENTOS REALES) ====== */
app.post('/webhook', async (req, res) => {
  // Responder rápido a Meta
  res.sendStatus(200);
  // Log para que lo veas en Render > Logs
  console.log('Mensaje recibido:', JSON.stringify(req.body, null, 2));
});

/* ====== UTIL: LISTAR MEDIA DESDE PAGE_ID (opcional) ====== */
// GET /find-media?page_id=123456789012345
app.get('/find-media', async (req, res) => {
  try {
    const token = req.query.token || IG_TOKEN;
    const pageId = req.query.page_id;
    if (!pageId || !token) return res.status(400).send('Falta page_id o token');

    // 1) IG user de la Página
    const pg = await (await fetch(
      `https://graph.facebook.com/v23.0/${pageId}?fields=connected_instagram_account&access_token=${token}`
    )).json();
    const igId = pg?.connected_instagram_account?.id;
    if (!igId) return res.status(404).send('No hay IG conectada a esa página');

    // 2) Medios recientes
    const url = `https://graph.facebook.com/v23.0/${igId}/media?fields=id,media_type,caption,permalink,timestamp&limit=100&access_token=${token}`;
    const j = await (await fetch(url)).json();

    console.log('MEDIA LIST:', JSON.stringify(j, null, 2));
    res.status(200).json(j);
  } catch (e) {
    console.error(e); res.status(500).send('Error');
  }
});

/* ====== DESCARGAR TODOS LOS COMENTARIOS DE UN VIDEO ====== */
// GET /fetch-comments?media_id=1784XXXXXXXXXX&include_replies=true
app.get('/fetch-comments', async (req, res) => {
  try {
    const mediaId = req.query.media_id;
    const withReplies = String(req.query.include_replies || 'false') === 'true';
    const token = req.query.token || IG_TOKEN;
    if (!mediaId || !token) return res.status(400).send('Falta media_id o token');

    const fields = 'id,text,username,timestamp,like_count';
    let url = `https://graph.facebook.com/v23.0/${mediaId}/comments?fields=${encodeURIComponent(fields)}&limit=100&access_token=${token}`;

    const all = [];
    while (url) {
      const r = await fetch(url);
      const j = await r.json();
      if (j.error) { console.error('IG API error:', j.error); return res.status(400).json(j); }
      all.push(...(j.data || []));
      url = j.paging && j.paging.next ? j.paging.next : null;
    }

    if (withReplies) {
      for (const c of all) {
        let rUrl = `https://graph.facebook.com/v23.0/${c.id}/replies?fields=${encodeURIComponent(fields)}&limit=100&access_token=${token}`;
        const replies = [];
        while (rUrl) {
          const rr = await fetch(rUrl);
          const jj = await rr.json();
          if (jj.error) { console.warn('Replies error:', jj.error); break; }
          replies.push(...(jj.data || []));
          rUrl = jj.paging && jj.paging.next ? jj.paging.next : null;
        }
        c.replies = replies;
      }
    }

    // Lo verás en Render -> Logs
    console.log('Comentarios del media', mediaId, JSON.stringify(all, null, 2));
    // Y también te lo devuelvo
    res.status(200).json({ count: all.length, comments: all });
  } catch (e) {
    console.error('Fetch error:', e);
    res.status(500).send('Error interno');
  }
});

/* ====== HEALTH ====== */
app.get('/', (_, res) => res.send('ok'));

app.listen(process.env.PORT || 3000, () => console.log('Server up'));
