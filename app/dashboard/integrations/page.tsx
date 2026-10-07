'use client';

import { Plug } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function IntegrationsPage() {
  return (
    <ComingSoonPage
      title="Integrations"
      description="Connect Vapi, Google Calendar, CRMs, and other tools"
      icon={Plug}
    />
  );
}
