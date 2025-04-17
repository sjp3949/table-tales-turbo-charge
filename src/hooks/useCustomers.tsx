
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

// Define type for raw customer data from Supabase
type CustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  address: string | null;
  notes: string | null;
  total_orders: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
};

// Helper function to convert from database row to Customer type
const mapCustomerRowToCustomer = (row: CustomerRow): Customer => ({
  id: row.id,
  name: row.name,
  email: row.email || undefined,
  phone: row.phone,
  address: row.address || undefined,
  notes: row.notes || undefined,
  createdAt: new Date(row.created_at),
  updatedAt: new Date(row.updated_at),
  totalOrders: row.total_orders,
  totalSpent: row.total_spent,
});

export function useCustomers() {
  const queryClient = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) {
        toast({
          title: 'Error fetching customers',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return (data as CustomerRow[]).map(mapCustomerRowToCustomer);
    },
  });

  const findCustomerByPhone = async (phone: string) => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', phone)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    
    if (data) {
      return mapCustomerRowToCustomer(data as CustomerRow);
    }
    
    return null;
  };

  const createCustomer = useMutation({
    mutationFn: async (customer: { 
      name: string; 
      phone: string; 
      email?: string; 
      address?: string; 
      notes?: string; 
    }) => {
      // Check if customer already exists with this phone
      const existingCustomer = await findCustomerByPhone(customer.phone);
      
      if (existingCustomer) {
        return existingCustomer;
      }
      
      // Create new customer
      const { data, error } = await supabase
        .from('customers')
        .insert([{
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          notes: customer.notes,
          total_orders: 0,
          total_spent: 0,
        }])
        .select()
        .single();

      if (error) throw error;
      
      return mapCustomerRowToCustomer(data as CustomerRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const updateCustomer = useMutation({
    mutationFn: async ({
      id,
      ...customerData
    }: {
      id: string;
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .update({
          ...customerData,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapCustomerRowToCustomer(data as CustomerRow);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    customers,
    isLoading,
    createCustomer,
    updateCustomer,
    findCustomerByPhone,
  };
}
