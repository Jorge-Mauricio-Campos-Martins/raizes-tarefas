import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/clientApi";
import type { BoardColumn, Task } from "@/types";

const PROJECTS_KEY = ["projects"];
const TASKS_KEY = ["tasks"];

export function useBoard() {
  const queryClient = useQueryClient();

  const projectsQuery = useQuery({ queryKey: PROJECTS_KEY, queryFn: api.projects.list });
  const tasksQuery = useQuery({ queryKey: TASKS_KEY, queryFn: api.tasks.list });

  const columns: BoardColumn[] = (projectsQuery.data?.projects ?? []).map((project) => ({
    ...project,
    tasks: (tasksQuery.data?.tasks ?? [])
      .filter((t) => t.project_id === project.id)
      .sort((a, b) => a.position - b.position),
  }));

  const unassigned = (tasksQuery.data?.tasks ?? []).filter((t) => t.project_id === null);

  const moveTask = useMutation({
    mutationFn: ({
      taskId,
      projectId,
      position,
    }: {
      taskId: string;
      projectId: string | null;
      position: number;
    }) => api.tasks.move(taskId, projectId, position),
    onMutate: async ({ taskId, projectId, position }) => {
      await queryClient.cancelQueries({ queryKey: TASKS_KEY });
      const previous = queryClient.getQueryData<{ tasks: Task[] }>(TASKS_KEY);
      queryClient.setQueryData<{ tasks: Task[] }>(TASKS_KEY, (old) => {
        if (!old) return old;
        return {
          tasks: old.tasks.map((t) =>
            t.id === taskId ? { ...t, project_id: projectId, position } : t,
          ),
        };
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(TASKS_KEY, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const createTasks = useMutation({
    mutationFn: (tasks: Array<Partial<Task> & { title: string }>) => api.tasks.createMany(tasks),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Task> }) =>
      api.tasks.update(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => api.tasks.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TASKS_KEY }),
  });

  const createProject = useMutation({
    mutationFn: ({ name, color }: { name: string; color?: string }) =>
      api.projects.create(name, color),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });

  const updateProject = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) =>
      api.projects.update(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });

  const archiveProject = useMutation({
    mutationFn: (id: string) => api.projects.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROJECTS_KEY }),
  });

  return {
    columns,
    unassigned,
    isLoading: projectsQuery.isLoading || tasksQuery.isLoading,
    isError: projectsQuery.isError || tasksQuery.isError,
    moveTask,
    createTasks,
    updateTask,
    deleteTask,
    createProject,
    updateProject,
    archiveProject,
  };
}
