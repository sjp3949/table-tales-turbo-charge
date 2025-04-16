
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenuItem, MenuCategory } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useMenu() {
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: isLoadingMenu } = useQuery({
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
      
      // Map database fields to our frontend types
      return data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || '',
        category: item.category,
        image: item.image_url,
        available: item.is_available
      })) as MenuItem[];
    },
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
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
      
      // Updating this mapping to only include fields that exist in the database
      return data.map(category => ({
        id: category.id,
        name: category.name,
        // Remove the description property since it doesn't exist in menu_sections
      })) as MenuCategory[];
    },
  });

  const addMenuItem = useMutation({
    mutationFn: async (newItem: Omit<MenuItem, 'id'>) => {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{
          name: newItem.name,
          description: newItem.description,
          price: newItem.price,
          category: newItem.category,
          image_url: newItem.image,
          is_available: newItem.available,
          is_veg: false // Default value as per schema
        }])
        .select()
        .single();

      if (error) throw error;
      
      // Map database response to our frontend type
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description || '',
        category: data.category,
        image: data.image_url,
        available: data.is_available
      } as MenuItem;
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
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          image_url: item.image,
          is_available: item.available,
          is_veg: false // Default value as per your schema
        })
        .eq('id', item.id)
        .select()
        .single();

      if (error) throw error;
      
      // Map database response to our frontend type
      return {
        id: data.id,
        name: data.name,
        price: data.price,
        description: data.description || '',
        category: data.category,
        image: data.image_url,
        available: data.is_available
      } as MenuItem;
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
