"use client";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

const CodeBlock = ({ inline, className, children }: any) => {
  if (inline) {
    return <code className="rounded px-1.5 py-0.5 text-sm">{children}</code>;
  }

  const language = /language-(\w+)/.exec(className || "")?.[1] || "text";
  return (
    <div className="relative rounded-md my-4">
      <div className="absolute right-2 top-2 text-xs text-muted-foreground px-2 py-1 rounded bg-background/90">
        {language}
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        className="rounded-md ! !mt-0 !mb-0"
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: "1.5rem 1rem",
          fontSize: "0.9rem",
        }}
      >
        {String(children).trim()}
      </SyntaxHighlighter>
    </div>
  );
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleMessageSubmit = async (message: Message) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, message],
          sessionId,
        }),
      });

      if (!response.ok) throw new Error("API request failed");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let completeMessage = "";

      // Add placeholder for assistant message
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        completeMessage += chunk;

        // Update the assistant message directly instead of using separate streaming state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: completeMessage }
              : m
          )
        );
      }
    } catch (error) {
      console.error("Error calling Claude API:", error);
    } finally {
      setIsLoading(false);
    }
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
    handleMessageSubmit(userMessage);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="container mx-auto p-4 pb-0">
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

      <ScrollArea className="h-[60vh] rounded-md p-4 mb-4">
        <div className="space-y-4">
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
                      message.role === "user"
                        ? "text-blue-600"
                        : "text-green-600"
                    }
                  >
                    {message.role === "user" ? "You" : "Claude"}:
                  </p>
                  <div className="prose max-w-none dark:prose-invert">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                      components={{
                        code: CodeBlock,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          <div ref={messagesEndRef} /> {/* Scroll anchor */}
        </div>
      </ScrollArea>

      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="relative flex gap-2">
          <div className="relative flex-1 bg-background rounded-md border">
            <Textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              className="min-h-[40px] resize-none border-0 focus-visible:ring-0 bg-transparent shadow-none"
              aria-label="Message input"
            />
            <div className="flex justify-end p-2 pb-0">
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={isLoading}
                className="h-8 w-8 hover:bg-accent"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
