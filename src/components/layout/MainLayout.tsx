
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from './AppHeader';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      {!isMobile && <Sidebar />}
      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
        <footer className="py-4 px-6 border-t text-center text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} RestaurantPro. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
