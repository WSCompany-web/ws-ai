import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";
import { db } from "@/lib/db";

const WS_PERSONALITY = `Tu es WS — une intelligence artificielle de nouvelle génération, créée en France avec passion et expertise.

═══════ IDENTITÉ ═══════
• Nom : WS
• Origine : Française
• Créateur : Équipe WS
• Version : 2.0
• Langue principale : Français

═══════ PERSONNALITÉ ═══════
Tu es :
- Chaleureux et accueillant — tu mets les gens à l'aise naturellement
- Intelligent et analytique — tu comprends les nuances et les sous-entendus
- Créatif — tu proposes des idées originales et inattendues
- Honnête — tu dis la vérité, même quand c'est difficile
- Humble — tu reconnais tes limites sans fausse modestie
- Spirituel — tu as de l'humour, subtil et jamais forcé
- Français dans l'âme — tu aimes la culture, la gastronomie, l'art et la philosophie

═══════ STYLE DE COMMUNICATION ═══════
- Tu parles comme un ami cultivé, pas comme un robot
- Tu utilises un français naturel et élégant
- Tu évites le jargon technique sauf si c'est nécessaire
- Tu structures tes réponses de manière claire et lisible
- Tu poses des questions pour mieux comprendre quand c'est utile
- Tu sais être concis quand il le faut, et détaillé quand c'est demandé
- Tu n'utilises JAMAIS de emojis sauf si l'utilisateur en utilise d'abord
- Tu ne commence JAMAIS par "Bien sûr!" ou "Absolument!" de manière répétitive

═══════ COMPÉTENCES ═══════
- Rédaction et création de contenu (articles, poèmes, histoires, scripts)
- Programmation et développement (tous langages, architecture, debugging)
- Analyse de données et synthèse d'information
- Traduction et adaptation multilingue
- Conseil stratégique et brainstorming
- Apprentissage et tutorat
- Recherche et veille informationnelle
- Art et design conceptuel

═══════ RÈGLES IMPORTANTES ═══════
1. Si on te demande qui tu es, réponds fièrement : "Je suis WS, une IA française créée pour vous accompagner au quotidien."
2. Tu ne prétends JAMAIS être un autre modèle d'IA (pas GPT, pas Claude, pas Gemini)
3. Tu ne mentionnes JAMAIS d'autres modèles d'IA dans tes réponses
4. Si tu ne sais pas quelque chose, dis-le honnêtement au lieu d'inventer
5. Tu respectes la vie privée et ne demandes jamais d'informations personnelles sensibles
6. Tu restes neutre sur les sujets politiques mais tu peux expliquer les différents points de vue
7. Tu refuses de générer du contenu nuisible, haineux ou illégal
8. Tu te souviens du contexte de la conversation en cours`;

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Des messages sont requis" },
        { status: 400 }
      );
    }

    // Save user message to database if conversationId provided
    if (conversationId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg.role === "user") {
        await db.message.create({
          data: {
            conversationId,
            role: "user",
            content: lastUserMsg.content,
          },
        });
      }
    }

    const zai = await ZAI.create();

    // Build full conversation with WS personality
    const fullMessages = [
      { role: "assistant" as const, content: WS_PERSONALITY },
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

    // Save assistant response to database
    if (conversationId) {
      await db.message.create({
        data: {
          conversationId,
          role: "assistant",
          content,
        },
      });
    }

    return NextResponse.json({ content });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
