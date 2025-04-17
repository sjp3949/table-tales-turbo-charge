
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryTransaction } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useInventory() {
  const queryClient = useQueryClient();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching inventory',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as InventoryItem[];
    },
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['inventory-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_transactions')
        .select(`
          *,
          inventory:inventory_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: 'Error fetching transactions',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data.map(transaction => ({
        id: transaction.id,
        inventoryId: transaction.inventory_id,
        itemName: transaction.inventory?.name || 'Unknown Item',
        previousQuantity: transaction.previous_quantity,
        newQuantity: transaction.new_quantity,
        transactionType: transaction.transaction_type,
        notes: transaction.notes,
        createdAt: new Date(transaction.created_at),
      })) as InventoryTransaction[];
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      // First, get the current item to record the previous quantity
      const { data: currentItem, error: fetchError } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('id', item.id)
        .single();

      if (fetchError) throw fetchError;
      
      // Update the inventory item
      const { data, error } = await supabase
        .from('inventory')
        .update({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          threshold: item.threshold,
          cost: item.cost
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      
      // Record the transaction if quantity changed
      if (currentItem.quantity !== item.quantity) {
        await supabase
          .from('inventory_transactions')
          .insert({
            inventory_id: item.id,
            previous_quantity: currentItem.quantity,
            new_quantity: item.quantity,
            transaction_type: item.quantity > currentItem.quantity ? 'restock' : 'usage',
            notes: `Quantity updated from ${currentItem.quantity} to ${item.quantity} ${item.unit}`
          });
      }
      
      return data as InventoryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast({
        title: 'Inventory updated',
        description: 'The inventory item has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating inventory',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const generateInventoryReport = useMutation({
    mutationFn: async (reportType: 'daily' | 'weekly' | 'monthly') => {
      // Calculate summary data
      const lowStockItems = inventory?.filter(item => item.quantity <= item.threshold) || [];
      const totalItems = inventory?.length || 0;
      const totalValue = inventory?.reduce((sum, item) => sum + (item.quantity * item.cost), 0) || 0;
      
      const summary = {
        totalItems,
        lowStockCount: lowStockItems.length,
        lowStockItems: lowStockItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          threshold: item.threshold,
          unit: item.unit
        })),
        totalValue,
        generatedAt: new Date().toISOString(),
      };
      
      // Store the report
      const { data, error } = await supabase
        .from('inventory_reports')
        .insert({
          report_type: reportType,
          summary
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        reportType: data.report_type,
        reportDate: new Date(data.report_date),
        summary: data.summary,
        createdAt: new Date(data.created_at),
      };
    },
    onSuccess: () => {
      toast({
        title: 'Report generated',
        description: 'Inventory report has been successfully generated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error generating report',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    inventory,
    isLoading,
    transactions,
    isLoadingTransactions,
    updateInventoryItem,
    generateInventoryReport,
  };
}
