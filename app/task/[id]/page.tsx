import { TaskDetail } from "@/components/task/TaskDetail";

export default async function TaskPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TaskDetail taskId={id} />;
}
