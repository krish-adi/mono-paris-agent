import { Button } from "@/components/ui/button";
import Link from "next/link";
import TaskAgentChat from "./taskAgentChat";

export default async function TaskAgent({
  params,
}: {
  params: Promise<{ reportId: string; taskAgentId: string }>;
}) {
  const { reportId, taskAgentId } = await params;

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <TaskAgentChat reportId={reportId} taskAgentId={taskAgentId} />
      <h1 className="text-2xl font-bold">Task Agent Details</h1>
      <p>Report ID: {reportId}</p>
      <p>Task Agent ID: {taskAgentId}</p>
    </main>
  );
}
