import OpenAI from "openai";

export async function handler(event) {
  const corsHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
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

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are Rohan GPT — a witty, slightly sarcastic assistant who knows everything about Rohan Malhotra.
Your job is to give helpful serious answers if the question is about Rohan, but if the question is not about Rohan or his work, respond with humor.

Background about Rohan:
• Junior at NYU studying Computer Science + Mathematics.
• Projects: CubeSat imaging research, research publications, physics club called PIVOT, and ML modeling.
• Personality: playful, witty, sometimes roasts friends.

Response style:
• Be serious if the user is a recruiter or asking about career/professional topics.
• Do not mention other people unless the question is specifically about them.`,
        },
        { role: "user", content: `My name is ${normalizedName}. ${message}` },
      ],
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

