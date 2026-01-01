"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBell = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    const ctx = audioContextRef.current;

    // Create a bell-like sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(830, ctx.currentTime); // Bell frequency
    oscillator.type = "sine";

    // Bell envelope - quick attack, longer decay
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.5);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 14) {
            playBell();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, playBell]);

  const handlePlay = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 font-mono">
      <main className="flex flex-col items-center gap-12">
        {/* Timer display */}
        <div className="relative">
          <div className="text-[12rem] font-bold leading-none tracking-tighter text-amber-500 tabular-nums">
            {seconds.toString().padStart(2, "0")}
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-stone-500 text-sm uppercase tracking-widest">
            seconds
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 h-1 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${(seconds / 15) * 100}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          <button
            onClick={handlePlay}
            disabled={isRunning}
            className="w-24 h-12 rounded bg-amber-500 text-stone-950 font-semibold uppercase tracking-wider text-sm transition-all hover:bg-amber-400 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Play
          </button>
          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="w-24 h-12 rounded border border-stone-600 text-stone-400 font-semibold uppercase tracking-wider text-sm transition-all hover:border-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Pause
          </button>
          <button
            onClick={handleReset}
            className="w-24 h-12 rounded border border-stone-600 text-stone-400 font-semibold uppercase tracking-wider text-sm transition-all hover:border-stone-400 hover:text-stone-200"
          >
            Reset
          </button>
        </div>
      </main>
    </div>
  );
}
