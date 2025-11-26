import { type ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  action?: ReactNode;
}

export const SectionHeader = ({ title, action }: SectionHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="font-display text-2xl tracking-wider text-primary">
        {title}
      </h2>
      {action}
    </div>
  );
};

