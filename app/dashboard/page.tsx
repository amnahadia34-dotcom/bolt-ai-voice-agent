'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bot, PhoneCall, Users, CalendarDays, ArrowRight, Plus } from 'lucide-react';

export default function DashboardOverview() {
  const { organization } = useAuth();
  const [agentCount, setAgentCount] = useState<number | null>(null);

  useEffect(() => {
    if (!organization) return;
    supabase
      .from('ai_agents')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', organization.id)
      .then(({ count }) => setAgentCount(count ?? 0));
  }, [organization]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your voice agents
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Bot}
          label="AI Agents"
          value={agentCount === null ? '—' : agentCount.toString()}
          href="/dashboard/agents"
        />
        <StatCard
          icon={PhoneCall}
          label="Total Calls"
          value="0"
          comingSoon
        />
        <StatCard
          icon={Users}
          label="Leads"
          value="0"
          comingSoon
        />
        <StatCard
          icon={CalendarDays}
          label="Appointments"
          value="0"
          comingSoon
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with your AI voice agents</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/agents">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Agent
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  comingSoon,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  href?: string;
  comingSoon?: boolean;
}) {
  const content = (
    <Card className={href ? 'cursor-pointer transition-all hover:shadow-md' : ''}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-bold">{value}</p>
          {comingSoon && (
            <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
              Soon
            </span>
          )}
        </div>
        {href && (
          <div className="mt-2 flex items-center gap-1 text-xs text-primary">
            View <ArrowRight className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
