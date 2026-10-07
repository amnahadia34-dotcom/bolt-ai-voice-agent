'use client';

import { BookOpen } from 'lucide-react';
import { ComingSoonPage } from '@/components/dashboard/coming-soon';

export default function KnowledgeBasePage() {
  return (
    <ComingSoonPage
      title="Knowledge Base"
      description="Upload documents to give your AI agents business-specific knowledge"
      icon={BookOpen}
    />
  );
}
