'use client';

import { Music } from 'lucide-react';
import { toast } from 'sonner';

export function MusicPlayer() {
  return (
    <button
      onClick={() => toast('🎵 Music feature under progress', { description: 'Stay tuned — we\'re cooking something special!' })}
      className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
      aria-label="Music player"
    >
      <Music size={20} />
    </button>
  );
}
