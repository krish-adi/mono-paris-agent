"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  Cpu,
  ExternalLinkIcon,
  Settings,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Tables } from "@/lib/database.types";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Task = {
  name: string;
  taskAgentId?: string;
};

type DisplayTaskCategory = {
  icon: typeof User | typeof Settings | typeof Cpu;
  title: string;
  percentage: number;
  color: string;
  background: string;
  tasks: LocalSubTask[];
};

type DashboardData = {
  title: string;
  jobTitle: string;
  irreplaceablePercentage: number;
  taskCategories: DisplayTaskCategory[];
  alertInfo: {
    title: string;
    description: string;
  };
};

const TASK_CATEGORIES = [
  "HUMAN_ONLY",
  "AUGMENTATION_POSSIBLE",
  "AUTOMATION_READY",
] as const;
type TaskCategory = (typeof TASK_CATEGORIES)[number];
type InputReportWithTasks = Tables<"reports"> & {
  job_tasks: (Tables<"job_tasks"> & {
    job_sub_tasks: Tables<"job_sub_tasks">[];
  })[];
};
type LocalSubTask = Tables<"job_sub_tasks"> & {
  time_percentage: number | null;
};
type ReportWithTasks = Tables<"reports"> & {
  job_sub_tasks: LocalSubTask[];
};

const getReport = async (reportId: string) => {
  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select(
      `
      *,
      job_tasks:job_tasks (
        *,
        job_sub_tasks:job_sub_tasks (*)
      )
    `
    )
    .eq("id", reportId)
    .single<InputReportWithTasks>();

  if (!report) {
    return report;
  }

  return {
    ...report,
    job_sub_tasks: report.job_tasks
      .flatMap((j) =>
        j.job_sub_tasks.map((s) => ({
          ...s,
          time_percentage: j.time_percentage,
        }))
      )
      .map((j) => ({
        ...j,
        task_category:
          j.task_category ||
          (TASK_CATEGORIES[
            Math.floor(Math.random() * 3)
          ] satisfies TaskCategory),
      })),
  } satisfies ReportWithTasks;
};

function LoadingSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-blue-50 rounded-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-4" />
          <div className="h-16 w-32 bg-gray-300 rounded mx-auto mb-2" />
          <div className="h-6 bg-gray-200 rounded w-32 mx-auto" />
        </div>

        <div className="h-4 bg-gray-200 rounded mb-8" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
              <div className="h-8 bg-gray-300 rounded mb-2" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-20 bg-gray-200 rounded" />
      </div>

      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-lg p-6 shadow">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
            <div className="h-2 bg-gray-200 rounded mb-4" />
            <div className="space-y-2">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Dashboard({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<ReportWithTasks | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      const fetchedReport = await getReport(reportId);
      setReport(fetchedReport);

      // If report is not ready, continue polling
      if (fetchedReport?.report_status !== "report_complete") {
        return false;
      }
      return true;
    };

    // Initial fetch
    fetchReport();

    // Set up polling every 2 seconds if report is not ready
    const interval = setInterval(async () => {
      const isCompleted = await fetchReport();
      if (isCompleted) {
        clearInterval(interval);
      }
    }, 2000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [reportId]);

  if (!report) {
    return <LoadingSkeleton />;
  }

  console.log({ report });

  if (!report?.job_sub_tasks) {
    return null;
  }

  const tempTaskCategories: DisplayTaskCategory[] = [
    {
      icon: User,
      title: "Human Only",
      background: "bg-green-500",
      color: "text-green-500",
      tasks: report.job_sub_tasks.filter(
        (task) => task.task_category === "HUMAN_ONLY"
      ),
    },
    {
      icon: Settings,
      title: "Human + AI",
      background: "bg-purple-500",
      color: "text-purple-500",
      tasks: report.job_sub_tasks.filter(
        (task) => task.task_category === "AUGMENTATION_POSSIBLE"
      ),
    },
    {
      icon: Cpu,
      title: "Automation Ready",
      background: "bg-orange-500",
      color: "text-orange-500",
      tasks: report.job_sub_tasks.filter(
        (task) => task.task_category === "AUTOMATION_READY"
      ),
    },
  ].map((c) => ({
    ...c,
    percentage: c.tasks.reduce(
      (acc, task) => acc + (task.time_percentage || 0),
      0
    ),
  }));

  const totalpercentage = tempTaskCategories.reduce(
    (acc, category) => acc + category.percentage,
    0
  );

  const taskCategories: DisplayTaskCategory[] = tempTaskCategories.map((c) => ({
    ...c,
    percentage: (c.percentage / totalpercentage || 0) * 100,
  }));

  const indexScore =
    (taskCategories
      .flatMap((c) => c.tasks)
      .reduce(
        (acc, task) =>
          acc + ((task.best_score || 0) * (task.time_percentage || 0) || 0),
        0
      ) || 0) / 10;

  console.log({ taskCategories });

  const dashboardData: DashboardData = {
    title: "4. Final Dashboard",
    jobTitle: report.job_title || "Unknown Job",
    irreplaceablePercentage: 94,
    taskCategories,
    alertInfo: {
      title: "What does this mean?",
      description: report.job_description || "No description available",
    },
  };

  return (
    <div>
      <motion.div
        className="bg-blue-50 rounded-2xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-xl text-gray-600 mb-2">{report.job_title}</h2>
          <motion.div
            className="text-6xl font-bold text-blue-900 mb-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {indexScore}%
          </motion.div>
          <div className="text-xl text-blue-600">Irreplaceable</div>
        </div>

        <div className="space-y-6">
          <Progress
            value={indexScore}
            color="#1e3a8a"
            className="h-4"
            indicatorClass="bg-blue-900"
          ></Progress>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {dashboardData.taskCategories.map((category, index) => (
            <TaskCategorySummary key={index} {...category} />
          ))}
        </div>
      </motion.div>

      <Alert variant="default">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{dashboardData.alertInfo.title}</AlertTitle>
        <AlertDescription>
          {dashboardData.alertInfo.description}
        </AlertDescription>
      </Alert>

      <div className="flex flex-col gap-6 mt-8">
        {dashboardData.taskCategories.map((category, index) => (
          <TaskCategoryDetailed key={index} reportId={reportId} {...category} />
        ))}
      </div>
    </div>
  );
}

function TaskCategorySummary({
  icon: Icon,
  title,
  percentage,
  color,
  background,
}: DisplayTaskCategory) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2")}>
            <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{percentage}%</div>
          <Progress
            value={percentage}
            className="h-2 mb-4"
            indicatorClass={background}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}

function TaskCategoryDetailed({
  icon: Icon,
  title,
  percentage,
  color,
  tasks,
  background,
  reportId,
}: DisplayTaskCategory & {
  reportId: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-2">{percentage}%</div>
          <Progress
            value={percentage}
            className="h-2 mb-4"
            indicatorClass={background}
          />
          <ul className="space-y-1 mb-4">
            {tasks.map((task, index) => {
              const label = `${task.sub_task}`;
              return (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm text-gray-600"
                >
                  {task.llm_prompt ? (
                    <Link
                      href={`/report/${reportId}/subtask/${task.id}`}
                      className="flex gap-2 items-center"
                    >
                      {label}
                      <ExternalLinkIcon size={14} />
                    </Link>
                  ) : (
                    label
                  )}
                </motion.li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
