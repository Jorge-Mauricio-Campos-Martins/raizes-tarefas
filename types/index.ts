export type Priority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "done";
export type CaptureSource = "voice" | "text" | "manual";

export interface Project {
  id: string;
  name: string;
  color: string;
  position: number;
  is_archived: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  status: TaskStatus;
  position: number;
  source: CaptureSource;
  raw_capture_text: string | null;
  created_at: string;
  updated_at: string;
  attachment_count?: number;
}

export interface Attachment {
  id: string;
  task_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
}

export interface ParsedTask {
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Priority;
  suggested_project: string | null;
}

export interface BoardColumn extends Project {
  tasks: Task[];
}
