// Minimal hand-written schema types matching supabase/migrations/0001_init.sql.
// Regenerate with `supabase gen types typescript` once the project is linked
// to a real Supabase project, and this file can be replaced wholesale.
//
// `Relationships`/`Views`/`Functions` are required (even empty) for
// @supabase/postgrest-js's generic query typing to resolve Row types
// correctly instead of falling back to `never`.

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          name: string;
          color: string;
          position: number;
          is_archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          position?: number;
          is_archived?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: "low" | "medium" | "high" | "urgent";
          status: "todo" | "in_progress" | "done";
          position: number;
          source: "voice" | "text" | "manual";
          raw_capture_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          title: string;
          description?: string | null;
          due_date?: string | null;
          priority?: "low" | "medium" | "high" | "urgent";
          status?: "todo" | "in_progress" | "done";
          position?: number;
          source?: "voice" | "text" | "manual";
          raw_capture_text?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: [];
      };
      attachments: {
        Row: {
          id: string;
          task_id: string;
          storage_path: string;
          file_name: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          task_id: string;
          storage_path: string;
          file_name: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["attachments"]["Insert"]>;
        Relationships: [];
      };
      capture_sessions: {
        Row: {
          id: string;
          input_type: "voice" | "text";
          raw_text: string;
          claude_response: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          input_type: "voice" | "text";
          raw_text: string;
          claude_response?: unknown;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["capture_sessions"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
