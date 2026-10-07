'use client';

import { CalendarDays } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function AppointmentsPage() {
  return (
    <ComingSoonPage
      title="Appointments"
      description="View and manage appointments booked by your AI agents"
      icon={CalendarDays}
    />
  );
}
