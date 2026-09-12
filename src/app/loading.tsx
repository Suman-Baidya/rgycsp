export default function GlobalLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full p-8 font-sans">
      <div className="relative flex items-center justify-center w-16 h-16">
        {/* Outer Background Track */}
        <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-zinc-800/50" />
        {/* Outer Rotating Gradient Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/50 animate-spin" />
        {/* Center Pulsing Core */}
        <div className="w-3.5 h-3.5 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
      </div>

      <div className="mt-4 flex flex-col items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
