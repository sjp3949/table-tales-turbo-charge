
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Define type for raw settings data from Supabase
type SettingsRow = {
  id: string;
  restaurant_name: string | null;
  receipt_footer: string | null;
  tax_rate: number | null;
  service_charge: number | null;
  require_customer_details: boolean | null;
  notifications: {
    newOrder?: boolean;
    lowInventory?: boolean;
    dailySummary?: boolean;
  } | null;
  created_at: string;
  updated_at: string;
};

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

// Helper to convert from DB row to Settings interface
const mapSettingsRowToSettings = (row: SettingsRow): Settings => ({
  id: row.id,
  restaurantName: row.restaurant_name || undefined,
  receiptFooter: row.receipt_footer || undefined,
  taxRate: row.tax_rate || undefined,
  serviceCharge: row.service_charge || undefined,
  requireCustomerDetails: row.require_customer_details || undefined,
  notifications: row.notifications || undefined,
  created_at: row.created_at,
  updated_at: row.updated_at
});

// Helper to convert from Settings interface to DB row
const mapSettingsToRow = (settings: Partial<Settings>): Partial<SettingsRow> => ({
  restaurant_name: settings.restaurantName,
  receipt_footer: settings.receiptFooter,
  tax_rate: settings.taxRate,
  service_charge: settings.serviceCharge,
  require_customer_details: settings.requireCustomerDetails,
  notifications: settings.notifications
});

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
      
      return data ? mapSettingsRowToSettings(data as SettingsRow) : null;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<Settings>) => {
      // If we already have settings, update them
      if (settings?.id) {
        const { data, error } = await supabase
          .from('settings')
          .update(mapSettingsToRow(newSettings))
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;
        return mapSettingsRowToSettings(data as SettingsRow);
      } 
      // Otherwise, create new settings
      else {
        const { data, error } = await supabase
          .from('settings')
          .insert([mapSettingsToRow(newSettings)])
          .select()
          .single();

        if (error) throw error;
        return mapSettingsRowToSettings(data as SettingsRow);
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
