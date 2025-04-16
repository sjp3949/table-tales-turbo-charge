
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useOrders() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            menu_item_id,
            price,
            quantity,
            notes,
            menu_items (name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching orders',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return ordersData.map(order => ({
        id: order.id,
        tableId: order.table_id,
        customerName: order.customer_name,
        items: (order.order_items || []).map(item => ({
          id: item.id,
          menuItemId: item.menu_item_id,
          name: item.menu_items?.name || 'Unknown Item',
          price: item.price,
          quantity: item.quantity,
          notes: item.notes
        })) as OrderItem[],
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.created_at),
        total: order.total
      })) as Order[];
    },
  });

  const createOrder = useMutation({
    mutationFn: async ({ 
      tableId, 
      items, 
      customerName 
    }: { 
      tableId: string | null; 
      items: { menuItemId: string; quantity: number; price: number; notes?: string }[];
      customerName?: string;
    }) => {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      // Fix order_type format - use lowercase strings to match database constraints
      const orderType = tableId ? 'dine_in' : 'takeout';
      
      console.log('Creating order with type:', orderType, 'tableId:', tableId);
      
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          table_id: tableId, 
          customer_name: customerName,
          total,
          subtotal: total,
          order_type: orderType,
          order_number: Date.now().toString(),
          status: 'pending'
        }])
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(
          items.map(item => ({
            order_id: orderData.id,
            menu_item_id: item.menuItemId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
          }))
        );

      if (itemsError) throw itemsError;

      return orderData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order created',
        description: 'The order has been created successfully.',
      });
    },
    onError: (error) => {
      console.error('Error creating order:', error);
      toast({
        title: 'Error creating order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Order['status'] }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast({
        title: 'Order updated',
        description: 'The order status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating order',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
  };
}
