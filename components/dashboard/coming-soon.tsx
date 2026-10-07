'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

export function ComingSoonPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-secondary">
            <Icon className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">Coming Soon</h3>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            This feature will be configured in a future phase. Stay tuned for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
