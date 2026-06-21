'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, Loader2, Music2, Pause, Play, Radio, Shuffle, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  checkRadioBuffer,
  getRadioStreamUrl,
  preloadRadioTracks,
  streamRadioTrack,
  type RadioTrack,
} from '@/lib/api';
import { cn } from '@/lib/utils';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/authSlice';

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type PlayerView = 'closed' | 'mini' | 'full';

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playedTrackIdsRef = useRef<string[]>([]);
  const sessionIdRef = useRef<string | null>(null);
  const hasFetchedRef = useRef(false);
  const hasEverPlayed = useRef(false);
  const [view, setView] = useState<PlayerView>('closed');
  const [mounted, setMounted] = useState(false);
  const hasToken = useAppSelector(selectIsAuthenticated);
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [blocked, setBlocked] = useState<string | null>(null); // blocked_until ISO string

  const currentTrack = tracks[currentIndex] ?? null;

  useEffect(() => setMounted(true), []);

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      hasEverPlayed.current = true;
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = async () => {
      if (currentTrack) {
        playedTrackIdsRef.current = [
          ...playedTrackIdsRef.current,
          currentTrack.id,
        ].slice(-20);
      }

      if (currentIndex >= tracks.length - 2 && currentTrack) {
        try {
          const res = await checkRadioBuffer({
            session_id: sessionIdRef.current ?? undefined,
          });
          if (res.action === 'stop') {
            // Purchase gate triggered — halt playback and show message
            audioRef.current?.pause();
            setIsPlaying(false);
            toast.error(res.message ?? 'Keep shopping to keep the music going!');
            return;
          }
          const nextBatch = res.manifest?.tracks ?? [];
          if (res.manifest?.session_id) sessionIdRef.current = res.manifest.session_id;
          if (nextBatch.length > 0) {
            setTracks((prev) => {
              const knownIds = new Set(prev.map((t) => t.id));
              const fresh = nextBatch.filter((t: { id: string }) => !knownIds.has(t.id));
              return fresh.length > 0 ? [...prev, ...fresh as unknown as RadioTrack[]] : prev;
            });
          }
        } catch {
          toast.error('Unable to refresh the radio queue.');
        }
      }

      setCurrentIndex((prev) => (prev < tracks.length - 1 ? prev + 1 : 0));
    };

    audio.addEventListener('timeupdate', syncTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', syncTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentIndex, currentTrack, tracks.length]);

  useEffect(() => () => releaseObjectUrl(), [releaseObjectUrl]);

  const fetchInitialQueue = useCallback(async () => {
    if (!hasToken || hasFetchedRef.current) return;
    setIsLoadingQueue(true);
    try {
      const manifest = await preloadRadioTracks();
      sessionIdRef.current = manifest.session_id;
      setTracks(manifest.tracks as unknown as RadioTrack[]);
      setCurrentIndex(0);
      setBlocked(null);
      hasFetchedRef.current = true;
    } catch (err: unknown) {
      // 403 = user is blocked (no purchase in last 24h)
      if (
        err &&
        typeof err === 'object' &&
        'status' in err &&
        (err as { status: number }).status === 403
      ) {
        const body = (err as { body?: { blocked_until?: string } }).body;
        const until = body?.blocked_until ?? null;
        setBlocked(until);
        toast.error(
          until
            ? `Radio locked until ${new Date(until).toLocaleTimeString()}. Make a purchase to unlock.`
            : 'Radio locked — make a purchase to unlock.',
        );
      } else if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsLoadingQueue(false);
    }
  }, [hasToken]);

  useEffect(() => {
    if (view !== 'closed') void fetchInitialQueue();
  }, [fetchInitialQueue, view]);

  const loadTrack = useCallback(
    async (track: RadioTrack) => {
      const audio = audioRef.current;
      if (!audio) return;
      setIsLoadingTrack(true);
      try {
        releaseObjectUrl();
        const blob = await streamRadioTrack(track.id);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        audio.src = url;
        await audio.play();
      } catch {
        const directUrl = track.stream_url ?? getRadioStreamUrl(track.id);
        audio.src = directUrl;
        try {
          await audio.play();
        } catch {
          toast.error('Unable to stream this track.');
        }
      } finally {
        setIsLoadingTrack(false);
      }
    },
    [releaseObjectUrl]
  );

  const handleTogglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack && tracks.length > 0) {
      setCurrentIndex(0);
      await loadTrack(tracks[0]);
      return;
    }

    if (audio.src) {
      if (audio.paused) await audio.play();
      else audio.pause();
      return;
    }

    if (currentTrack) await loadTrack(currentTrack);
  }, [currentTrack, loadTrack, tracks]);

  useEffect(() => {
    if (currentTrack && audioRef.current && !audioRef.current.src) {
      void loadTrack(currentTrack);
    }
  }, [currentIndex]);

  const panelLabel = useMemo(() => {
    if (!currentTrack) return 'SpringUpAI Radio';
    return currentTrack.artist
      ? `${currentTrack.title} — ${currentTrack.artist}`
      : currentTrack.title;
  }, [currentTrack]);

  const fullPanel =
    mounted && view === 'full'
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[998] bg-black/40 backdrop-blur-sm"
              onClick={() => setView('mini')}
            />
            <div className="fixed z-[999] inset-x-3 bottom-24 sm:inset-x-auto sm:bottom-24 sm:right-4 sm:w-[22rem]">
              <div className="rounded-3xl border border-border bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-300">
                <div className="absolute top-4 right-4 flex items-center gap-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => setView('mini')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Minimize"
                  >
                    <Music2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('closed')}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="pt-12 pb-5 flex flex-col items-center px-6">
                  <div
                    className={cn(
                      'w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary/60 to-purple-600/60 flex items-center justify-center shadow-lg border-4 border-white/10',
                      isPlaying && 'animate-[spin_8s_linear_infinite]'
                    )}
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#1a1a2e] flex items-center justify-center">
                      <Music2 size={24} className="text-white/80" />
                    </div>
                  </div>

                  <div className="mt-5 text-center w-full">
                    <h3 className="text-base sm:text-lg font-bold truncate px-2">
                      {currentTrack?.title ?? 'SpringUpAI Radio'}
                    </h3>
                    <p className="text-sm text-white/60 mt-1 truncate px-2">
                      {currentTrack?.artist ?? 'Tap play to start streaming'}
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-xs text-green-400 font-medium">
                    <Shuffle size={12} />
                    <span>Shuffle</span>
                  </div>
                </div>

                <div className="px-6 pb-2">
                  <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-white/40 font-medium">
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 pb-7 pt-2">
                  {!hasToken ? (
                    <div className="text-center px-6 pb-4">
                      <p className="text-sm text-white/60 mb-3">Sign in to start listening</p>
                      <a
                        href="/vendor/login"
                        className="inline-block px-5 py-2.5 rounded-full bg-primary text-sm font-semibold hover:scale-105 transition-transform"
                      >
                        Sign In
                      </a>
                    </div>
                  ) : blocked ? (
                    <div className="text-center px-6 pb-4 space-y-2">
                      <p className="text-sm text-amber-400 font-semibold">Radio locked 🔒</p>
                      <p className="text-xs text-white/50">
                        Make a purchase to unlock 24h of streaming.
                        {blocked && (
                          <> Unlocks at {new Date(blocked).toLocaleTimeString()}.</>
                        )}
                      </p>
                    </div>
                  ) : (
                    <>
                      <Volume2 size={18} className="text-white/40" />
                      <button
                        type="button"
                        onClick={() => void handleTogglePlayback()}
                        disabled={isLoadingQueue || isLoadingTrack || !hasToken}
                        className={cn(
                          'w-14 h-14 rounded-full flex items-center justify-center transition-all',
                          'bg-white text-[#1a1a2e] hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100',
                          isLoadingTrack && 'animate-pulse'
                        )}
                      >
                        {isLoadingTrack || isLoadingQueue ? (
                          <Loader2 size={24} className="animate-spin" />
                        ) : isPlaying ? (
                          <Pause size={24} fill="currentColor" />
                        ) : (
                          <Play size={24} fill="currentColor" className="ml-0.5" />
                        )}
                      </button>
                      <Radio size={18} className="text-white/40" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      {/* Audio element always in DOM */}
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {fullPanel}

      {/* Mini bubble with progress ring */}
      {view === 'mini' && (
        <div className="relative group animate-[bubble-float_3s_ease-in-out_0.5s_infinite]">
          <svg className="absolute inset-0 w-14 h-14 -rotate-90 pointer-events-none" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${2 * Math.PI * 24}`}
              strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
              className="text-primary transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>

          <button
            type="button"
            onClick={() => void handleTogglePlayback()}
            className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-primary/30 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            aria-label={panelLabel}
          >
            {isLoadingTrack || isLoadingQueue ? (
              <Loader2 size={20} className="animate-spin text-white" />
            ) : isPlaying ? (
              <Pause size={18} className="text-white" fill="white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" fill="white" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setView('full')}
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
          >
            <ChevronUp size={12} />
          </button>

          <button
            type="button"
            onClick={() => setView('closed')}
            className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 active:opacity-100 transition-opacity"
          >
            <X size={10} />
          </button>
        </div>
      )}

      {/* Closed state bubble */}
      {view === 'closed' && (
        <button
          onClick={() => setView(hasEverPlayed.current ? 'mini' : 'full')}
          className={cn(
            'w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1a2e] to-[#16213e] border-2 border-primary/30 shadow-[0_0_20px_rgba(var(--color-primary),0.3)] flex items-center justify-center transition-transform hover:scale-110 active:scale-95',
            'animate-[bubble-float_3s_ease-in-out_0.5s_infinite]',
            isPlaying && 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background border-primary/60'
          )}
          aria-label={panelLabel}
        >
          <Music2 size={22} className="text-white" />
        </button>
      )}
    </>
  );
}
