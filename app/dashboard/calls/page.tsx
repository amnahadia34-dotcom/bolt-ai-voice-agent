'use client';

import { PhoneCall } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function CallsPage() {
  return (
    <ComingSoonPage
      title="Calls"
      description="View call history, transcripts, and recordings"
      icon={PhoneCall}
    />
  );
}
