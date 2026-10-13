import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { content, platform } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY || process.env.XAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "No AI API key configured (OPENAI_API_KEY or XAI_API_KEY)" },
      { status: 500 }
    );
  }

  const baseUrl = process.env.XAI_API_KEY
    ? "https://api.x.ai/v1/chat/completions"
    : "https://api.openai.com/v1/chat/completions";

  const model = process.env.XAI_API_KEY ? "grok-3" : "gpt-4o-mini";

  try {
    const res = await fetch(baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: `Adapt the following social media post for ${platform}. Respect character limits and platform style. Return only the adapted text.`,
          },
          { role: "user", content },
        ],
        max_tokens: 500,
      }),
    });
    const data = await res.json();
    const adapted = data.choices?.[0]?.message?.content?.trim() || content;
    return NextResponse.json({ adapted });
  } catch (e) {
    return NextResponse.json({ error: "AI adaptation failed", original: content }, { status: 500 });
  }
}
