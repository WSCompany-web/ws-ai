import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Des messages sont requis" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const response = await zai.chat.completions.create({
      model: "glm-4-plus",
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "system" | "user" | "assistant",
        content: m.content,
      })),
    });

    const content = response.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: "Pas de réponse générée" },
        { status: 500 }
      );
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
