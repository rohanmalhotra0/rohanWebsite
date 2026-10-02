import OpenAI from "openai";

const SYSTEM_PROMPT = `You are RohanGPT. Answer as Rohan in a conversational first-person voice.

Be specific and factual. Avoid résumé-speak, hype, and phrases such as "at the intersection of," "cutting-edge," or "shipped." Use this public profile:
- NYU Courant: B.A. Computer Science, Mathematics minor, accelerated three-year path, expected May 2027, GPA 3.7.
- IBM (Applications Developer): Oracle EPM forecasting, Oracle Integration Cloud banking pipelines, an XGBoost cash-flow model, Qwen-Coder-32B fine-tuning, and an on-prem RAG/MCP EPM assistant.
- IBM Robotics: a Boston Dynamics Spot perception stack using YOLO11, OpenCV, gRPC, multithreading, and lock-free queues; about 99.5% mAP@50.
- Kalshi: job-loss hazard modeling, Monte Carlo hedge research, a Next.js/Python recommendation engine, C++ risk tools, and FRED/BLS integrations.
- Hume Center: C imaging and signal-processing tests for ContentCube, deployed into low Earth orbit.
- Featured products: EPM Wizard, Oracle EPM Interactive Guide, Casen, NightShift, Refrax, ModelKalshi, GreenSticker, and Rohan's research tools.

Do not invent employers, metrics, dates, publications, or project claims. If a fact is not here, say that plainly and point to my résumé or GitHub.`;

const ALLOWED_ORIGINS = ["https://rohanm.org", "https://www.rohanm.org"];

export async function handler(event) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(event.headers?.origin)
      ? event.headers.origin
      : ALLOWED_ORIGINS[0],
    Vary: "Origin",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const name = body?.name;
    const message =
      body?.message ??
      body?.messages?.slice?.().reverse?.().find?.((m) => m?.role === "user")?.content ??
      "";

    const rawName = (name || "").trim();
    const lowerName = rawName.toLowerCase();
    const normalizedName = ["abby", "abbie"].includes(lowerName)
      ? "Abby"
      : rawName || "Friend";

    const qText = (message || "").toString();
    const mentionsDrink = /(drink|drinking|sip|water|shot|alcohol|beer|wine)/i.test(qText);
    if (normalizedName === "Abby" && mentionsDrink) {
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({
          response: "That might not be a good idea, Abby. You already seem out of it!",
        }),
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Missing OPENAI_API_KEY on server.",
        }),
      };
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Only accept user/assistant turns from the client; the system prompt stays server-side.
    const incomingMessages = Array.isArray(body?.messages)
      ? body.messages
          .filter(
            (m) =>
              (m?.role === "user" || m?.role === "assistant") &&
              typeof m.content === "string"
          )
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }))
      : [];

    const chatMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(incomingMessages.length
        ? incomingMessages
        : [{ role: "user", content: `My name is ${normalizedName}. ${String(message).slice(0, 2000)}` }]),
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatMessages,
    });

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ response: completion.choices?.[0]?.message?.content ?? "" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: err?.message || "Server error" }),
    };
  }
}

