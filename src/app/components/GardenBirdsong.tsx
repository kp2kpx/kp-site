"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type GardenBirdsongContextValue = {
  muted: boolean;
  toggleMute: () => void;
};

const GardenBirdsongContext = createContext<GardenBirdsongContextValue | null>(
  null,
);

function chirp(ctx: AudioContext, start: number, base: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(base, start);
  osc.frequency.exponentialRampToValueAtTime(base * 1.6, start + 0.06);
  osc.frequency.exponentialRampToValueAtTime(base * 0.9, start + 0.14);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.035, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + 0.22);
}

function VolumeOnIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M11 5 6 9H3v6h3l5 4V5zm2.5 3.5a4.5 4.5 0 0 1 0 7 1 1 0 1 0 1.4 1.4 6.5 6.5 0 0 0 0-9.8 1 1 0 0 0-1.4 1.4zm3-3a8 8 0 0 1 0 11.3 1 1 0 1 0 1.4 1.4 10 10 0 0 0 0-14.1 1 1 0 0 0-1.4 1.4z" />
    </svg>
  );
}

function VolumeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden fill="currentColor" className={className}>
      <path d="M11 5 6 9H3v6h3l5 4V5zm7.7 3.3a1 1 0 0 0-1.4 1.4L18.6 12l-2.3 2.3a1 1 0 1 0 1.4 1.4L20 13.4l2.3 2.3a1 1 0 1 0 1.4-1.4L21.4 12l2.3-2.3a1 1 0 0 0-1.4-1.4L20 10.6l-2.3-2.3z" />
    </svg>
  );
}

export function GardenBirdsongProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [muted, setMuted] = useState(false);
  const audioCtx = useRef<AudioContext | null>(null);

  const ensureAudio = useCallback(async () => {
    if (!audioCtx.current) {
      try {
        audioCtx.current = new AudioContext();
      } catch {
        return;
      }
    }
    if (audioCtx.current.state === "suspended") {
      try {
        await audioCtx.current.resume();
      } catch {
        /* browser policy */
      }
    }
  }, []);

  const playChirp = useCallback(() => {
    const ctx = audioCtx.current;
    if (!ctx || muted) return;
    const t = ctx.currentTime;
    const base = 2200 + Math.random() * 900;
    chirp(ctx, t, base);
    if (Math.random() > 0.35) chirp(ctx, t + 0.18, base * 1.15);
  }, [muted]);

  useEffect(() => {
    void ensureAudio();
  }, [ensureAudio]);

  useEffect(() => {
    const unlock = () => {
      void ensureAudio();
    };
    window.addEventListener("pointerdown", unlock, { passive: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, [ensureAudio]);

  useEffect(() => {
    if (muted || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const wait = 5000 + Math.random() * 8000;
      timer = setTimeout(() => {
        void ensureAudio();
        playChirp();
        schedule();
      }, wait);
    };

    schedule();
    return () => clearTimeout(timer);
  }, [muted, playChirp, ensureAudio]);

  const toggleMute = useCallback(() => {
    void ensureAudio();
    setMuted((on) => !on);
  }, [ensureAudio]);

  return (
    <GardenBirdsongContext.Provider value={{ muted, toggleMute }}>
      {children}
    </GardenBirdsongContext.Provider>
  );
}

export function GardenBirdsongMuteButton() {
  const ctx = useContext(GardenBirdsongContext);
  if (!ctx) return null;

  const { muted, toggleMute } = ctx;

  return (
    <button
      type="button"
      onClick={toggleMute}
      aria-label={muted ? "Unmute birdsong" : "Mute birdsong"}
      title={muted ? "Unmute birdsong" : "Mute birdsong"}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
        muted
          ? "border-[#d45c5c] bg-[#fce8e8] text-[#b83232] hover:border-[#c44a4a] hover:bg-[#f9d6d6]"
          : "border-[#5a8f52] bg-[#e6f2e4] text-[#3d7336] hover:border-[#4a7f44] hover:bg-[#d8ead5]"
      }`}
    >
      {muted ? (
        <VolumeOffIcon className="h-[15px] w-[15px]" />
      ) : (
        <VolumeOnIcon className="h-[15px] w-[15px]" />
      )}
    </button>
  );
}