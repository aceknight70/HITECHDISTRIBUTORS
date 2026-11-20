import React, { useEffect, useState } from "react";
import { Lock } from "lucide-react";

interface LockoutCountdownBannerProps {
  lockedUntil: string | null;
  message?: string;
  onExpired?: () => void;
}

export function useLockoutRemainingSeconds(lockedUntil: string | null, onExpired?: () => void): number {
  const [remaining, setRemaining] = useState<number>(() => {
    if (!lockedUntil) return 0;
    const ms = new Date(lockedUntil).getTime() - Date.now();
    return Number.isFinite(ms) && ms > 0 ? Math.ceil(ms / 1000) : 0;
  });

  useEffect(() => {
    if (!lockedUntil) {
      setRemaining(0);
      return;
    }

    const compute = () => {
      const targetMs = new Date(lockedUntil).getTime();
      if (!Number.isFinite(targetMs)) {
        setRemaining(0);
        return false;
      }
      const secs = Math.max(0, Math.ceil((targetMs - Date.now()) / 1000));
      setRemaining(secs);
      if (secs <= 0) {
        if (onExpired) onExpired();
        return false;
      }
      return true;
    };

    const active = compute();
    if (!active) return;

    const timer = setInterval(() => {
      const stillActive = compute();
      if (!stillActive) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedUntil, onExpired]);

  return remaining;
}

export function formatLockoutDuration(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  if (mins >= 60) {
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hrs}h ${remMins}m ${secs}s`;
  }
  return `${mins}m ${secs}s`;
}

export default function LockoutCountdownBanner({
  lockedUntil,
  message,
  onExpired,
}: LockoutCountdownBannerProps) {
  const remaining = useLockoutRemainingSeconds(lockedUntil, onExpired);

  if (!lockedUntil && !message) return null;

  return (
    <div className="p-3 bg-red-950/90 border border-red-700/80 text-red-200 rounded-xl text-xs font-mono flex items-start gap-2.5">
      <Lock className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <div className="flex flex-col gap-0.5">
        <p className="font-bold text-red-300 uppercase tracking-wider text-[11px]">
          Locked {remaining > 0 ? `(${formatLockoutDuration(remaining)})` : ""}
        </p>
        {message && <p className="text-[11px] text-red-100 leading-snug">{message}</p>}
      </div>
    </div>
  );
}
