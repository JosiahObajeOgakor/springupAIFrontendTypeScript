'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  BarChart3,
  BrainCircuit,
  FileText,
  Key,
  LayoutDashboard,
  LogOut,
  Menu,
  Radio,
  ShieldCheck,
  Users,
  Building2,
  X,
} from 'lucide-react';
import { Logo } from '@/components/logo';
import { NotificationBell } from '@/components/notification-bell';
import { ProtectedRoute } from '@/components/protected-route';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAppDispatch } from '@/lib/store/hooks';
import { clearAuth } from '@/lib/store/authSlice';

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/vendors', label: 'Vendors', icon: Building2 },
  { href: '/admin/radio', label: 'Radio Studio', icon: Radio },
  { href: '/admin/ebooks', label: 'Ebook Advances', icon: BookOpen },
  { href: '/admin/embed-keys', label: 'Embed Keys', icon: Key },
  { href: '/admin/reports', label: 'Reports', icon: BarChart3 },
  { href: '/admin/ml', label: 'ML Rules', icon: BrainCircuit },
  { href: '/admin/logs', label: 'Event Logs', icon: FileText },
];

function NavLink({
  href,
  label,
  icon: Icon,
  exact,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
      )}
    >
      <Icon size={16} />
      {label}
    </Link>
  );
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  function handleLogout() {
    dispatch(clearAuth());
    router.push('/admin/login');
  }

  return (
    <div className="flex flex-col h-full py-5 px-3">
      <div className="px-3 mb-6">
        <Logo />
        <div className="flex items-center gap-1.5 mt-2">
          <ShieldCheck size={13} className="text-primary" />
          <span className="text-xs text-muted-foreground font-medium">Admin console</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} onClick={onNavClick} />
        ))}
      </nav>

      <div className="pt-4 border-t border-border space-y-1">
        <div className="px-3 py-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Notifications</span>
          <NotificationBell />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-card/50">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent onNavClick={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile topbar */}
        <header className="lg:hidden sticky top-0 z-40 border-b border-border glass px-4 py-3 flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </Button>
          <Logo />
          <div className="ml-auto">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
    </ProtectedRoute>
  );
}
