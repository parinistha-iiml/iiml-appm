'use client';

import { useState, type FormEvent, type KeyboardEvent } from 'react';

interface TaskInputProps {
  onAdd: (text: string) => void;
}

export function TaskInput({ onAdd }: TaskInputProps) {
  const [value, setValue] = useState('');

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;

    onAdd(trimmed);
    setValue('');
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submit();
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submit();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="What needs doing?"
        maxLength={121}
        aria-label="Add a task"
        className="w-full border-none bg-transparent text-lg text-neutral-200 placeholder:text-neutral-600 outline-none"
      />
    </form>
  );
}
