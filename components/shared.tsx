'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { useDemo } from '@/lib/store';
import type { DocumentStatus } from '@/lib/types';

const statusLabels = {
  en: {
    draft: 'Draft',
    'in-review': 'In review',
    approved: 'Approved',
    'changes-requested': 'Changes requested',
  },
  ar: {
    draft: 'مسودة',
    'in-review': 'قيد المراجعة',
    approved: 'معتمد',
    'changes-requested': 'تعديلات مطلوبة',
  },
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { state } = useDemo();
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" aria-hidden="true" />
      {statusLabels[state.locale][status]}
    </span>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon?: LucideIcon;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      {Icon ? (
        <div className="empty-state-icon">
          <Icon size={24} aria-hidden="true" />
        </div>
      ) : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {children ? <div className="empty-state-actions">{children}</div> : null}
    </div>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      {children ? <div className="page-heading-actions">{children}</div> : null}
    </div>
  );
}
