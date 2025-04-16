
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useMenu() {
  const queryClient = useQueryClient();

  const { data: menuItems, isLoading: isLoadingMenu } = useQuery({
    queryKey: ['menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('order_index');
      
      if (error) {
        toast({
          title: 'Error fetching menu items',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    },
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('menu_sections')
        .select('*')
        .order('order_index');
      
      if (error) {
        toast({
          title: 'Error fetching categories',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data;
    },
  });

  const addMenuItem = useMutation({
    mutationFn: async (newItem: Omit<MenuItem, 'id'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([newItem])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: 'Menu item added',
        description: 'The menu item has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding menu item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateMenuItem = useMutation({
    mutationFn: async (item: MenuItem) => {
      const { data, error } = await supabase
        .from('menu_items')
        .update(item)
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: 'Menu item updated',
        description: 'The menu item has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating menu item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMenuItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu-items'] });
      toast({
        title: 'Menu item deleted',
        description: 'The menu item has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting menu item',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    menuItems,
    categories,
    isLoading: isLoadingMenu || isLoadingCategories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
  };
}
