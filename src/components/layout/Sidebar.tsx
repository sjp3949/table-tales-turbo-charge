
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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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
  const [expanded, setExpanded] = useState(true);
  
  return (
    <div className={cn(
      "h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col relative",
      expanded ? "w-64" : "w-20"
    )}>
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        {expanded && <h2 className="text-xl font-bold text-restaurant-500">RestaurantPro</h2>}
        <Button 
          variant="ghost" 
          size="icon" 
          className="text-gray-400 hover:text-white hover:bg-gray-800 ml-auto"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>
      
      <div className="flex flex-col flex-grow space-y-2 p-3 overflow-y-auto">
        {sidebarItems.map((item) => (
          <Link key={item.url} to={item.url}>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-left mb-1 hover:bg-gray-800 hover:text-white transition-colors",
                expanded ? "" : "justify-center",
                currentPath === item.url ? "bg-gray-800 text-white" : "text-gray-400"
              )}
            >
              {item.icon}
              {expanded && <span>{item.title}</span>}
            </Button>
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-800 text-center">
        {expanded && <span className="text-xs text-gray-500">© 2025 RestaurantPro</span>}
      </div>
    </div>
  );
}
