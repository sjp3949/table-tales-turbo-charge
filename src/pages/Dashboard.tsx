
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PopularItems } from '@/components/dashboard/PopularItems';
import { TableStatus } from '@/components/dashboard/TableStatus';
import { useReports } from '@/hooks/useReports';
import { useTables } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';
import { useInventory } from '@/hooks/useInventory';
import { DollarSign, Users, ShoppingBag, CreditCard, ChefHat, ClipboardList, AlertTriangle, IndianRupee } from 'lucide-react';

export default function Dashboard() {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const { tables, sections, isLoading: isLoadingTables } = useTables();
  const { orders, isLoading: isLoadingOrders } = useOrders();
  const { inventory, isLoading: isLoadingInventory } = useInventory();
  const { 
    salesByDay, 
    popularItems, 
    totalSales, 
    totalOrders, 
    salesTrend, 
    ordersTrend,
    isLoading 
  } = useReports(dateRange);
  
  // Calculate total tables and occupied tables
  const totalTables = tables ? tables.length : 0;
  const occupiedTables = tables ? tables.filter(table => table.status === 'occupied').length : 0;

  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
  
  // Get active orders (pending and preparing)
  const activeOrders = orders?.filter(order => 
    ['pending', 'preparing'].includes(order.status)
  ).slice(0, 3) || [];
  
  // Get low stock inventory items
  const lowStockItems = inventory?.filter(item => 
    item.quantity <= item.threshold
  ).slice(0, 3) || [];
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to RestaurantPro. Here's an overview of your restaurant's performance.
        </p>
        
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-36 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Sales Today"
              value={`₹${totalSales.toFixed(2)}`}
              icon={<IndianRupee className="h-4 w-4" />}
              description="Daily revenue"
              trend={salesTrend !== 0 ? { value: salesTrend, positive: salesTrend >= 0 } : undefined}
            />
            <StatCard
              title="Total Orders"
              value={totalOrders}
              icon={<ShoppingBag className="h-4 w-4" />}
              description="Orders today"
              trend={ordersTrend !== 0 ? { value: ordersTrend, positive: ordersTrend >= 0 } : undefined}
            />
            <StatCard
              title="Average Order"
              value={`₹${averageOrderValue.toFixed(2)}`}
              icon={<CreditCard className="h-4 w-4" />}
              description="Per order"
            />
            <StatCard
              title="Table Occupancy"
              value={`${totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0}%`}
              icon={<Users className="h-4 w-4" />}
              description={`${occupiedTables} of ${totalTables} tables`}
            />
          </div>
        )}
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-7">
          {isLoading ? (
            <>
              <div className="md:col-span-2 lg:col-span-4 h-80 bg-muted animate-pulse rounded-lg" />
              <div className="md:col-span-1 lg:col-span-3 h-80 bg-muted animate-pulse rounded-lg" />
            </>
          ) : (
            <>
              <div className="md:col-span-2 lg:col-span-4 dashboard-card h-80">
                <h3 className="font-medium mb-4">Sales Trend</h3>
                <SalesChart data={salesByDay} />
              </div>
              <div className="md:col-span-1 lg:col-span-3 dashboard-card h-80">
                <h3 className="font-medium mb-4">Popular Items</h3>
                <PopularItems items={popularItems} />
              </div>
            </>
          )}
        </div>
        
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading || isLoadingTables || isLoadingOrders || isLoadingInventory ? (
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
                {activeOrders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No active orders at the moment.</p>
                ) : (
                  <div className="space-y-2">
                    {activeOrders.map(order => (
                      <div key={order.id} className={`flex items-center justify-between p-2 rounded border ${
                        order.status === 'pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' : 
                        'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          {order.status === 'pending' ? (
                            <ChefHat className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          ) : (
                            <ClipboardList className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                          <div>
                            <div className="font-medium">
                              {order.tableId ? `Table ${order.tableId.substring(0, 4)}` : `Takeout #${order.id.substring(0, 4)}`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.status === 'pending' ? 'Pending' : 'Preparing'} 
                              ({Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)}m)
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">₹{order.total.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="dashboard-card space-y-4">
                <h3 className="font-medium">Inventory Alerts</h3>
                {lowStockItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No inventory alerts at the moment.</p>
                ) : (
                  <div className="space-y-2">
                    {lowStockItems.map(item => {
                      const percentRemaining = (item.quantity / item.threshold) * 100;
                      const isVeryLow = item.quantity < item.threshold * 0.5;
                      
                      return (
                        <div key={item.id} className={`flex items-center justify-between p-2 rounded border ${
                          isVeryLow ? 
                            'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                            'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        }`}>
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${
                              isVeryLow ? 
                                'text-red-600 dark:text-red-400' : 
                                'text-yellow-600 dark:text-yellow-400'
                            }`} />
                            <div>
                              <div className="font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {isVeryLow ? 'Very low' : 'Low stock'} ({item.quantity} {item.unit} left)
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">Reorder</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
