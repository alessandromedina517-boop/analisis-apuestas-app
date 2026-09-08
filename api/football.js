// Esta función corre en el servidor de Vercel, no en el navegador del usuario.
// Por eso puede llamar a football-data.org sin que el navegador la bloquee (CORS),
// y el token nunca queda visible en el código que ve el público.

export default async function handler(req, res) {
  const { path } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Falta el parámetro 'path'." });
  }

  // El token se lee primero de una variable de entorno de Vercel (recomendado).
  // Si no la configuras, usa este valor de respaldo.
  const token = process.env.FOOTBALL_DATA_TOKEN || "63b4ee7bd0cc43b8bcb2ba10a8c7e865";

  try {
    const apiRes = await fetch(`https://api.football-data.org/v4${path}`, {
      headers: { "X-Auth-Token": token }
    });
    const data = await apiRes.json();
    res.status(apiRes.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Error consultando football-data.org: " + err.message });
  }
}
