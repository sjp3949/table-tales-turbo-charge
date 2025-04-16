
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useTables() {
  const queryClient = useQueryClient();

  const { data: tables, isLoading } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching tables',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data.map(table => ({
        id: table.id,
        name: table.name,
        section: table.section,
        capacity: table.capacity,
        status: table.status as 'available' | 'occupied' | 'reserved',
        positionX: table.position_x,
        positionY: table.position_y
      })) as Table[];
    },
  });

  return {
    tables,
    isLoading,
  };
}
