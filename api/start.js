const _fetch =
  globalThis.fetch ||
  ((...args) => import('node-fetch').then(({ default: f }) => f(...args)));

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.TAVUS_API_KEY;
    const replicaId = process.env.TAVUS_REPLICA_ID;
    const personaId = process.env.TAVUS_PERSONA_ID;

    if (!apiKey || !replicaId) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(
        JSON.stringify({
          error: 'Missing env vars',
          apiKey: !!apiKey,
          replicaId: !!replicaId,
        }),
      );
    }

    const response = await _fetch('https://api.tavus.io/v2/conversations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: replicaId,
        ...(personaId ? { persona_id: personaId } : {}),
        conversation_name: 'GRID Guide Demo',
      }),
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!response.ok || !data?.conversation_url) {
      res.statusCode = response.status || 500;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ status: response.status, data }));
    }

    res.statusCode = 302;
    res.setHeader('Location', data.conversation_url);
    return res.end();
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    return res.end(
      JSON.stringify({ error: e?.message || String(e) }),
    );
  }
};
