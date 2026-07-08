'use client';

import { VerificationReportPage } from '@/components/pages/VerificationReportPage';
import { mockVerificationReport } from '@/lib/mock/report';

export default function ReportPage() {
  return <VerificationReportPage report={mockVerificationReport} />;
}
