import { NextRequest, NextResponse } from "next/server";
import ZAI from "z-ai-web-dev-sdk";

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Un prompt est requis" },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();
    const result = await zai.image.generations.create({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = result.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Erreur lors de la génération" },
        { status: 500 }
      );
    }

    const imageRes = await fetch(imageUrl);
    const arrayBuffer = await imageRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json({
      image: `data:image/png;base64,${base64}`,
      prompt,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
