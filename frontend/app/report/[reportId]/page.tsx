import { Button } from "@/components/ui/button";
import { Dashboard } from "../../dashboard";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Tables } from "@/lib/database.types";
import { ArrowLeft } from "lucide-react";

export default async function Report({
  params,
}: {
  params: Promise<{ reportId: string }>;
}) {
  const { reportId } = await params;

  return (
    <main className="flex-1 flex flex-col gap-6 px-8 max-w-3xl w-svw">
      <Dashboard reportId={reportId} />
      <Button className="my-4" asChild variant="outline" size="lg">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Find out for other roles
        </Link>
      </Button>
    </main>
  );
}
