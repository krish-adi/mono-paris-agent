"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRightIcon,
  CogIcon,
  Cpu,
  ExternalLinkIcon,
  Settings,
  User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";

type Task = {
  name: string;
  taskAgentId?: string;
};

type TaskCategory = {
  icon: typeof User | typeof Settings | typeof Cpu;
  title: string;
  percentage: number;
  color: string;
  tasks: Task[];
};

type DashboardData = {
  title: string;
  jobTitle: string;
  irreplaceablePercentage: number;
  taskCategories: TaskCategory[];
  alertInfo: {
    title: string;
    description: string;
  };
};

const dashboardData: DashboardData = {
  title: "4. Final Dashboard",
  jobTitle: "Junior Software Developer",
  irreplaceablePercentage: 94,
  taskCategories: [
    {
      icon: User,
      title: "Human Only",
      percentage: 57,
      color: "bg-blue-600",
      tasks: [{ name: "Task 1" }, { name: "Task 2" }, { name: "Task 3" }],
    },
    {
      icon: Settings,
      title: "Human + AI",
      percentage: 37,
      color: "bg-purple-500",
      tasks: [
        { name: "Task 4", taskAgentId: "456" },
        { name: "Task 5" },
        { name: "Task 6" },
      ],
    },
    {
      icon: Cpu,
      title: "Automatable",
      percentage: 6,
      color: "bg-gray-500",
      tasks: [{ name: "Task 7", taskAgentId: "789" }, { name: "Task 8" }],
    },
  ],
  alertInfo: {
    title: "What does this mean?",
    description:
      "As a Junior Software Developer, your role remains highly irreplaceable. While some routine tasks can be automated, the majority of your work requires human judgment, creativity, and collaboration. The significant portion of human+AI tasks suggests that leveraging AI tools will enhance your productivity while maintaining human oversight.",
  },
};

export function Dashboard() {
  return (
    <div>
      <motion.div
        className="bg-blue-50 rounded-2xl p-8 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h2 className="text-xl text-gray-600 mb-2">
            {dashboardData.jobTitle}
          </h2>
          <motion.div
            className="text-6xl font-bold text-blue-900 mb-2"
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            {dashboardData.irreplaceablePercentage}%
          </motion.div>
          <div className="text-xl text-blue-600">Irreplaceable</div>
        </div>

        <div className="space-y-6">
          <Progress
            value={dashboardData.irreplaceablePercentage}
            className="h-4"
          />
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
          <TaskCategoryDetailed key={index} {...category} />
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
}: TaskCategory) {
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
          <Progress value={percentage} className="h-2 mb-4" />
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
}: TaskCategory) {
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
          <Progress value={percentage} className="h-2 mb-4" />
          <ul className="space-y-1 mb-4">
            {tasks.map((task, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm text-gray-600"
              >
                {task.taskAgentId ? (
                  <Link
                    href={`/report/123/task-agent/${task.taskAgentId}`}
                    className="flex gap-2 items-center"
                  >
                    {task.name}
                    <ExternalLinkIcon size={14} />
                  </Link>
                ) : (
                  task.name
                )}
              </motion.li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
