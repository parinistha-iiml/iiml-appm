'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Task } from '@/types/database.types';

const STORAGE_KEY = 'zendo-tasks';
const LAST_OPENED_KEY = 'zendo-last-opened';

export function parseTaskText(
  raw: string
): { text: string; is_starred: boolean } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('!')) {
    const text = trimmed.slice(1).trim();
    if (!text || text.length > 120) return null;
    return { text, is_starred: true };
  }

  if (trimmed.length > 120) return null;
  return { text: trimmed, is_starred: false };
}

function createTask(text: string, is_starred: boolean): Task {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    user_id: null,
    text,
    is_completed: false,
    is_starred,
    created_at: now,
    updated_at: now,
  };
}

function reorderList<T>(list: T[], startIndex: number, endIndex: number): T[] {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [leftovers, setLeftovers] = useState<Task[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    try {
      // 1. Hydrate tasks
      const storedTasks = localStorage.getItem(STORAGE_KEY);
      let activeTasks = storedTasks ? (JSON.parse(storedTasks) as Task[]) : [];

      // 2. Fetch tracking timestamp
      const now = new Date();
      const lastOpenedStr = localStorage.getItem(LAST_OPENED_KEY);

      if (lastOpenedStr) {
        const lastOpened = new Date(lastOpenedStr);
        
        // 🆕 NEW: Define a 1-hour millisecond threshold (1 hr * 60 min * 60 sec * 1000 ms)
        const ONE_HOUR_IN_MS = 1 * 60 * 60 * 1000;
        
        // 🆕 NEW: Check if the idle time window exceeds 1 hour
        if (now.getTime() - lastOpened.getTime() > ONE_HOUR_IN_MS) {
          
          // 🆕 Isolate uncompleted items to leftovers and clear active grid
          const pendingLeftovers = activeTasks.filter(t => !t.is_completed);
          
          setLeftovers(pendingLeftovers);
          activeTasks = []; // Wipe primary canvas empty
        }
      }

      setTasks(activeTasks);
      localStorage.setItem(LAST_OPENED_KEY, now.toISOString());
      } catch (e) {
      console.error("Failed to hydrate safely", e);
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isHydrated]);

  const visibleTasks = tasks.filter((task) => {
    const taskDate = new Date(task.created_at);
    return (
      taskDate.getDate() === selectedDate.getDate() &&
      taskDate.getMonth() === selectedDate.getMonth() &&
      taskDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  const addTask = useCallback((text: string) => {
    const parsed = parseTaskText(text);
    if (!parsed) return;

    const targetTime = selectedDate.toDateString() === new Date().toDateString() 
      ? new Date().toISOString() 
      : selectedDate.toISOString();

    const newTask: Task = {
      id: crypto.randomUUID(),
      user_id: null,
      text: parsed.text,
      is_completed: false,
      is_starred: parsed.is_starred,
      created_at: targetTime,
      updated_at: targetTime,
    };

    setTasks((prev) => [newTask, ...prev]);
  }, [selectedDate]);

  const handleReviewLeftover = useCallback((id: string, action: 'keep' | 'drop') => {
    setLeftovers((prev) => {
      const target = prev.find(t => t.id === id);
      
      if (target && action === 'keep') {
        // 🆕 Revive item with a rolling current date stamp
        const revivedTask: Task = {
          ...target,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setTasks((currentTasks) => [revivedTask, ...currentTasks]);
      }
      
      // 🆕 Slide item out of queue
      return prev.filter(t => t.id !== id);
    });
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? {
              ...task,
              is_completed: !task.is_completed,
              updated_at: new Date().toISOString(),
            }
          : task
      )
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }, []);

  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setTasks((prev) => {
      if (
        startIndex < 0 ||
        endIndex < 0 ||
        startIndex >= prev.length ||
        endIndex >= prev.length ||
        startIndex === endIndex
      ) {
        return prev;
      }

      return reorderList(prev, startIndex, endIndex).map((task) => ({
        ...task,
        updated_at: new Date().toISOString(),
      }));
    });
  }, []);

  return {
    tasks: visibleTasks,
    allTasks: tasks,
    leftovers,
    handleReviewLeftover,
    selectedDate, 
    setSelectedDate,
    addTask,
    toggleComplete,
    deleteTask,
    reorderTasks,
    isHydrated,
  };
}
