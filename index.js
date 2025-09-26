const express = require("express");
const fetch = require("node-fetch");
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 10000;

// ⚠️ Token de Instagram: debes configurarlo en Render → Environment
const IG_TOKEN = process.env.IG_TOKEN || "<IGAAXyZCcz6eItBZAFFIVENEVnhiSGtyLXdLdTQtTjlOLW9rRkV4QkJpNUJFbktyZAGlSUWVGWGNoSHBfQnlZAUk43bzBSWUZAsVG1hX0J0WWRHcXFTZA3Nkcng1SjNiT1Rhc3JLYndEaVZAzdEhMMFlwMXFWRmZALUUtYc1F2Y0lMOFZAvcwZDZD>";
const MEDIA_ID = "17957370383995377"; // el ID del vídeo que quieres

// Endpoint de prueba
app.get("/", (req, res) => {
  res.send("Servidor activo 🚀");
});

// Nuevo endpoint para traer comentarios
app.get("/comments", async (req, res) => {
  try {
    const url = `https://graph.facebook.com/v23.0/${MEDIA_ID}/comments?fields=id,text,username&access_token=${IG_TOKEN}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log("Comentarios:", JSON.stringify(data, null, 2));

    res.json(data); // lo devuelve en el navegador
  } catch (err) {
    console.error("Error al traer comentarios:", err);
    res.status(500).json({ error: "No se pudieron traer comentarios" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
