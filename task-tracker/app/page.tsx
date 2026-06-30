import { TaskWorkspace } from '@/components/task-workspace';

export default function Home() {
  return (
    <div className="min-h-full bg-neutral-950 text-neutral-200">
      <main className="mx-auto flex min-h-full w-full max-w-xl flex-col px-6 py-24 sm:px-8 sm:py-32">
        <TaskWorkspace />
      </main>
    </div>
  );
}
