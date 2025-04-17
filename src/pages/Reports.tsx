
import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useInventory } from '@/hooks/useInventory';
import { supabase } from '@/integrations/supabase/client';
import { mockDashboardStats } from '@/data/mockData';

// Mock data for sales reports (will be replaced with actual data in future)
const salesData = [
  { name: 'Monday', sales: 4000 },
  { name: 'Tuesday', sales: 3000 },
  { name: 'Wednesday', sales: 2000 },
  { name: 'Thursday', sales: 2780 },
  { name: 'Friday', sales: 5890 },
  { name: 'Saturday', sales: 7390 },
  { name: 'Sunday', sales: 3490 },
];

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function Reports() {
  const [dateRange, setDateRange] = useState('week');
  const { inventory, reports, isLoadingReports } = useInventory();
  
  // Prepare data for inventory value by category chart
  const inventoryValueByCategory = inventory ? 
    Object.entries(
      inventory.reduce((acc: Record<string, number>, item) => {
        // Using the first word of the item name as a simple category
        const category = item.name.split(' ')[0];
        acc[category] = (acc[category] || 0) + (item.quantity * item.cost);
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value })) : [];
  
  // Sort by value and take top 5
  const topInventoryCategories = [...inventoryValueByCategory]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  
  // Recent report
  const latestReport = reports && reports.length > 0 ? reports[0] : null;
  
  // Calculate low stock items
  const lowStockCount = inventory?.filter(item => item.quantity <= item.threshold).length || 0;
  
  // Calculate total inventory value
  const totalInventoryValue = inventory?.reduce((sum, item) => sum + (item.quantity * item.cost), 0) || 0;
  
  // Fetch sales data (currently mocked)
  const [salesStats, setSalesStats] = useState({
    totalSales: 7349.30,
    totalOrders: 324,
    salesTrend: 12.5,
    ordersTrend: 8.3
  });
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Analyze your restaurant performance with detailed reports
          </p>
        </div>
        
        <div className="flex justify-end">
          <Tabs 
            value={dateRange} 
            onValueChange={setDateRange}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="day">Today</TabsTrigger>
              <TabsTrigger value="week">This Week</TabsTrigger>
              <TabsTrigger value="month">This Month</TabsTrigger>
              <TabsTrigger value="year">This Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Total Sales</CardTitle>
              <CardDescription>Past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${salesStats.totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 text-xs font-medium mr-1">
                  +{salesStats.salesTrend}%
                </span>
                vs previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Total Orders</CardTitle>
              <CardDescription>Past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{salesStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 text-xs font-medium mr-1">
                  +{salesStats.ordersTrend}%
                </span>
                vs previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Inventory Value</CardTitle>
              <CardDescription>Current total</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${totalInventoryValue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {inventory?.length || 0} items in stock
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Low Stock Items</CardTitle>
              <CardDescription>Below threshold</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {lowStockCount}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Items requiring attention
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Sales by Day</CardTitle>
              <CardDescription>
                Revenue breakdown by day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <XAxis 
                      dataKey="name" 
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Day
                                  </span>
                                  <span className="font-bold text-xs">
                                    {payload[0].payload.name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Sales
                                  </span>
                                  <span className="font-bold text-xs">
                                    ${payload[0].value}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="sales"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Inventory Value by Category</CardTitle>
              <CardDescription>
                Current inventory value distribution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topInventoryCategories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {topInventoryCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Category
                                  </span>
                                  <span className="font-bold text-xs">
                                    {payload[0].name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Value
                                  </span>
                                  <span className="font-bold text-xs">
                                    ${Number(payload[0].value).toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="popular">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:flex">
            <TabsTrigger value="popular">Popular Items</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle>Popular Items</CardTitle>
                <CardDescription>
                  Top selling items by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b p-3 text-sm font-medium">
                    <div className="col-span-6">Item</div>
                    <div className="col-span-2 text-center">Quantity</div>
                    <div className="col-span-2 text-center">Price</div>
                    <div className="col-span-2 text-right">Revenue</div>
                  </div>
                  {mockDashboardStats.popularItems.map((item, index) => (
                    <div 
                      key={item.itemId}
                      className={cn(
                        "grid grid-cols-12 p-3 text-sm",
                        index !== mockDashboardStats.popularItems.length - 1 && "border-b"
                      )}
                    >
                      <div className="col-span-6 font-medium">
                        {index + 1}. {item.name}
                      </div>
                      <div className="col-span-2 text-center">{item.count}</div>
                      <div className="col-span-2 text-center">
                        ${(item.revenue / item.count).toFixed(2)}
                      </div>
                      <div className="col-span-2 text-right font-medium">
                        ${item.revenue.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
                <CardDescription>
                  Recently generated inventory reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingReports ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : !reports || reports.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No inventory reports have been generated yet. Generate a report from the Inventory page.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {latestReport && latestReport.summary && (
                      <Card className="bg-muted/20">
                        <CardHeader>
                          <CardTitle className="text-base">Latest Inventory Summary</CardTitle>
                          <CardDescription>
                            {latestReport.createdAt.toLocaleString()}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium">Total Items</p>
                              <p className="text-2xl font-bold">{latestReport.summary.totalItems}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Total Value</p>
                              <p className="text-2xl font-bold">${Number(latestReport.summary.totalValue).toFixed(2)}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium">Low Stock Items</p>
                              <p className="text-2xl font-bold">{latestReport.summary.lowStockCount}</p>
                            </div>
                          </div>
                          
                          {latestReport.summary.lowStockCount > 0 && (
                            <div className="mt-4">
                              <p className="text-sm font-medium mb-2">Items Requiring Attention</p>
                              <div className="rounded-md border">
                                <div className="grid grid-cols-12 border-b p-2 text-xs font-medium">
                                  <div className="col-span-6">Item</div>
                                  <div className="col-span-3 text-center">Quantity</div>
                                  <div className="col-span-3 text-center">Threshold</div>
                                </div>
                                {latestReport.summary.lowStockItems.map((item: any, index: number) => (
                                  <div 
                                    key={item.id}
                                    className={cn(
                                      "grid grid-cols-12 p-2 text-xs",
                                      index !== latestReport.summary.lowStockItems.length - 1 && "border-b"
                                    )}
                                  >
                                    <div className="col-span-6 font-medium">
                                      {item.name}
                                    </div>
                                    <div className="col-span-3 text-center text-yellow-600 dark:text-yellow-400">
                                      {item.quantity} {item.unit}
                                    </div>
                                    <div className="col-span-3 text-center">
                                      {item.threshold} {item.unit}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    
                    <div className="rounded-md border">
                      <div className="grid grid-cols-12 border-b p-3 text-sm font-medium">
                        <div className="col-span-2">Type</div>
                        <div className="col-span-3">Date</div>
                        <div className="col-span-3">Items</div>
                        <div className="col-span-2">Low Stock</div>
                        <div className="col-span-2 text-right">Value</div>
                      </div>
                      {reports.map((report, index) => (
                        <div 
                          key={report.id}
                          className={cn(
                            "grid grid-cols-12 p-3 text-sm",
                            index !== reports.length - 1 && "border-b"
                          )}
                        >
                          <div className="col-span-2 font-medium capitalize">
                            {report.reportType}
                          </div>
                          <div className="col-span-3">
                            {report.createdAt.toLocaleDateString()}
                          </div>
                          <div className="col-span-3">
                            {report.summary?.totalItems || 'N/A'}
                          </div>
                          <div className="col-span-2">
                            {report.summary?.lowStockCount || 'N/A'}
                          </div>
                          <div className="col-span-2 text-right font-medium">
                            ${report.summary?.totalValue ? Number(report.summary.totalValue).toFixed(2) : 'N/A'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
