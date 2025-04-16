
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table } from '@/types';
import { TableSectionComponent } from '@/components/tables/TableSection';
import { TableActionDialog } from '@/components/tables/TableActionDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Tables() {
  const { tables, sections, isLoading, addTable } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  
  // Form state for adding new table
  const [newTableName, setNewTableName] = useState('');
  const [newTableSection, setNewTableSection] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setDialogOpen(true);
  };
  
  const handleAddTable = async () => {
    try {
      await addTable.mutateAsync({
        name: newTableName,
        sectionId: newTableSection,
        capacity: newTableCapacity,
      });
      setAddTableDialogOpen(false);
      setNewTableName('');
      setNewTableSection('');
      setNewTableCapacity(4);
    } catch (error) {
      console.error('Error adding table:', error);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  // Group tables by section
  const tablesBySection = sections?.map(section => ({
    ...section,
    tables: tables?.filter(table => table.sectionId === section.id) || [],
  })) || [];
  
  // Get current section data
  const currentSection = tablesBySection.find(s => s.id === activeSection) || tablesBySection[0];
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tables</h1>
            <p className="text-muted-foreground">
              Manage your restaurant tables and sections
            </p>
          </div>
          
          <Button onClick={() => setAddTableDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Table
          </Button>
        </div>
        
        {/* For smaller screens */}
        <div className="w-full sm:hidden">
          <Select value={activeSection} onValueChange={setActiveSection}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              {sections?.map(section => (
                <SelectItem key={section.id} value={section.id}>
                  {section.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Tabs for section navigation - Hidden on small screens */}
        <div className="hidden sm:block">
          <Tabs value={activeSection} onValueChange={setActiveSection}>
            <TabsList className="w-full sm:w-auto">
              {sections?.map(section => (
                <TabsTrigger key={section.id} value={section.id} className="flex-1 sm:flex-initial">
                  {section.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Table section */}
        {currentSection && (
          <TableSectionComponent
            section={{
              id: currentSection.id,
              name: currentSection.name,
              tables: currentSection.tables
            }}
            onSelectTable={handleTableSelect}
            onAddTable={() => setAddTableDialogOpen(true)}
          />
        )}
        
        {/* Table action dialog */}
        <TableActionDialog
          table={selectedTable}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
        
        {/* Add table dialog */}
        <Dialog open={addTableDialogOpen} onOpenChange={setAddTableDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="table-name">Table Name</Label>
                <Input
                  id="table-name"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="e.g., Table 1"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="table-section">Section</Label>
                <Select value={newTableSection} onValueChange={setNewTableSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections?.map(section => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="table-capacity">Capacity</Label>
                <Input
                  id="table-capacity"
                  type="number"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                  min={1}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleAddTable} disabled={!newTableName || !newTableSection}>
                Add Table
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-4 pt-4 border-t">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-red-500 mr-2"></div>
            <span className="text-sm">Occupied</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm">Reserved</span>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
