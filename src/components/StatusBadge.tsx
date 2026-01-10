import React from 'react';
import { Badge } from '@/components/ui/badge';

type Status = 'published' | 'draft' | 'planned' | 'deleted' | 'revision';

interface StatusBadgeProps {
  status: Status;
}

const statusConfig: Record<Status, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  published: { label: 'Published', variant: 'default' },
  draft: { label: 'Draft', variant: 'secondary' },
  planned: { label: 'Planned', variant: 'outline' },
  deleted: { label: 'Deleted', variant: 'destructive' },
  revision: { label: 'Revision', variant: 'outline' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
