import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET all conversations
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 1, // Just get first message for preview
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST create a new conversation
export async function POST(req: NextRequest) {
  try {
    const { title } = await req.json();

    const conversation = await db.conversation.create({
      data: {
        title: title || "Nouvelle conversation",
      },
    });

    return NextResponse.json({ conversation });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
