
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

  // Fetch sections - since we don't have a dedicated table_sections table in the database yet,
  // we'll extract unique sections from the tables
  const { data: sections, isLoading: isLoadingSections } = useQuery({
    queryKey: ['table-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('section')
        .order('section');
      
      if (error) {
        toast({
          title: 'Error fetching table sections',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      // Create unique sections from the data
      const uniqueSections = Array.from(new Set(data.map(item => item.section)))
        .map(sectionName => ({
          id: sectionName, // Using section name as both id and name since we don't have section_id
          name: sectionName
        }));
      
      return uniqueSections as TableSection[];
    },
  });

  const { data: tables, isLoading: isLoadingTables } = useQuery({
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
        sectionId: table.section, // Using section as sectionId
        sectionName: table.section,
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
      // In our simplified model, sectionId is the section name
      const sectionName = sectionId;
      
      const { data, error } = await supabase
        .from('tables')
        .insert({
          name,
          section: sectionName,
          capacity,
          status: 'available',
          position_x: 100, // Default position
          position_y: 100  // Default position
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
