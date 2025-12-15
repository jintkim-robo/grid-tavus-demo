module.exports = async (req, res) => {
  try {
    // 1) Vercelの環境変数から値を読む
    const apiKey = process.env.TAVUS_API_KEY;
    const replicaId = process.env.TAVUS_REPLICA_ID;
    const personaId = process.env.TAVUS_PERSONA_ID;

    // 2) 足りないものがあれば、分かりやすく止める
    if (!apiKey) return res.status(500).send("Missing TAVUS_API_KEY");
    if (!replicaId) return res.status(500).send("Missing TAVUS_REPLICA_ID");

    // 3) Tavusに「新しい会話を作って」とお願いする
    const r = await fetch("https://api.tavus.io/v2/conversations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`, // ★Bearerが重要
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        replica_id: replicaId,             // ★replica_idが重要
        ...(personaId ? { persona_id: personaId } : {}),
        conversation_name: "GRID Guide Demo",
      }),
    });

    const data = await r.json();

    // 4) Tavusが失敗したら、エラー内容を表示
    if (!r.ok || !data?.conversation_url) {
      return res.status(r.status || 500).json(data);
    }

    // 5) 成功したら、その会話URLへ自動で飛ばす（リダイレクト）
    res.writeHead(302, { Location: data.conversation_url });
    res.end();
  } catch (e) {
    // 6) 何かで落ちても、理由を表示
    res.status(500).json({ error: e?.message || String(e) });
  }
};
