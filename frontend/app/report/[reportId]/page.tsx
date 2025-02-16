import { Button } from "@/components/ui/button";
import { Dashboard } from "../../dashboard";
import Link from "next/link";

export default function Report() {
  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <Dashboard />
      <Button
        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        asChild
      >
        <Link href="/">Find out for other roles</Link>
      </Button>
    </main>
  );
}
