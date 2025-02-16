"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock function to simulate Claude LLM response
const mockClaudeResponse = async (prompt: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return `Here's a response to "${prompt}" from Claude LLM.`;
};

export default function TaskAgentChat({
  reportId,
  taskAgentId,
}: {
  reportId: string;
  taskAgentId: string;
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setInput("");

    const systemPrompt =
      "You are an AI assistant helping to automate tasks for a Junior Software Developer.";
    const fullPrompt = `${systemPrompt}\n\nUser: ${input}`;

    const response = await mockClaudeResponse(fullPrompt);
    setMessages((prev) => [...prev, { role: "assistant", content: response }]);
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Chat with Claude LLM</span>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/report/${reportId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Report
                </Link>
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Current task: Task 4 (Human + AI)
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <ScrollArea className="h-[60vh] rounded-md border p-4 mb-4">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <Card>
              <CardContent className="p-3">
                <p
                  className={
                    message.role === "user" ? "text-blue-600" : "text-green-600"
                  }
                >
                  {message.role === "user" ? "You" : "Claude"}:
                </p>
                <p>{message.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
