'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Loader2,
  Music2,
  Pause,
  Play,
  Radio,
  SkipForward,
  Upload,
  Volume2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  checkRadioBuffer,
  getRadioStreamUrl,
  preloadRadioTracks,
  streamRadioTrack,
  type RadioTrack,
} from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

function formatDuration(track: RadioTrack) {
  const rawSeconds = Math.round(track.duration_seconds ?? track.duration ?? 0);
  if (!rawSeconds) return 'Live';

  const minutes = Math.floor(rawSeconds / 60);
  const seconds = rawSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const playedTrackIdsRef = useRef<string[]>([]);
  const hasFetchedRef = useRef(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isLoadingTrack, setIsLoadingTrack] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const currentTrack = tracks[currentIndex] ?? null;

  const releaseObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    setHasToken(Boolean(localStorage.getItem('token')));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const syncTime = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      } else {
        setProgress(0);
      }
    };

    const onPlay = () => setIsPlaying(true);
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
          const nextBatch = await checkRadioBuffer({
            current_track_id: currentTrack.id,
            played_track_ids: playedTrackIdsRef.current,
            buffer_size: 8,
          });

          if (nextBatch.length > 0) {
            setTracks((prev) => {
              const knownIds = new Set(prev.map((track) => track.id));
              const freshTracks = nextBatch.filter((track) => !knownIds.has(track.id));
              return freshTracks.length > 0 ? [...prev, ...freshTracks] : prev;
            });
          }
        } catch {
          toast.error('Unable to refresh the radio queue right now.');
        }
      }

      setCurrentIndex((prev) => {
        if (prev < tracks.length - 1) {
          return prev + 1;
        }
        return prev;
      });
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

  useEffect(() => {
    return () => {
      releaseObjectUrl();
    };
  }, [releaseObjectUrl]);

  const fetchInitialQueue = useCallback(async () => {
    if (!hasToken || hasFetchedRef.current) return;

    setIsLoadingQueue(true);
    setError('');

    try {
      const initialTracks = await preloadRadioTracks();
      setTracks(initialTracks);
      setCurrentIndex(0);
      hasFetchedRef.current = true;
    } catch (err) {
      setError('Unable to preload radio tracks.');
      if (err instanceof Error) {
        toast.error(err.message);
      }
    } finally {
      setIsLoadingQueue(false);
    }
  }, [hasToken]);

  useEffect(() => {
    if (isOpen) {
      void fetchInitialQueue();
    }
  }, [fetchInitialQueue, isOpen]);

  const loadTrack = useCallback(
    async (track: RadioTrack) => {
      const audio = audioRef.current;
      if (!audio) return;

      setIsLoadingTrack(true);
      setError('');

      try {
        releaseObjectUrl();
        const blob = await streamRadioTrack(track.id);
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;
        audio.src = objectUrl;
        await audio.play();
      } catch (err) {
        const directUrl = track.stream_url ?? getRadioStreamUrl(track.id);
        audio.src = directUrl;
        try {
          await audio.play();
        } catch {
          setError('Unable to stream this track right now.');
          if (err instanceof Error) {
            toast.error(err.message);
          }
        }
      } finally {
        setIsLoadingTrack(false);
      }
    },
    [releaseObjectUrl]
  );

  const handleSelectTrack = useCallback(
    async (index: number) => {
      setCurrentIndex(index);
      const track = tracks[index];
      if (!track) return;
      await loadTrack(track);
    },
    [loadTrack, tracks]
  );

  const handleTogglePlayback = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!currentTrack && tracks.length > 0) {
      await handleSelectTrack(currentIndex);
      return;
    }

    if (audio.src) {
      if (audio.paused) {
        await audio.play();
      } else {
        audio.pause();
      }
      return;
    }

    if (currentTrack) {
      await loadTrack(currentTrack);
    }
  }, [currentIndex, currentTrack, handleSelectTrack, loadTrack, tracks.length]);

  const handleNextTrack = useCallback(async () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex >= tracks.length) {
      toast('No more buffered tracks yet.', {
        description: 'The radio queue will refill automatically as playback continues.',
      });
      return;
    }

    await handleSelectTrack(nextIndex);
  }, [currentIndex, handleSelectTrack, tracks.length]);

  const panelLabel = useMemo(() => {
    if (!currentTrack) return 'SpringUpAI Radio';
    return currentTrack.artist
      ? `${currentTrack.title} • ${currentTrack.artist}`
      : currentTrack.title;
  }, [currentTrack]);

  return (
    <>
      <audio ref={audioRef} preload="metadata" />

      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
      )}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <Card className="w-[min(28rem,calc(100vw-2rem))] rounded-3xl border-border shadow-float overflow-hidden">
            <CardHeader className="gradient-primary text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="secondary" className="bg-white/15 text-white border-white/10 mb-3">
                    <Radio className="size-3" /> Live radio
                  </Badge>
                  <CardTitle className="text-xl">SpringUpAI Radio</CardTitle>
                  <CardDescription className="text-white/75 mt-1">
                    {hasToken
                      ? 'Users and vendors can stream the latest uploaded tracks in the browser.'
                      : 'Sign in as a user, vendor, or admin to access the radio stream.'}
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="bg-white/15 text-white hover:bg-white/20"
                  onClick={() => setIsOpen(false)}
                >
                  <X />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="px-0 pb-0">
              {!hasToken ? (
                <div className="p-6 space-y-4">
                  <Alert>
                    <Upload className="size-4" />
                    <AlertTitle>Authentication required</AlertTitle>
                    <AlertDescription>
                      The radio stream is available to signed-in users and vendors, while uploads are restricted to admins.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-3">
                    <Button asChild className="flex-1 rounded-full">
                      <a href="/vendor/login">Vendor sign in</a>
                    </Button>
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                      <a href="/admin/radio">Admin studio</a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-6 space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertTitle>Radio error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="rounded-3xl border border-border bg-secondary/30 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-2">Now queued</p>
                        <h3 className="text-lg font-semibold leading-tight">
                          {currentTrack?.title ?? 'Ready to stream'}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentTrack?.artist ?? 'Freshly uploaded tracks from SpringUpAI Radio'}
                        </p>
                      </div>
                      {isLoadingTrack ? (
                        <Loader2 className="size-5 animate-spin text-primary" />
                      ) : (
                        <Volume2 className="size-5 text-primary" />
                      )}
                    </div>

                    <Progress value={progress} />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                      <span>{currentTrack ? formatDuration(currentTrack) : '0:00'}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        className="rounded-full flex-1"
                        onClick={() => void handleTogglePlayback()}
                        disabled={isLoadingQueue || isLoadingTrack || tracks.length === 0}
                      >
                        {isPlaying ? <Pause /> : <Play />}
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => void handleNextTrack()}
                        disabled={isLoadingTrack || tracks.length < 2}
                      >
                        <SkipForward />
                        Next
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Buffered tracks</p>
                      <p className="text-xs text-muted-foreground">We preload 8 tracks and call the next batch when the buffer ends.</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      onClick={() => void fetchInitialQueue()}
                      disabled={isLoadingQueue}
                    >
                      {isLoadingQueue ? <Loader2 className="animate-spin" /> : <Radio />}
                      Refresh
                    </Button>
                  </div>

                  <Separator />

                  <ScrollArea className="h-72 pr-4">
                    <div className="space-y-3">
                      {tracks.length === 0 && !isLoadingQueue && (
                        <div className="rounded-2xl border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                          No tracks buffered yet. Open the radio after upload, or refresh once the admin studio has published songs.
                        </div>
                      )}

                      {tracks.map((track, index) => {
                        const isActive = index === currentIndex;

                        return (
                          <button
                            key={track.id}
                            type="button"
                            onClick={() => void handleSelectTrack(index)}
                            className={cn(
                              'w-full rounded-2xl border px-4 py-3 text-left transition hover:border-primary/40 hover:bg-secondary/40',
                              isActive && 'border-primary bg-primary/5 shadow-sm'
                            )}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-medium leading-tight">{track.title}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {track.artist ?? track.album ?? 'SpringUpAI Radio'}
                                </p>
                              </div>
                              <Badge variant={isActive ? 'default' : 'outline'}>
                                {formatDuration(track)}
                              </Badge>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1 rounded-full">
                      <a href="/admin/radio">Admin upload studio</a>
                    </Button>
                    <Button asChild variant="ghost" className="flex-1 rounded-full">
                      <a href={currentTrack ? getRadioStreamUrl(currentTrack.id) : '/admin/radio'} target={currentTrack ? '_blank' : undefined} rel={currentTrack ? 'noreferrer' : undefined}>
                        Inspect stream endpoint
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="group h-14 rounded-full bg-primary px-4 text-primary-foreground shadow-elevated inline-flex items-center gap-3 hover:scale-[1.03] active:scale-[0.98] transition-transform"
          aria-label={panelLabel}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-white/15">
            <Music2 size={20} />
          </span>
          <span className="hidden sm:flex flex-col items-start pr-1">
            <span className="text-xs uppercase tracking-[0.2em] text-primary-foreground/70">Radio</span>
            <span className="text-sm font-semibold leading-tight">{currentTrack?.title ?? 'Open player'}</span>
          </span>
        </button>
      </div>
    </>
  );
}
