
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <Sidebar />
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
        isMobile ? "ml-0" : "ml-20 md:ml-64" // adjust based on your sidebar width
      )}>
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
