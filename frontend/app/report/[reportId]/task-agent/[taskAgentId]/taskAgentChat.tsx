"use client";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";

export default function TaskAgentChat({
  reportId,
  taskAgentId,
}: {
  reportId: string;
  taskAgentId: string;
}) {
  const [sessionId] = useState<string>(uuidv4());

  const [messages, setMessages] = useState<Message[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Please describe me the issue you want to solve",
      createdAt: new Date(),
    },
  ]);
  console.log(messages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
    setIsLoading(true);
    setStreamingMessage("");

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeMessage = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        completeMessage += chunk;
        setStreamingMessage(completeMessage);
      }

      const finalMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: completeMessage,
        createdAt: new Date(),
      };

      setMessages((prevMessages) => [...prevMessages, finalMessage]);
      setStreamingMessage("");
    } catch (error) {
      console.error("Error calling Claude API:", error);
    } finally {
      setIsLoading(false);
    }
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
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
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
                <p>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {streamingMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-left"
          >
            <Card>
              <CardContent className="p-3">
                <p className="text-green-600">Claude:</p>
                <p>{streamingMessage}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <Textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-grow min-h-[44px] p-2"
        />
        <Button type="submit" disabled={isLoading} size="lg">
          <Send className="mr-2 h-4 w-4" />
          Send
        </Button>
      </form>
    </div>
  );
}
