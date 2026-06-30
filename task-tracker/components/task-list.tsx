'use client';

import type { Task } from '@/types/database.types';
import { TaskItem } from '@/components/task-item';

interface TaskListProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function TaskList({
  tasks,
  onToggleComplete,
  onDelete,
  onReorder,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="py-16 text-center text-sm text-neutral-600">
        Nothing here yet. Add a task above.
      </p>
    );
  }

  return (
    <ul className="w-full">
      {tasks.map((task, index) => (
        <TaskItem
          key={task.id}
          task={task}
          index={index}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onReorder={onReorder}
        />
      ))}
    </ul>
  );
}
