import { Button } from "@/components/ui/button";
import Link from "next/link";
import TaskAgentChat from "./taskAgentChat";
import { createClient } from "@/utils/supabase/client";

export default async function TaskAgent({
  params,
}: {
  params: Promise<{ reportId: string; taskAgentId: string }>;
}) {
  const { reportId, taskAgentId } = await params;

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <TaskAgentChat reportId={reportId} taskAgentId={taskAgentId} />
    </main>
  );
}
