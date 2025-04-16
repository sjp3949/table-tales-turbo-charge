
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Table, TableSection as TableSectionType } from '@/types';
import { TableSectionComponent } from '@/components/tables/TableSection';
import { TableActionDialog } from '@/components/tables/TableActionDialog';
import { mockTableSections } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Tables() {
  const [tableSections, setTableSections] = useState(mockTableSections);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tableSections[0]?.id || '');
  
  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setDialogOpen(true);
  };
  
  const handleAddTable = (sectionId: string) => {
    // This would open a dialog to add a new table in a real app
    console.log(`Add table to section ${sectionId}`);
    
    // For demo purposes, add a dummy table
    const section = tableSections.find(s => s.id === sectionId);
    if (section) {
      const newTable: Table = {
        id: `table-${Date.now()}`,
        name: `Table ${section.tables.length + 1}`,
        section: sectionId,
        capacity: 4,
        status: 'available',
        positionX: 150,
        positionY: 150,
      };
      
      const updatedSections = tableSections.map(s => 
        s.id === sectionId
          ? { ...s, tables: [...s.tables, newTable] }
          : s
      );
      
      setTableSections(updatedSections);
    }
  };
  
  // Filter displayed sections based on active tab
  const displayedSection = tableSections.find(s => s.id === activeTab) || tableSections[0];
  
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
          
          {/* For smaller screens */}
          <div className="w-full sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Select section" />
              </SelectTrigger>
              <SelectContent>
                {tableSections.map(section => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Tabs for section navigation - Hidden on small screens */}
        <div className="hidden sm:block">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto">
              {tableSections.map(section => (
                <TabsTrigger key={section.id} value={section.id} className="flex-1 sm:flex-initial">
                  {section.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Table section */}
        {displayedSection && (
          <TableSectionComponent
            section={displayedSection}
            onSelectTable={handleTableSelect}
            onAddTable={handleAddTable}
          />
        )}
        
        {/* Table action dialog */}
        <TableActionDialog
          table={selectedTable}
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
        />
        
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
