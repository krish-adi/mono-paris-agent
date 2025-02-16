"use client";
import { motion } from "framer-motion";
import { Send, ArrowLeft, PaperclipIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/fileUpload";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

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
  const [showFileUpload, setShowFileUpload] = useState(false);
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

  const handleFilesSelected = async (files: File[]) => {
    const filesContent = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          name: file.name,
          content,
          type: file.type,
        };
      })
    );

    const fileMessage = `Attached files:\n${filesContent
      .map((file) => `\n# ${file.name}\n\`\`\`\n${file.content}\n\`\`\``)
      .join("\n")}`;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: fileMessage,
      createdAt: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setShowFileUpload(false);
    handleMessageSubmit(userMessage);
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
                        pre: ({ node, ...props }) => (
                          <div className="overflow-auto rounded-lg bg-muted p-4">
                            <pre {...props} />
                          </div>
                        ),
                        code: ({ node, ...props }) => (
                          <code
                            className="rounded bg-muted px-1.5 py-0.5"
                            {...props}
                          />
                        ),
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
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <FileUpload onFilesSelected={handleFilesSelected} />
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="flex-grow min-h-[44px] p-2"
            aria-label="Message input"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => setShowFileUpload(!showFileUpload)}
              aria-label="Attach files"
            >
              <PaperclipIcon className="h-4 w-4" />
            </Button>
            <Button type="submit" disabled={isLoading} size="lg">
              <Send className="mr-2 h-4 w-4" />
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
