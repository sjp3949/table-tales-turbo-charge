
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
      
      const orderType = tableId ? 'dine-in' : 'takeout';
      
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

  // New function to handle printing an invoice
  const printInvoice = (order: Order) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      toast({
        title: 'Printing failed',
        description: 'Unable to open print window. Please check your browser settings.',
        variant: 'destructive',
      });
      return;
    }
    
    // Create the invoice HTML content
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice #${order.id.substring(0, 8)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .invoice { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .details { margin-bottom: 20px; }
          .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items th, .items td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          .total { text-align: right; font-weight: bold; }
          .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #777; }
          @media print {
            body { margin: 0; padding: 0; }
            .invoice { border: none; }
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="invoice">
          <div class="header">
            <h1>RECEIPT</h1>
            <p>Order #${order.id.substring(0, 8)}</p>
            <p>${new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div class="details">
            ${order.customerName ? `<p><strong>Customer:</strong> ${order.customerName}</p>` : ''}
            ${order.tableId ? `<p><strong>Table:</strong> ${order.tableId}</p>` : ''}
          </div>
          <table class="items">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>$${item.price.toFixed(2)}</td>
                  <td>$${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="total">
            <p>Total: $${order.total.toFixed(2)}</p>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
          </div>
          <button class="print-btn" onclick="window.print(); window.close();">Print</button>
        </div>
        <script>
          window.onload = function() {
            // Auto print for convenience
            setTimeout(() => window.print(), 500);
          }
        </script>
      </body>
      </html>
    `;
    
    // Write the HTML to the new window and trigger printing
    printWindow.document.open();
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  return {
    orders,
    isLoading,
    createOrder,
    updateOrderStatus,
    printInvoice,
  };
}
