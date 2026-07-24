import type { Metadata } from "next";
import { TasksApp } from "@/components/tasks/TasksApp";

export const metadata: Metadata = {
  title: "Tasks · MindfulTech",
  // private board — keep it out of search engines
  robots: { index: false, follow: false },
};

export default function TasksPage() {
  return <TasksApp />;
}
