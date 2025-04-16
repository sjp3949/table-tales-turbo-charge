
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { mockDashboardStats } from '@/data/mockData';
import { cn } from '@/lib/utils';

// Mock data for reports
const salesData = [
  { name: 'Monday', sales: 4000 },
  { name: 'Tuesday', sales: 3000 },
  { name: 'Wednesday', sales: 2000 },
  { name: 'Thursday', sales: 2780 },
  { name: 'Friday', sales: 5890 },
  { name: 'Saturday', sales: 7390 },
  { name: 'Sunday', sales: 3490 },
];

const categoryData = [
  { name: 'Main Course', value: 42 },
  { name: 'Appetizers', value: 28 },
  { name: 'Beverages', value: 15 },
  { name: 'Desserts', value: 10 },
  { name: 'Sides', value: 5 },
];

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export default function Reports() {
  const [dateRange, setDateRange] = useState('week');
  
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
              <div className="text-2xl font-bold">$7,349.30</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 text-xs font-medium mr-1">
                  +12.5%
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
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 text-xs font-medium mr-1">
                  +8.3%
                </span>
                vs previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Average Order</CardTitle>
              <CardDescription>Past 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$22.68</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <span className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded px-1 py-0.5 text-xs font-medium mr-1">
                  +4.2%
                </span>
                vs previous period
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-md">Top Item</CardTitle>
              <CardDescription>Most ordered item</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">Chicken Alfredo</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ordered 37 times
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
              <CardTitle>Sales by Category</CardTitle>
              <CardDescription>
                Revenue breakdown by menu category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
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
                                    Orders
                                  </span>
                                  <span className="font-bold text-xs">
                                    {payload[0].value}
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
      </div>
    </MainLayout>
  );
}
