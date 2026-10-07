'use client';

import { BarChart3 } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function AnalyticsPage() {
  return (
    <ComingSoonPage
      title="Analytics"
      description="Insights into your agents' performance and call metrics"
      icon={BarChart3}
    />
  );
}
