"use client";

import { useState } from "react";
import * as Form from "@radix-ui/react-form";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    alert("Form submitted");
  };

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <Form.Root onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Form.Field className="mb-2.5 grid" name="title">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-sm font-medium text-gray-700">
              Job Title
            </Form.Label>
            <div className="flex gap-2 items-end">
              <Form.Message
                className="text-sm text-red-600"
                match="valueMissing"
              >
                Please enter a job title
              </Form.Message>
            </div>
          </div>
          <Form.Control asChild>
            <input
              type="text"
              required
              placeholder="Head of Developer Relations"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Form.Control>
        </Form.Field>
        <Form.Field className="mb-2.5 grid" name="description">
          <div className="flex items-baseline justify-between">
            <Form.Label className="text-sm font-medium text-gray-700">
              Job Description
            </Form.Label>
          </div>
          <Form.Control asChild>
            <textarea
              placeholder="Enter job description (optional)"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </Form.Control>
        </Form.Field>
        <Form.Submit asChild>
          <Button
            type="submit"
            className={`mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        </Form.Submit>
      </Form.Root>
    </main>
  );
}
