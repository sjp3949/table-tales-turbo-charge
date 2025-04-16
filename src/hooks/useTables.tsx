
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table } from '@/types';
import { toast } from '@/hooks/use-toast';

interface TableSection {
  id: string;
  name: string;
}

export function useTables() {
  const queryClient = useQueryClient();

  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['table-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('table_sections')
        .select('*')
        .order('name');
      
      if (error) {
        toast({
          title: 'Error fetching table sections',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return data as TableSection[];
    },
  });

  const { data: tables, isLoading: isLoadingTables } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select(`
          *,
          table_sections:section_id(id, name)
        `)
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
        sectionId: table.section_id,
        sectionName: table.table_sections?.name || 'Unknown Section',
        capacity: table.capacity,
        status: table.status as 'available' | 'occupied' | 'reserved',
        positionX: table.position_x,
        positionY: table.position_y
      })) as Table[];
    },
  });

  const updateTablePosition = useMutation({
    mutationFn: async ({ 
      tableId, 
      positionX, 
      positionY 
    }: { 
      tableId: string; 
      positionX: number; 
      positionY: number; 
    }) => {
      const { error } = await supabase
        .from('tables')
        .update({ 
          position_x: positionX,
          position_y: positionY
        })
        .eq('id', tableId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating table position',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addTable = useMutation({
    mutationFn: async ({ 
      name, 
      sectionId, 
      capacity 
    }: { 
      name: string; 
      sectionId: string;
      capacity: number;
    }) => {
      const { data, error } = await supabase
        .from('tables')
        .insert({
          name,
          section_id: sectionId,
          section: (sections?.find(s => s.id === sectionId)?.name || ''),
          capacity,
          status: 'available'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast({
        title: 'Table added',
        description: 'The new table has been added successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding table',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    tables,
    sections,
    isLoading: isLoadingTables || isLoadingSections,
    updateTablePosition,
    addTable,
  };
}
