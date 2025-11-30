import type { ReactNode } from 'react';
import { AuthHeader } from '../components/AuthHeader';

interface FeaturesLayoutProps {
  children: ReactNode;
}

export const FeaturesLayout = ({ children }: FeaturesLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <AuthHeader showSearch={false} />
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
};







