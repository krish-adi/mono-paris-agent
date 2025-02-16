import { NextResponse } from "next/server";
import { Anthropic } from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error("Missing ANTHROPIC_API_KEY environment variable");
}

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are an AI assistant helping to generate sample job descriptions.
Generate a random job title and description for a tech company.
You must respond with ONLY a valid JSON object containing these exact keys:
{
  "job_title": "title here",
  "job_description": "description here"
}
The description should be 2-3 paragraphs long.
Do not include any other text or explanation in your response.`;

function cleanJsonString(str: string): string {
  // Remove any leading/trailing non-JSON content
  const jsonStart = str.indexOf("{");
  const jsonEnd = str.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error("No valid JSON object found in response");
  }

  const jsonStr = str.slice(jsonStart, jsonEnd + 1);
  // Replace problematic characters
  return jsonStr.replace(/[\n\r\t]/g, " ");
}

export async function GET() {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.9,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: "Generate a sample tech job posting" },
      ],
    });

    const cleanedJson = cleanJsonString(response.content[0].text);
    const result = JSON.parse(cleanedJson);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error?.message,
        raw: process.env.NODE_ENV === "development" ? error : undefined,
      },
      { status: 500 }
    );
  }
}
