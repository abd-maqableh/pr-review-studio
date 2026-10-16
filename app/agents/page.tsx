import { Suspense } from 'react';
import { Agents } from '@/components/agents';
export default function AgentsPage() { return <Suspense fallback={<div className="panel" aria-busy="true" />}><Agents /></Suspense>; }
