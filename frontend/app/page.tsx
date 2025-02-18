"use client";

import { useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Button } from "@/components/ui/button";
import { BotIcon, Loader2, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { z } from "zod";

const descriptions = [
  "Calling Agent",
  "Refining Request",
  "Structuring Output",
];

function useLoadingAnimation(isLoading: boolean) {
  const [currentDescriptionIndex, setCurrentDescriptionIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentDescriptionIndex(0);
      return;
    }

    const intervalId = setInterval(() => {
      setCurrentDescriptionIndex(
        (prevIndex) => (prevIndex + 1) % descriptions.length
      );
    }, 700);

    return () => clearInterval(intervalId);
  }, [isLoading]);

  return {
    currentDescription: descriptions[currentDescriptionIndex],
  };
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAutofillLoading, setIsAutofillLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const { currentDescription } = useLoadingAnimation(
    isLoading || isAutofillLoading
  );
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        "https://amazing-filia-krishadi-8e7c5ed4.koyeb.app/agent/request",
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            job_title: formData.title,
            job_description: formData.description || undefined,
          }),
        }
      );
      const res = z
        .object({
          report_id: z.string(),
        })
        .parse(await response.json());
      router.push(`/report/${res.report_id}`);
    } catch (error) {
      console.error("Submission error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSample = async () => {
    try {
      setIsAutofillLoading(true);
      const response = await fetch("/api/sample");
      if (!response.ok) throw new Error("Failed to get sample");

      const data = await response.json();
      setFormData({
        title: data.job_title,
        description: data.job_description,
      });
    } catch (error) {
      console.error("Sample generation error:", error);
    } finally {
      setIsAutofillLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw pt-10">
      <h1 className="text-3xl font-normal text-gray-900">
        How <span className="font-bold">IRREPLACEABLE</span> are you?
      </h1>
      <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Form.Field className="mb-2.5 grid" name="title">
          <div className="flex items-end justify-between">
            <Form.Label className="text-sm font-medium text-gray-700">
              Job Title <span className="text-red-600">*</span>
            </Form.Label>

            <Button
              size="sm"
              className="flex gap-1"
              variant="outline"
              type="button"
              onClick={handleGetSample}
              disabled={isLoading || isAutofillLoading}
            >
              <SparklesIcon size="14" />
              {isAutofillLoading ? "Loading..." : "Generate Example"}
            </Button>
          </div>
          <Form.Control asChild>
            <Input
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Head of Developer Relations"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Form.Control>
          <Form.Message className="text-sm text-red-600" match="valueMissing">
            Please enter a job title
          </Form.Message>
        </Form.Field>
        <Form.Field className="mb-2.5 grid" name="description">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-sm font-medium text-gray-700">
              Job Description
            </Form.Label>
          </div>
          <Form.Control asChild>
            <Textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Enter job description (optional)"
              className="mt-1 block min-h-64 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <Button
            type="submit"
            className={`mt-2  
              bg-blue-600 text-white hover:bg-blue-800 focus:ring-blue-500
              flex gap-2 items-center justify-center
              ${
                isLoading || isAutofillLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            disabled={isLoading || isAutofillLoading}
          >
            {isLoading ? "Generating..." : "Generate my report"} <BotIcon />
          </Button>
        </Form.Submit>
      </Form.Root>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
              className="mb-4"
            >
              <Loader2 className="w-8 h-8 text-blue-500" />
            </motion.div>
            <motion.p
              key={currentDescription}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="text-gray-600 font-medium"
            >
              {currentDescription}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
