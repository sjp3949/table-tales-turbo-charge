
import { useState, useRef } from 'react';
import { TableSection, Table } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableSectionProps {
  section: TableSection;
  onSelectTable: (table: Table) => void;
  onAddTable: (sectionId: string) => void;
}

export function TableSectionComponent({ 
  section, 
  onSelectTable, 
  onAddTable 
}: TableSectionProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedTable, setDraggedTable] = useState<Table | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (table: Table) => {
    setIsDragging(true);
    setDraggedTable(table);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedTable(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (containerRef.current && draggedTable) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left;
      const newY = e.clientY - containerRect.top;
      
      // This would update the table position in a real app
      console.log(`Table ${draggedTable.id} position: ${newX}, ${newY}`);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{section.name}</CardTitle>
          <Button 
            size="sm" 
            onClick={() => onAddTable(section.id)}
            variant="outline"
            className="h-8"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Table
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef}
          className="relative h-[400px] border rounded-md bg-gray-50 dark:bg-gray-900 p-4 overflow-hidden"
          onDragOver={handleDragOver}
        >
          {section.tables.map(table => (
            <div
              key={table.id}
              className={cn(
                "restaurant-table absolute",
                table.status === 'available' && 'available',
                table.status === 'occupied' && 'occupied',
                table.status === 'reserved' && 'reserved'
              )}
              style={{
                left: `${table.positionX}px`,
                top: `${table.positionY}px`,
                width: `${table.capacity * 20 + 40}px`,
                height: `${table.capacity * 10 + 40}px`,
              }}
              onClick={() => onSelectTable(table)}
              draggable
              onDragStart={() => handleDragStart(table)}
              onDragEnd={handleDragEnd}
            >
              <div className="font-bold">{table.name}</div>
              <div className="text-xs">{table.capacity} seats</div>
              <div className={cn(
                "absolute bottom-1 right-1 h-2 w-2 rounded-full",
                table.status === 'available' && 'bg-green-500',
                table.status === 'occupied' && 'bg-red-500',
                table.status === 'reserved' && 'bg-yellow-500'
              )} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
