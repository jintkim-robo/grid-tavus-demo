export default async function handler(req, res) {
  try {
    const response = await fetch("https://tavusapi.com/v2/conversations", {
      method: "POST",
      headers: {
        "Authorization": process.env.TAVUS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        persona_id: process.env.TAVUS_PERSONA_ID,
        conversation_name: "GRID Guide Demo"
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
