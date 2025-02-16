import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function TaskAgent({
  params,
}: {
  params: Promise<{ reportId: string; taskAgentId: string }>;
}) {
  const { reportId, taskAgentId } = await params;

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <h1 className="text-2xl font-bold">Task Agent Details</h1>
      <p>Report ID: {reportId}</p>
      <p>Task Agent ID: {taskAgentId}</p>
      <Button
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        asChild
      >
        <Link href={`/report/${reportId}`}>Back to Report</Link>
      </Button>
    </main>
  );
}
