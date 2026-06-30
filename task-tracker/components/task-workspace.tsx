'use client';

import { TaskInput } from '@/components/task-input';
import { TaskList } from '@/components/task-list';
import { useTasks } from '@/hooks/useTasks';
import { useState, useRef, useEffect } from 'react';

export function TaskWorkspace() {
  const { 
    tasks, 
    leftovers, 
    handleReviewLeftover,
    selectedDate, 
    setSelectedDate, 
    addTask, 
    toggleComplete, 
    deleteTask, 
    reorderTasks, 
    isHydrated 
  } = useTasks();

  const [isCreating, setIsCreating] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // 🆕 NEW: Generate a rolling list of the last 7 calendar days
  const calendarDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d;
  }).reverse(); // Order chronologically from left to right

  useEffect(() => {
    if (leftovers.length === 0) return; // Lock listener if queue is empty
  
    const currentLeftover = leftovers[0];
  
    const handleReviewShortcuts = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault();
        handleReviewLeftover(currentLeftover.id, 'keep'); // 🆕 Move to today
      } else if (e.key === 'ArrowLeft' || e.key === 'Escape') {
        e.preventDefault();
        handleReviewLeftover(currentLeftover.id, 'drop'); // 🆕 Delete forever
      }
    };
  
    window.addEventListener('keydown', handleReviewShortcuts);
    return () => window.removeEventListener('keydown', handleReviewShortcuts);
  }, [leftovers, handleReviewLeftover]);

  if (!isHydrated) {
    return (
      <div className="flex min-h-[12rem] items-center justify-center">
        <p className="text-sm text-neutral-600">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-12">
      <header className="space-y-2">
        <h1 className="text-sm font-medium tracking-[0.2em] text-neutral-400 uppercase">
          ZenDo
        </h1>
        <div className="flex justify-between items-center border-b border-neutral-900 pb-4 mb-2">
          <div className="flex gap-2 w-full justify-between">
            {calendarDays.map((date, idx) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              const isToday = date.toDateString() === new Date().toDateString();
              
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-150 min-w-[56px] ${
                    isSelected 
                      ? 'bg-neutral-900 text-neutral-100 border border-neutral-800' 
                      : 'hover:bg-neutral-900/40 text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  <span className="text-[10px] font-mono uppercase tracking-wider">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className={`text-base font-light ${isSelected ? 'font-medium' : ''}`}>
                    {date.getDate()}
                  </span>
                  {isToday && !isSelected && (
                    <span className="w-1 h-1 bg-neutral-600 rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>
<section>
      <p>
        {leftovers.length > 0 && (
      <div className="absolute inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex flex-col items-center justify-center px-4 animate-fade-in">
        <div className="w-full max-w-md text-center flex flex-col items-center">
          
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-500 font-medium mb-2">Morning Review</span>
          <h1 className="text-xl font-light text-neutral-200 mb-12">Yesterday's Leftovers</h1>

          {/* Focused Review Container */}
          <div className="w-full bg-neutral-900/40 border border-neutral-900 rounded-lg p-8 mb-12 shadow-xl">
            <p className="text-lg text-neutral-200 font-light break-words leading-relaxed">
             {leftovers[0].is_starred && <span className="text-amber-500 mr-2">★</span>}
              {leftovers[0].text}
            </p>
          </div>

          {/* Action Maps */}
          <div className="flex items-center gap-16 text-xs font-mono tracking-widest text-neutral-500">
            <button onClick={() => handleReviewLeftover(leftovers[0].id, 'drop')} className="group flex flex-col items-center gap-2 hover:text-neutral-300 transition-colors">
              <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
              <span>DROP <span className="text-neutral-700">(Esc)</span></span>
            </button>

            <button onClick={() => handleReviewLeftover(leftovers[0].id, 'keep')} className="group flex flex-col items-center gap-2 hover:text-amber-500 transition-colors">
              <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
              <span className="group-hover:text-amber-500">KEEP <span className="text-neutral-700">(Enter)</span></span>
            </button>
          </div>

          <div className="mt-16 text-[10px] text-neutral-600 font-mono">
            {leftovers.length} {leftovers.length === 1 ? 'item' : 'items'} remaining
          </div>        
        </div>
      </div>
    )} </p>
  </section>

     {/* <section aria-label="New task">
        <TaskInput onAdd={addTask} />
      </section>*/}

      <section aria-label="Tasks">
      <p className="text-sm text-neutral-600">
          Press Enter to add. Prefix with ! to star.
        </p>
        <br/>
      <div className={`w-full max-w-xl flex flex-col gap-1 transition-all duration-300 ${leftovers.length > 0 ? 'blur-sm pointer-events-none' : ''}`}>
        <TaskList
          tasks={tasks}
          onToggleComplete={toggleComplete}
          onDelete={deleteTask}
          onReorder={reorderTasks}
        />
        {isCreating ? (
          <div className="h-14 flex items-center px-4 border-b border-neutral-800 bg-neutral-900/20 transition-all mt-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onBlur={() => { if (!inputValue.trim()) setIsCreating(false); }}
              placeholder={inputValue.trim().startsWith('!') ? "★ Creating starred priority..." : "What needs to be done today?"}
              className="w-full bg-transparent text-base text-neutral-200 placeholder-neutral-700 focus:outline-none"
            />
          </div>
        ) : (
          <div 
            onClick={() => setIsCreating(true)}
            className="h-14 flex items-center px-4 text-sm text-neutral-600 hover:text-neutral-400 cursor-text transition-colors duration-150 group border border-dashed border-transparent hover:border-neutral-900 rounded mt-2"
          >
            <span>+ Click canvas space or press <kbd className="text-xs bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800 font-mono ml-1">N</kbd> to build task</span>
          </div>
        )}
        </div>
      </section>
    </div>
  );
}
