"use client";

import { useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Button } from "@/components/ui/button";
import { Loader2, SparklesIcon } from "lucide-react";
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

export function useLoadingAnimation(isLoading: boolean) {
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
  const { currentDescription } = useLoadingAnimation(isLoading);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const title = (e.currentTarget as any).title.value;
    const description = (e.currentTarget as any).description.value;

    // console.log({ title, description });

    const apicall = await fetch(
      "https://amazing-filia-krishadi-8e7c5ed4.koyeb.app/agent/request",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_title: title,
          job_description: description || undefined,
        }),
      }
    );
    const res = z
      .object({
        report_id: z.string(),
      })
      .parse(await apicall.json());
    router.push(`/report/${res.report_id}`);
    setIsLoading(false);

    // Mock API call
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    // setIsLoading(false);
    // router.push("/report/123");
  };

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw pt-10">
      <h1 className="text-3xl font-bold text-gray-900">Generate your report</h1>
      <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Form.Field className="mb-2.5 grid" name="title">
          <div className="flex items-end justify-between">
            <Form.Label className="text-sm font-medium text-gray-700">
              Job Title <span className="text-red-600">*</span>
            </Form.Label>

            <Button
              size="sm"
              className="flex gap-1"
              variant="ghost"
              type="button"
            >
              <SparklesIcon size="14" /> Auto-fill
            </Button>
          </div>
          <Form.Control asChild>
            <Input
              name="title"
              type="text"
              required
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
              placeholder="Enter job description (optional)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <Button
            type="submit"
            className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate my report"}
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
