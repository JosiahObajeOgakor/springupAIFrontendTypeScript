'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, Music2, Radio, Upload, Zap } from 'lucide-react';
import {
  listAdminRadioTracks,
  uploadAdminRadioBatch,
  uploadAdminRadioTrack,
  presignRadioUpload,
  putRadioFileToS3,
  completeRadioUpload,
  type RadioTrack,
} from '@/lib/api';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/authSlice';
import { AdminShell } from '@/components/admin-shell';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

function formatTrackMeta(track: RadioTrack) {
  return track.artist ?? track.album ?? track.genre ?? 'No metadata';
}

export default function AdminRadioPage() {
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [singleMeta, setSingleMeta] = useState({ title: '', artist: '', album: '', genre: '' });
  const [batchFiles, setBatchFiles] = useState<File[]>([]);
  const [tracks, setTracks] = useState<RadioTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [uploadingSingle, setUploadingSingle] = useState(false);
  const [uploadingBatch, setUploadingBatch] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  // ── Presigned S3 upload state ────────────────────────────────────────────────
  const [presignFile, setPresignFile] = useState<File | null>(null);
  const [presignMeta, setPresignMeta] = useState({ title: '', artist: '', genre: '' });
  const [presignUploading, setPresignUploading] = useState(false);
  const [presignProgress, setPresignProgress] = useState(0);
  const [presignDone, setPresignDone] = useState(false);

  const hasToken = useAppSelector(selectIsAuthenticated);

  const refreshTracks = useCallback(async () => {
    setLoadingTracks(true);
    setError('');
    try {
      setTracks(await listAdminRadioTracks());
    } catch (err) {
      setError('Unable to fetch uploaded tracks.');
      if (err instanceof Error) toast.error(err.message);
    } finally {
      setLoadingTracks(false);
    }
  }, []);

  useEffect(() => {
    if (hasToken) void refreshTracks();
  }, [hasToken, refreshTracks]);

  const handleSingleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleFile) { setError('Select a track before uploading.'); return; }
    setUploadingSingle(true);
    setUploadProgress(0);
    setError('');
    try {
      await uploadAdminRadioTrack({
        file: singleFile,
        title: singleMeta.title || undefined,
        artist: singleMeta.artist || undefined,
        album: singleMeta.album || undefined,
        genre: singleMeta.genre || undefined,
      }, (p) => setUploadProgress(p));
      toast.success('Track uploaded successfully.');
      setSingleFile(null);
      setSingleMeta({ title: '', artist: '', album: '', genre: '' });
      await refreshTracks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Single upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingSingle(false);
    }
  };

  const handleBatchUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (batchFiles.length === 0) { setError('Select up to 10 tracks for batch upload.'); return; }
    setUploadingBatch(true);
    setUploadProgress(0);
    setError('');
    try {
      await uploadAdminRadioBatch({ files: batchFiles }, (p) => setUploadProgress(p));
      toast.success('Batch upload completed.');
      setBatchFiles([]);
      await refreshTracks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Batch upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setUploadingBatch(false);
    }
  };

  const handlePresignUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presignFile) { setError('Select a file.'); return; }
    setPresignUploading(true);
    setPresignProgress(0);
    setPresignDone(false);
    setError('');
    try {
      // Step 1: get presigned URL
      const presign = await presignRadioUpload({
        file_name: presignFile.name,
        content_type: presignFile.type || 'audio/mpeg',
        title: presignMeta.title || undefined,
        artist: presignMeta.artist || undefined,
        genre: presignMeta.genre || undefined,
        file_size_bytes: presignFile.size,
      });
      // Step 2: PUT directly to S3
      await putRadioFileToS3(presign.put_url, presignFile, setPresignProgress);
      // Step 3: activate
      await completeRadioUpload({ track_id: presign.track_id, file_size_bytes: presignFile.size });
      setPresignDone(true);
      toast.success('Track uploaded via S3 — no gateway proxy!');
      setPresignFile(null);
      setPresignMeta({ title: '', artist: '', genre: '' });
      await refreshTracks();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Presigned upload failed.';
      setError(msg);
      toast.error(msg);
    } finally {
      setPresignUploading(false);
    }
  };

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Radio size={18} className="text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Radio Studio</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Upload and manage SpringUpAI Radio tracks. Users and vendors share the same queue.
          </p>
        </div>

        {!hasToken && (
          <Alert>
            <AlertTitle>Admin authentication required</AlertTitle>
            <AlertDescription>
              Sign in through the admin login page — the bearer token must be present in the browser before uploading.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Radio operation failed</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="single" className="space-y-5">
          <TabsList>
            <TabsTrigger value="single">Single upload</TabsTrigger>
            <TabsTrigger value="batch">Batch upload</TabsTrigger>
            <TabsTrigger value="presign" className="gap-1"><Zap size={12} />Direct S3</TabsTrigger>
            <TabsTrigger value="tracks">Track library</TabsTrigger>
          </TabsList>

          {/* Single upload */}
          <TabsContent value="single">
            <Card className="rounded-3xl shadow-float">
              <CardHeader>
                <CardTitle>Single track upload</CardTitle>
                <CardDescription>Push one track to <code className="text-xs">POST /api/v1/radio/upload</code> with optional metadata.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSingleUpload} className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="single-track">Audio file</Label>
                    <Input id="single-track" type="file" accept="audio/*"
                      onChange={(e) => setSingleFile(e.target.files?.[0] ?? null)} />
                  </div>
                  {(['title', 'artist', 'album', 'genre'] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`track-${field}`} className="capitalize">{field}</Label>
                      <Input
                        id={`track-${field}`}
                        value={singleMeta[field]}
                        onChange={(e) => setSingleMeta((prev) => ({ ...prev, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-3">
                    {uploadingSingle && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Uploading...</span>
                          <span className="font-semibold text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" className="rounded-full" disabled={uploadingSingle || !hasToken}>
                        {uploadingSingle ? <Loader2 className="animate-spin" /> : <Upload />}
                        Upload track
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch upload */}
          <TabsContent value="batch">
            <Card className="rounded-3xl shadow-float">
              <CardHeader>
                <CardTitle>Batch upload</CardTitle>
                <CardDescription>Upload up to 10 tracks at once to <code className="text-xs">POST /api/v1/radio/upload/batch</code>.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBatchUpload} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="batch-tracks">Batch files</Label>
                    <Input id="batch-tracks" type="file" accept="audio/*" multiple
                      onChange={(e) => setBatchFiles(Array.from(e.target.files ?? []).slice(0, 10))} />
                    <p className="text-xs text-muted-foreground">Selected {batchFiles.length} of 10 allowed files.</p>
                  </div>
                  {batchFiles.length > 0 && (
                    <div className="rounded-2xl border border-border bg-secondary/30 p-4 space-y-2">
                      <p className="text-sm font-medium">Queued uploads</p>
                      {batchFiles.map((file) => (
                        <div key={`${file.name}-${file.size}`} className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                          <span className="truncate">{file.name}</span>
                          <Badge variant="outline">{Math.round(file.size / 1024)} KB</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {uploadingBatch && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Uploading {batchFiles.length} tracks...</span>
                          <span className="font-semibold text-primary">{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" className="rounded-full" disabled={uploadingBatch || !hasToken || batchFiles.length === 0}>
                        {uploadingBatch ? <Loader2 className="animate-spin" /> : <Upload />}
                        Upload batch
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Direct S3 presigned upload */}
          <TabsContent value="presign">
            <Card className="rounded-3xl shadow-float">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Zap size={16} className="text-primary" /> Direct S3 Upload</CardTitle>
                <CardDescription>
                  Skips the gateway proxy — presigns an S3 PUT URL, uploads directly from the browser, then activates the track. Fastest for large files (up to 50 MB).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePresignUpload} className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="presign-file">Audio file (mp3 / wav)</Label>
                    <Input id="presign-file" type="file" accept="audio/*"
                      onChange={(e) => { setPresignFile(e.target.files?.[0] ?? null); setPresignDone(false); }} />
                  </div>
                  {(['title', 'artist', 'genre'] as const).map((field) => (
                    <div key={field} className="space-y-2">
                      <Label htmlFor={`presign-${field}`} className="capitalize">{field}</Label>
                      <Input
                        id={`presign-${field}`}
                        value={presignMeta[field]}
                        onChange={(e) => setPresignMeta((prev) => ({ ...prev, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2 space-y-3">
                    {presignUploading && (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Uploading directly to S3…</span>
                          <span className="font-semibold text-primary">{presignProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${presignProgress}%` }} />
                        </div>
                      </div>
                    )}
                    {presignDone && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle2 size={16} /> Track activated successfully.
                      </div>
                    )}
                    <div className="flex justify-end">
                      <Button type="submit" className="rounded-full" disabled={presignUploading || !hasToken || !presignFile}>
                        {presignUploading ? <Loader2 className="animate-spin" /> : <Zap size={15} />}
                        Upload via S3
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track library */}
          <TabsContent value="tracks">
            <Card className="rounded-3xl shadow-float">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>Track library</CardTitle>
                    <CardDescription>All tracks returned by <code className="text-xs">GET /api/v1/radio/tracks</code>.</CardDescription>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => void refreshTracks()} disabled={loadingTracks || !hasToken}>
                    {loadingTracks ? <Loader2 className="animate-spin" /> : <Music2 />}
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96 pr-3">
                  <div className="space-y-3">
                    {tracks.length === 0 && !loadingTracks ? (
                      <div className="rounded-2xl border border-dashed border-border px-4 py-12 text-center text-sm text-muted-foreground">
                        No tracks yet. Upload a song above and refresh.
                      </div>
                    ) : (
                      tracks.map((track) => (
                        <div key={track.id} className="rounded-2xl border border-border px-4 py-4 bg-background/80">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-medium leading-tight">{track.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">{formatTrackMeta(track)}</p>
                            </div>
                            <Badge variant="outline" className="font-mono text-xs shrink-0">{track.id}</Badge>
                          </div>
                          <Separator className="my-3" />
                          <div className="flex flex-wrap gap-2 text-xs">
                            {track.file_name && <Badge variant="secondary">{track.file_name}</Badge>}
                            {track.genre && <Badge variant="secondary">{track.genre}</Badge>}
                            {track.created_at && (
                              <Badge variant="secondary">{new Date(track.created_at).toLocaleString()}</Badge>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminShell>
  );
}
