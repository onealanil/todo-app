"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";

export default function TodoList() {
  const [newTask, setNewTask] = useState("");
  const utils = api.useContext();

  const { data, isLoading } = api.task.getAll.useQuery();
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      setNewTask("");
      void utils.task.getAll.invalidate();
    },
  });
  const isCreating: boolean = createTask.isPending;

  const toggleTask = api.task.toggle.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
    },
  });

  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      void utils.task.getAll.invalidate();
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (newTask.trim() && !isCreating) {
            createTask.mutate({ title: newTask });
          }
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 rounded-md border-2 border-zinc-800 bg-neutral-900 px-4 py-2 text-white"
          placeholder="New task..."
        />
        <button
          type="submit"
          className="rounded-md bg-green-500 px-4 py-2 font-semibold hover:bg-green-600"
          disabled={createTask.isPending}
        >
          { isCreating ? "Adding..." : "Add"}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-2">
        {data?.map((task) => (
          <div
            key={task.id}
            className="flex items-center gap-2 rounded-md bg-neutral-900 p-4"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() =>
                toggleTask.mutate({
                  id: task.id,
                  completed: !task.completed,
                })
              }
              className="h-5 w-5 rounded"
            />
            <div className="flex w-full flex-col px-3">
              <span
                className={`flex-1 ${task.completed ? "text-neutral-500" : ""}`}
              >
                {task.title}
              </span>
              <span
                className={`flex-1 ${
                  task.completed ? "text-neutral-500" : ""
                } text-xs`}
              >
                {formatDistanceToNow(new Date(task.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <button
              onClick={() => deleteTask.mutate({ id: task.id })}
              className="text-red-500 hover:text-red-400"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
