
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem } from '@/types';
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
      
      return data;
    },
  });

  const updateInventoryItem = useMutation({
    mutationFn: async (item: InventoryItem) => {
      const { data, error } = await supabase
        .from('inventory')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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

  return {
    inventory,
    isLoading,
    updateInventoryItem,
  };
}
