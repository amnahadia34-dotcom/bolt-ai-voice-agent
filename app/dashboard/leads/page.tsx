'use client';

import { Users } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function LeadsPage() {
  return (
    <ComingSoonPage
      title="Leads"
      description="Manage leads captured by your AI voice agents"
      icon={Users}
    />
  );
}
