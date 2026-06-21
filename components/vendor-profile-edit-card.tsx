'use client';

import { useState } from 'react';
import { Edit3, Loader2, Save } from 'lucide-react';
import { updateVendorProfile } from '@/lib/api';
import type { VendorUpdatePayload } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  initial?: {
    name?: string;
    category?: string;
    location?: string;
    bio?: string;
  };
}

export function VendorProfileEditCard({ initial = {} }: Props) {
  const [form, setForm] = useState<Required<VendorUpdatePayload>>({
    name: initial.name ?? '',
    category: initial.category ?? '',
    location: initial.location ?? '',
    bio: initial.bio ?? '',
  });
  const [saving, setSaving] = useState(false);

  function patch(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: VendorUpdatePayload = {};
      if (form.name.trim())     payload.name     = form.name.trim();
      if (form.category.trim()) payload.category = form.category.trim();
      if (form.location.trim()) payload.location = form.location.trim();
      if (form.bio.trim())      payload.bio      = form.bio.trim();

      await updateVendorProfile(payload);
      toast.success('Profile updated.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="rounded-3xl shadow-float">
      <CardHeader>
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
          <Edit3 size={16} className="text-primary" />
        </div>
        <CardTitle>Edit profile</CardTitle>
        <CardDescription>Update your public vendor details. Leave a field blank to keep it unchanged.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="vp-name">Display name</Label>
              <Input id="vp-name" className="rounded-2xl" placeholder="Business name" value={form.name} onChange={patch('name')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vp-category">Category</Label>
              <Input id="vp-category" className="rounded-2xl" placeholder="e.g. Plumbing" value={form.category} onChange={patch('category')} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vp-location">Location</Label>
              <Input id="vp-location" className="rounded-2xl" placeholder="City / area" value={form.location} onChange={patch('location')} />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="vp-bio">Bio</Label>
              <Textarea
                id="vp-bio"
                className="rounded-2xl resize-none"
                rows={3}
                placeholder="Tell customers about your experience and speciality…"
                value={form.bio}
                onChange={patch('bio')}
              />
            </div>
          </div>
          <Button type="submit" className="w-full rounded-full" disabled={saving}>
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            Save changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
