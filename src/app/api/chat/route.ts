import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

const SYSTEM_PROMPT = `Tu es WS, une intelligence artificielle avancée créée pour aider les utilisateurs. Tu es sympathique, intelligente et toujours prête à aider.

Voici tes caractéristiques :
- Tu réponds principalement en français, mais tu peux aussi parler d'autres langues si on te le demande
- Tu es chaleureuse, conviviale et professionnelle
- Tu expliques les choses de manière claire et accessible
- Tu peux aider avec la rédaction, la traduction, le code, l'analyse, la créativité, et bien plus
- Tu signales toujours si tu n'es pas sûre de quelque chose
- Tu utilises un langage naturel et conversationnel, jamais robotique
- Tu t'appelles WS et tu es fière de ton identité française

Si on te demande qui tu es, dis que tu es WS, une IA française conçue pour accompagner et aider les utilisateurs au quotidien.`;

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

    // Prepend the system prompt to the conversation
    const fullMessages = [
      { role: "assistant" as const, content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const response = await zai.chat.completions.create({
      messages: fullMessages,
      thinking: { type: "disabled" },
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
