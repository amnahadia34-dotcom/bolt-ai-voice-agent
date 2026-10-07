'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Bot,
  BookOpen,
  PhoneCall,
  Users,
  CalendarDays,
  BarChart3,
  Plug,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Agents', href: '/dashboard/agents', icon: Bot },
  { label: 'Knowledge Base', href: '/dashboard/knowledge-base', icon: BookOpen },
  { label: 'Calls', href: '/dashboard/calls', icon: PhoneCall },
  { label: 'Leads', href: '/dashboard/leads', icon: Users },
  { label: 'Appointments', href: '/dashboard/appointments', icon: CalendarDays },
  { label: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { label: 'Integrations', href: '/dashboard/integrations', icon: Plug },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { organization, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive =
          item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const OrgInfo = () => (
    <div className="px-3">
      <div className="rounded-lg border bg-card p-3">
        <p className="text-xs text-muted-foreground">Organization</p>
        <p className="truncate text-sm font-semibold">
          {organization?.name ?? '—'}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {profile?.full_name ?? '—'}
        </p>
      </div>
    </div>
  );

  const SignOutButton = () => (
    <div className="px-3">
      <Button
        variant="ghost"
        className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar trigger */}
      <div className="flex items-center gap-3 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-9 w-9">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center border-b px-6">
                <span className="text-lg font-bold tracking-tight">VoiceForge</span>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto py-6">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>
              <div className="space-y-4 border-t py-6">
                <OrgInfo />
                <SignOutButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r bg-card md:flex md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold tracking-tight">VoiceForge</span>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto py-6">
          <NavLinks />
        </div>
        <div className="space-y-4 border-t py-6">
          <OrgInfo />
          <SignOutButton />
        </div>
      </aside>
    </>
  );
}
