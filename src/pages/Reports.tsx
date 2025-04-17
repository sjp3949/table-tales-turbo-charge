import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { cn } from '@/lib/utils';
import { useInventory } from '@/hooks/useInventory';
import { useReports } from '@/hooks/useReports';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { PopularItems } from '@/components/dashboard/PopularItems';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartBarIcon, CalendarDaysIcon, ChartPieIcon, FileTextIcon } from 'lucide-react';

export default function Reports() {
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const { inventory, reports, isLoadingReports: isLoadingInventoryReports } = useInventory();
  const { 
    salesByDay, 
    popularItems, 
    totalSales, 
    totalOrders, 
    salesTrend, 
    ordersTrend,
    isLoading: isLoadingSalesReports
  } = useReports(dateRange);
  
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
  
  const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];
  
  // Date range text for display
  const dateRangeText = {
    day: 'Today',
    week: 'Past 7 days',
    month: 'Past 30 days',
    year: 'Past year'
  };
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              Analyze your restaurant performance with detailed reports
            </p>
          </div>
          
          <Tabs 
            value={dateRange} 
            onValueChange={(value) => setDateRange(value as 'day' | 'week' | 'month' | 'year')}
            className="w-full sm:w-auto"
          >
            <TabsList>
              <TabsTrigger value="day" className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Today</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
              <TabsTrigger value="year" className="flex items-center gap-1">
                <CalendarDaysIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Year</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Total Sales
              </CardTitle>
              <CardDescription>{dateRangeText[dateRange]}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSalesReports ? (
                <div className="h-9 w-24 animate-pulse rounded bg-muted"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className={cn(
                      "rounded px-1 py-0.5 text-xs font-medium mr-1",
                      salesTrend >= 0 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {salesTrend >= 0 ? '+' : ''}{salesTrend}%
                    </span>
                    vs previous period
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Total Orders
              </CardTitle>
              <CardDescription>{dateRangeText[dateRange]}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSalesReports ? (
                <div className="h-9 w-16 animate-pulse rounded bg-muted"></div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{totalOrders}</div>
                  <p className="text-xs text-muted-foreground flex items-center mt-1">
                    <span className={cn(
                      "rounded px-1 py-0.5 text-xs font-medium mr-1",
                      ordersTrend >= 0 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                    )}>
                      {ordersTrend >= 0 ? '+' : ''}{ordersTrend}%
                    </span>
                    vs previous period
                  </p>
                </>
              )}
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
              <CardTitle className="flex items-center gap-2">
                <ChartBarIcon className="h-4 w-4" />
                Sales by Day
              </CardTitle>
              <CardDescription>
                Revenue breakdown by day
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {isLoadingSalesReports ? (
                <div className="h-80 w-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="h-80">
                  <SalesChart data={salesByDay} />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Inventory Value by Category</CardTitle>
              <CardDescription>Current inventory value distribution</CardDescription>
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
            <TabsTrigger value="popular" className="flex items-center gap-2">
              <ChartBarIcon className="h-4 w-4" />
              Popular Items
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <FileTextIcon className="h-4 w-4" />
              Inventory Reports
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="popular">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChartBarIcon className="h-4 w-4" />
                  Popular Items
                </CardTitle>
                <CardDescription>
                  Top selling items by revenue
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingSalesReports ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : popularItems.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No sales data available for the selected period.
                  </div>
                ) : (
                  <PopularItems items={popularItems} />
                )}
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
                {isLoadingInventoryReports ? (
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Low Stock</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reports.map((report, index) => (
                            <TableRow key={report.id}>
                              <TableCell className="font-medium capitalize">
                                {report.reportType}
                              </TableCell>
                              <TableCell>
                                {report.createdAt.toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {report.summary?.totalItems || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {report.summary?.lowStockCount || 'N/A'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${report.summary?.totalValue ? Number(report.summary.totalValue).toFixed(2) : 'N/A'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
