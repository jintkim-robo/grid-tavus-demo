// api/start.js
module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TAVUS_API_KEY;
    const replicaId = process.env.TAVUS_REPLICA_ID;
    const personaId = process.env.TAVUS_PERSONA_ID;

    if (!apiKey || !replicaId) {
      res.statusCode = 500;
      return res.end("Missing env vars: TAVUS_API_KEY / TAVUS_REPLICA_ID");
    }

    const r = await fetch("https://api.tavus.io/v2/conversations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replica_id: replicaId,
        ...(personaId ? { persona_id: personaId } : {}),
        conversation_name: "GRID Guide Demo",
      }),
    });

    const data = await r.json();

    if (!r.ok || !data?.conversation_url) {
      res.statusCode = r.status || 500;
      return res.end(JSON.stringify(data));
    }

    // ★ここが重要：会話URLへリダイレクト
    res.statusCode = 302;
    res.setHeader("Location", data.conversation_url);
    return res.end();
  } catch (e) {
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: e?.message || String(e) }));
  }
};
