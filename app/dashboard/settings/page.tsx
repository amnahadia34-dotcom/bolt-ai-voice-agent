'use client';

import { Settings } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function SettingsPage() {
  return (
    <ComingSoonPage
      title="Settings"
      description="Manage your organization, team, and account preferences"
      icon={Settings}
    />
  );
}
