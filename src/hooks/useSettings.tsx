import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Settings {
  id?: string;
  restaurantName?: string;
  receiptFooter?: string;
  taxRate?: number;
  serviceCharge?: number;
  requireCustomerDetails?: boolean;
  notifications?: {
    newOrder?: boolean;
    lowInventory?: boolean;
    dailySummary?: boolean;
  };
  created_at?: string;
  updated_at?: string;
}

export function useSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        toast({
          title: 'Error fetching settings',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as Settings || null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      // If we already have settings, update them
      if (settings?.id) {
        const { data, error } = await supabase
          .from('settings')
          .update({
            ...newSettings,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } 
      // Otherwise, create new settings
      else {
        const { data, error } = await supabase
          .from('settings')
          .insert([{
            ...newSettings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating settings',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
}
