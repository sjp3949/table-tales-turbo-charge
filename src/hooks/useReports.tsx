
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DailySales, PopularItem } from '@/types';

interface UseReportsReturn {
  salesByDay: DailySales[];
  popularItems: PopularItem[];
  totalSales: number;
  totalOrders: number;
  salesTrend: number;
  ordersTrend: number;
  isLoading: boolean;
  error: Error | null;
}

export function useReports(dateRange: 'day' | 'week' | 'month' | 'year' = 'week'): UseReportsReturn {
  const [salesByDay, setSalesByDay] = useState<DailySales[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [salesTrend, setSalesTrend] = useState(0);
  const [ordersTrend, setOrdersTrend] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchReportData() {
      setIsLoading(true);
      setError(null);

      try {
        // Get date range
        const today = new Date();
        let startDate = new Date();
        
        switch(dateRange) {
          case 'day':
            startDate = new Date(today);
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            break;
          case 'month':
            startDate = new Date(today);
            startDate.setMonth(today.getMonth() - 1);
            break;
          case 'year':
            startDate = new Date(today);
            startDate.setFullYear(today.getFullYear() - 1);
            break;
        }

        // Format dates for query
        const formattedStartDate = startDate.toISOString();
        const formattedEndDate = today.toISOString();
        
        // Fetch orders within date range
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', formattedStartDate)
          .lte('created_at', formattedEndDate);
        
        if (ordersError) throw ordersError;

        // Calculate total sales and orders
        const currentTotalSales = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
        const currentTotalOrders = orders?.length || 0;
        
        setTotalSales(currentTotalSales);
        setTotalOrders(currentTotalOrders);

        // Get previous period for comparison (for trend calculation)
        const previousPeriodStart = new Date(startDate);
        const previousPeriodEnd = new Date(startDate);
        
        switch(dateRange) {
          case 'day':
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
            previousPeriodEnd.setDate(previousPeriodEnd.getDate() - 1);
            previousPeriodEnd.setHours(23, 59, 59, 999);
            break;
          case 'week':
            previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
            previousPeriodEnd = new Date(startDate);
            previousPeriodEnd.setSeconds(previousPeriodEnd.getSeconds() - 1);
            break;
          case 'month':
            previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
            previousPeriodEnd = new Date(startDate);
            previousPeriodEnd.setSeconds(previousPeriodEnd.getSeconds() - 1);
            break;
          case 'year':
            previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
            previousPeriodEnd = new Date(startDate);
            previousPeriodEnd.setSeconds(previousPeriodEnd.getSeconds() - 1);
            break;
        }
        
        // Fetch previous period orders for trend calculation
        const { data: prevOrders, error: prevOrdersError } = await supabase
          .from('orders')
          .select('*')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString());
        
        if (prevOrdersError) throw prevOrdersError;
        
        const prevTotalSales = prevOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
        const prevTotalOrders = prevOrders?.length || 0;
        
        // Calculate trends (percentage change)
        const calcTrend = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return Number(((current - previous) / previous * 100).toFixed(1));
        };
        
        setSalesTrend(calcTrend(currentTotalSales, prevTotalSales));
        setOrdersTrend(calcTrend(currentTotalOrders, prevTotalOrders));

        // Group orders by day for the sales chart
        const salesByDayMap = new Map<string, number>();
        
        // Initialize the map with all days in the range
        let currentDay = new Date(startDate);
        while (currentDay <= today) {
          const dateKey = currentDay.toISOString().split('T')[0];
          salesByDayMap.set(dateKey, 0);
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Fill in the actual sales data
        orders?.forEach(order => {
          const orderDate = new Date(order.created_at).toISOString().split('T')[0];
          const currentAmount = salesByDayMap.get(orderDate) || 0;
          salesByDayMap.set(orderDate, currentAmount + Number(order.total));
        });
        
        // Convert to array format for chart
        const dailySalesData: DailySales[] = Array.from(salesByDayMap).map(([date, total]) => ({
          date,
          total
        }));
        
        setSalesByDay(dailySalesData);

        // Fetch order items to calculate popular items
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            id,
            menu_item_id,
            price,
            quantity,
            orders!inner(created_at),
            menu_items(name)
          `)
          .gte('orders.created_at', formattedStartDate)
          .lte('orders.created_at', formattedEndDate);
        
        if (itemsError) throw itemsError;
        
        // Group by menu item
        const itemCountMap = new Map<string, { count: number; revenue: number; name: string }>();
        
        orderItems?.forEach(item => {
          const itemId = item.menu_item_id;
          const itemName = item.menu_items?.name || 'Unknown Item';
          const price = Number(item.price);
          const quantity = Number(item.quantity);
          const revenue = price * quantity;
          
          if (itemCountMap.has(itemId)) {
            const current = itemCountMap.get(itemId)!;
            itemCountMap.set(itemId, {
              count: current.count + quantity,
              revenue: current.revenue + revenue,
              name: itemName
            });
          } else {
            itemCountMap.set(itemId, {
              count: quantity,
              revenue: revenue,
              name: itemName
            });
          }
        });
        
        // Convert to array and sort by revenue
        const popularItemsData: PopularItem[] = Array.from(itemCountMap).map(([itemId, data]) => ({
          itemId,
          name: data.name,
          count: data.count,
          revenue: data.revenue
        })).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        
        setPopularItems(popularItemsData);
      } catch (err) {
        console.error('Error fetching report data:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch report data'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchReportData();
  }, [dateRange]);

  return {
    salesByDay,
    popularItems,
    totalSales,
    totalOrders,
    salesTrend,
    ordersTrend,
    isLoading,
    error
  };
}
