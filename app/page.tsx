"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export default function Home() {
  const [duration, setDuration] = useState(15);
  const [seconds, setSeconds] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("15");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioDurationRef = useRef<number>(0);
  const audioUnlockedRef = useRef<boolean>(false);

  useEffect(() => {
    // Load the audio file once on mount
    const audio = new Audio("/alrightchat.m4a");
    audio.preload = "auto";
    audio.addEventListener("loadedmetadata", () => {
      audioDurationRef.current = audio.duration;
    });
    audioRef.current = audio;
  }, []);

  const unlockAudio = useCallback(() => {
    const audio = audioRef.current;
    if (audio && !audioUnlockedRef.current) {
      // Play and immediately pause to unlock audio on mobile
      audio.volume = 0;
      audio.play().then(() => {
        audio.pause();
        audio.volume = 1;
        audio.currentTime = 0;
        audioUnlockedRef.current = true;
      }).catch(() => {
        // Ignore errors during unlock attempt
      });
    }
  }, []);

  const playBell = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audioDurationRef.current > 0) {
      // Play only the last 2 seconds
      const startTime = Math.max(0, audioDurationRef.current - 2);
      audio.currentTime = startTime;
      audio.play().catch((e) => console.error("Audio play failed:", e));
    }
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            playBell();
            return duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, playBell, duration]);

  const handlePlay = () => {
    unlockAudio();
    setIsRunning(true);
  };

  const handlePause = () => setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(duration);
  };

  const handleNumberClick = () => {
    if (!isRunning) {
      setIsEditing(true);
      setInputValue(seconds.toString());
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 3) {
      setInputValue(val);
    }
  };

  const handleInputSubmit = () => {
    const newDuration = Math.max(1, Math.min(999, parseInt(inputValue) || 15));
    setDuration(newDuration);
    setSeconds(newDuration);
    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleInputSubmit();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-950 font-mono">
      <main className="flex flex-col items-center gap-12">
        {/* Timer display */}
        <div className="relative h-[12rem]">
          {isEditing ? (
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputSubmit}
              onKeyDown={handleInputKeyDown}
              className="text-[12rem] font-bold leading-none tracking-tighter text-amber-500 tabular-nums bg-transparent text-center outline-none border-none h-[12rem]"
              style={{ width: `${Math.max(2, inputValue.length)}ch` }}
              autoFocus
            />
          ) : (
            <div
              onClick={handleNumberClick}
              className={`text-[12rem] font-bold leading-none tracking-tighter text-amber-500 tabular-nums ${!isRunning ? "cursor-pointer hover:text-amber-400 transition-colors" : ""}`}
            >
              {seconds.toString().padStart(2, "0")}
            </div>
          )}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-stone-500 text-sm uppercase tracking-widest">
            seconds
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-80 h-1 bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
            style={{ width: `${((duration - seconds) / duration) * 100}%` }}
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
