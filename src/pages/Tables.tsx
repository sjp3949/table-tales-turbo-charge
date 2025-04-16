import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table } from '@/types';
import { TableSectionComponent } from '@/components/tables/TableSection';
import { TableActionDialog } from '@/components/tables/TableActionDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FolderPlus } from 'lucide-react';
import { useTables } from '@/hooks/useTables';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import '../styles/tables.css'; // Import the new CSS

export default function Tables() {
  const { tables, sections, isLoading, addTable, addSection } = useTables();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [newTableName, setNewTableName] = useState('');
  const [newTableSection, setNewTableSection] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');

  useEffect(() => {
    if (sections && sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

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

  const handleAddSection = async () => {
    try {
      await addSection.mutateAsync({
        name: newSectionName,
      });
      setAddSectionDialogOpen(false);
      setActiveSection(newSectionName);
      setNewSectionName('');
    } catch (error) {
      console.error('Error adding section:', error);
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

  const tablesBySection = sections?.map(section => ({
    ...section,
    tables: tables?.filter(table => table.sectionId === section.id) || [],
  })) || [];

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
          
          <div className="flex gap-2">
            <Button onClick={() => setAddSectionDialogOpen(true)} variant="outline">
              <FolderPlus className="mr-2 h-4 w-4" />
              Add Section
            </Button>
            <Button onClick={() => setAddTableDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Table
            </Button>
          </div>
        </div>
        
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
        
        <TableActionDialog
          table={selectedTable}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
        
        <Dialog open={addTableDialogOpen} onOpenChange={setAddTableDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Table</DialogTitle>
              <DialogDescription>Create a new table in your selected section.</DialogDescription>
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
        
        <Dialog open={addSectionDialogOpen} onOpenChange={setAddSectionDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>Create a new dining area section with a default table.</DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="section-name">Section Name</Label>
                <Input
                  id="section-name"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g., Main Dining Area"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={handleAddSection} disabled={!newSectionName}>
                Add Section
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
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
