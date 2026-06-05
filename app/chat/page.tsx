import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ChatStartCard } from '@/components/chat-start-card';
import { Logo } from '@/components/logo';

export default function ChatStartPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero pointer-events-none" />
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <Logo />
          <Link href="/" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft size={14} /> Home
          </Link>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <Suspense>
            <ChatStartCard />
          </Suspense>
        </div>
      </main>
    </div>
  );
}