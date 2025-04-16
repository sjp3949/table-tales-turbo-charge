
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ChefHat, 
  ClipboardList, 
  History, 
  BarChart3, 
  Settings, 
  Menu as MenuIcon,
  X,
  Table,
  PackageOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [isMobile]);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/tables', icon: <Table size={20} />, label: 'Tables' },
    { path: '/menu', icon: <ChefHat size={20} />, label: 'Menu' },
    { path: '/orders', icon: <ClipboardList size={20} />, label: 'Orders' },
    { path: '/inventory', icon: <PackageOpen size={20} />, label: 'Inventory' },
    { path: '/reports', icon: <BarChart3 size={20} />, label: 'Reports' },
    { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <MenuIcon size={24} />}
      </Button>

      {/* Sidebar overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-white dark:bg-gray-900 z-40 transition-all duration-300 ease-in-out border-r shadow-sm",
          isOpen ? "w-64" : "w-0 md:w-20",
          isMobile && !isOpen && "hidden"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn(
            "flex items-center justify-center h-16 border-b",
            !isOpen && "md:justify-center"
          )}>
            <Link to="/" className="text-primary font-bold text-xl flex items-center">
              {isOpen ? (
                <span className="animate-fade-in">RestaurantPro</span>
              ) : (
                <span className="text-xl">RP</span>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center py-2 px-4 rounded-md transition-colors",
                      location.pathname === item.path 
                        ? "bg-primary text-primary-foreground" 
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800",
                      !isOpen && "md:justify-center md:px-2"
                    )}
                  >
                    <span className="mr-3 md:mr-0">{item.icon}</span>
                    {isOpen && <span>{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Collapse button */}
          {!isMobile && (
            <div className="p-4 border-t">
              <Button 
                variant="outline" 
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center"
                size="sm"
              >
                {isOpen ? (
                  <>
                    <MenuIcon size={16} className="mr-2" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <MenuIcon size={16} />
                )}
              </Button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
