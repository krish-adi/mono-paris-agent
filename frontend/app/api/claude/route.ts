import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";
import { Message } from "@/lib/types";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, sessionId, systemPrompt } = body;

    if (!messages || !Array.isArray(messages) || !sessionId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const defaultSystemPrompt = `You are Claude, an AI assistant. Please follow these guidelines:
  - Provide concise, direct answers focused on the user's question
  - Use a friendly but professional tone
  - Keep responses focused and structured
  - Use markdown formatting when appropriate
  
  Current conversation context: This is a continuing conversation with session ID ${sessionId}.`;

    if (systemPrompt) {
      console.log("Using custom system prompt");
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.7,
      system: systemPrompt || defaultSystemPrompt,
      messages: messages.map((m: Message) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.content,
      })),
      stream: true,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === "content_block_delta" && "text" in chunk.delta) {
              controller.enqueue(chunk.delta.text);
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.error?.message || "Unknown error",
        type: error?.error?.type || "unknown",
      },
      { status: error?.status || 500 }
    );
  }
}
