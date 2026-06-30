'use client';

import type { DragEvent } from 'react';
import type { Task } from '@/types/database.types';

interface TaskItemProps {
  task: Task;
  index: number;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function TaskItem({
  task,
  index,
  onToggleComplete,
  onDelete,
  onReorder,
}: TaskItemProps) {
  function handleDragStart(event: DragEvent<HTMLLIElement>) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(event: DragEvent<HTMLLIElement>) {
    event.preventDefault();
    const fromIndex = Number(event.dataTransfer.getData('text/plain'));
    if (Number.isNaN(fromIndex)) return;
    onReorder(fromIndex, index);
  }

  return (
    <li
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="group flex items-start gap-4 border-b border-neutral-900/80 py-4 transition-colors hover:border-neutral-800"
    >
      <button
        type="button"
        onClick={() => onToggleComplete(task.id)}
        aria-label={task.is_completed ? 'Mark incomplete' : 'Mark complete'}
        className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-neutral-700 opacity-0 transition-opacity group-hover:opacity-100 hover:border-neutral-500 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600"
      >
        {task.is_completed ? (
          <span className="h-2 w-2 rounded-full bg-neutral-400" />
        ) : null}
      </button>

      <p
        className={`min-w-0 flex-1 text-base leading-relaxed ${
          task.is_completed
            ? 'text-neutral-500 line-through'
            : task.is_starred
              ? 'font-medium text-neutral-200'
              : 'text-neutral-200'
        }`}
      >
        {task.is_starred && (
    <span className="text-amber-500 text-sm shrink-0 select-none">★</span>
  )}
  
  <span className="truncate"> {task.text}</span>
      </p>

      <div className="flex shrink-0 items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <span
          aria-hidden
          className="cursor-grab px-1 text-xs tracking-widest text-neutral-600 active:cursor-grabbing"
          title="Drag to reorder"
        >
          ···
        </span>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          aria-label="Delete task"
          className="px-1 text-sm text-neutral-600 transition-colors hover:text-neutral-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-600"
        >
          ×
        </button>
      </div>
    </li>
  );
}
