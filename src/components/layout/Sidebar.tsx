
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Utensils,
  ClipboardList,
  Table2,
  Package2,
  BarChart3,
  Settings,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  title: string;
  icon: React.ReactNode;
  url: string;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />,
    url: '/',
  },
  {
    title: 'Menu',
    icon: <Utensils className="h-5 w-5" />,
    url: '/menu',
  },
  {
    title: 'Orders',
    icon: <ClipboardList className="h-5 w-5" />,
    url: '/orders',
  },
  {
    title: 'Tables',
    icon: <Table2 className="h-5 w-5" />,
    url: '/tables',
  },
  {
    title: 'Inventory',
    icon: <Package2 className="h-5 w-5" />,
    url: '/inventory',
  },
  {
    title: 'Customers',
    icon: <Users className="h-5 w-5" />,
    url: '/customers',
  },
  {
    title: 'Reports',
    icon: <BarChart3 className="h-5 w-5" />,
    url: '/reports',
  },
  {
    title: 'Settings',
    icon: <Settings className="h-5 w-5" />,
    url: '/settings',
  },
];

export function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <div className="flex flex-col h-full space-y-2 p-4">
      {sidebarItems.map((item) => (
        <Link key={item.url} to={item.url}>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-2",
              currentPath === item.url && "bg-muted"
            )}
          >
            {item.icon}
            {item.title}
          </Button>
        </Link>
      ))}
    </div>
  );
}
