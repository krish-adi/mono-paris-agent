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
    const { messages, sessionId } = body;

    if (!messages || !Array.isArray(messages) || !sessionId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.7,
      system: `You are Claude, an AI assistant. Please follow these guidelines:
  - Provide concise, direct answers focused on the user's question
  - Use a friendly but professional tone
  - Break down complex topics into clear explanations
  - If unsure about something, acknowledge the uncertainty
  - For code questions, include examples and explain key concepts
  - Format responses using markdown when appropriate
  - Avoid speculating about events after April 2024
  - Never share personal data or sensitive information
  
  Current conversation context: This is a continuing conversation with session ID ${sessionId}.
  Current task context: Helping user with a technical question about ${messages[messages.length - 1].content}`,
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
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
