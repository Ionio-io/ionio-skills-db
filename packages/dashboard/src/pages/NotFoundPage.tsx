import { Compass } from '@phosphor-icons/react';
import { Link } from 'react-router';

import { EmptyState } from '@/components/common/States';

export function NotFoundPage() {
  return (
    <EmptyState icon={<Compass size={24} />} title="This page does not exist">
      <Link to="/" className="font-medium text-accent-ink hover:underline">
        Back to the overview
      </Link>
    </EmptyState>
  );
}
