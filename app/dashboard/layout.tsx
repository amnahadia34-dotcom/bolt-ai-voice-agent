'use client';

import { useAuth } from '@/lib/auth-context';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { Sidebar } from '@/components/dashboard/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading } = useRequireAuth();
  const { organization } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card/50 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-medium text-muted-foreground md:text-base">
              {organization?.name ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
