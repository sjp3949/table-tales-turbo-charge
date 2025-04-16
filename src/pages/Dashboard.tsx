
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PopularItems } from '@/components/dashboard/PopularItems';
import { TableStatus } from '@/components/dashboard/TableStatus';
import { mockDashboardStats, mockTableSections } from '@/data/mockData';
import { DollarSign, Users, ShoppingBag, CreditCard, ChefHat, ClipboardList } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(mockDashboardStats);
  const [loading, setLoading] = useState(true);
  
  // Simulate loading from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  
  // Calculate total tables and occupied tables
  const totalTables = mockTableSections.reduce(
    (acc, section) => acc + section.tables.length,
    0
  );
  
  const occupiedTables = mockTableSections.reduce(
    (acc, section) => 
      acc + section.tables.filter(t => t.status === 'occupied').length,
    0
  );
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to RestaurantPro. Here's an overview of your restaurant's performance.
        </p>
        
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sales Today"
              value={`$${stats.totalSalesToday.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4" />}
              description="Daily revenue"
              trend={{ value: 12.5, positive: true }}
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrdersToday}
              icon={<ShoppingBag className="h-4 w-4" />}
              description="Orders today"
              trend={{ value: 8.2, positive: true }}
            />
            <StatCard
              title="Average Order"
              value={`$${stats.averageOrderValue.toFixed(2)}`}
              icon={<CreditCard className="h-4 w-4" />}
              description="Per order"
              trend={{ value: 3.1, positive: true }}
            />
            <StatCard
              title="Table Occupancy"
              value={`${Math.round((occupiedTables / totalTables) * 100)}%`}
              icon={<Users className="h-4 w-4" />}
              description={`${occupiedTables} of ${totalTables} tables`}
            />
          </div>
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-7">
          {loading ? (
            <>
              <div className="md:col-span-2 lg:col-span-4 h-80 bg-muted animate-pulse rounded-lg" />
              <div className="md:col-span-1 lg:col-span-3 h-80 bg-muted animate-pulse rounded-lg" />
            </>
          ) : (
            <>
              <SalesChart data={stats.salesByDay} />
              <PopularItems items={stats.popularItems} />
            </>
          )}
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-muted animate-pulse rounded-lg" />
              ))}
            </>
          ) : (
            <>
              <TableStatus occupied={occupiedTables} total={totalTables} />
              
              <div className="dashboard-card space-y-4">
                <h3 className="font-medium">Active Orders</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <div className="font-medium">Table 2</div>
                        <div className="text-xs text-muted-foreground">Preparing (15m)</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$49.95</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <div>
                        <div className="font-medium">Takeout #42</div>
                        <div className="text-xs text-muted-foreground">Ready (5m)</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">$24.98</div>
                  </div>
                </div>
              </div>
              
              <div className="dashboard-card space-y-4">
                <h3 className="font-medium">Inventory Alerts</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <div className="font-medium">Chicken Breast</div>
                        <div className="text-xs text-muted-foreground">Low stock (2kg left)</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">Reorder</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      <div>
                        <div className="font-medium">Tomatoes</div>
                        <div className="text-xs text-muted-foreground">Very low (0.5kg left)</div>
                      </div>
                    </div>
                    <div className="text-sm font-medium">Reorder</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

function AlertTriangle({ className }: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
      <line x1="12" y1="9" x2="12" y2="13"></line>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  );
}
