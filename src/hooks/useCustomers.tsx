
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

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
      
      return data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        notes: customer.notes,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at),
        totalOrders: customer.total_orders || 0,
        totalSpent: customer.total_spent || 0,
      })) as Customer[];
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
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        totalOrders: data.total_orders || 0,
        totalSpent: data.total_spent || 0,
      } as Customer;
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        notes: data.notes,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
        totalOrders: data.total_orders || 0,
        totalSpent: data.total_spent || 0,
      } as Customer;
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
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return data;
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
