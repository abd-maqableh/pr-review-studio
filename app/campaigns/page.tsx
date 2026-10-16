import { Suspense } from 'react';
import { Campaigns } from '@/components/campaigns';

export default function CampaignsPage() {
  return <Suspense fallback={<div className="panel" aria-busy="true" />}><Campaigns /></Suspense>;
}
