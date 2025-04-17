
import { useState, useRef, useEffect } from 'react';
import { TableSection, Table } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTables } from '@/hooks/useTables';
import { useOrders } from '@/hooks/useOrders';

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
  const { updateTablePosition } = useTables();
  const { orders } = useOrders();

  // Get orders for tables in this section
  const tableOrders = orders?.filter(order => 
    section.tables.some(table => table.id === order.tableId && order.status !== 'completed' && order.status !== 'cancelled')
  ) || [];

  // Update table status based on active orders
  const tablesWithOrderStatus = section.tables.map(table => {
    const hasActiveOrder = tableOrders.some(order => order.tableId === table.id);
    
    if (hasActiveOrder && table.status === 'available') {
      return {
        ...table,
        status: 'occupied' as const
      };
    }
    return table;
  });

  const handleDragStart = (table: Table, e: React.DragEvent) => {
    setIsDragging(true);
    setDraggedTable(table);
    
    // Set ghost drag image to be transparent
    const dragGhost = document.createElement('div');
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-9999px';
    dragGhost.style.opacity = '0';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 0, 0);
    
    // Add dragging class for visual feedback
    const tableElement = e.currentTarget as HTMLDivElement;
    tableElement.classList.add('dragging');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Remove dragging class
    const tableElements = document.querySelectorAll('.restaurant-table');
    tableElements.forEach(el => el.classList.remove('dragging'));
    
    if (containerRef.current && draggedTable) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left;
      const newY = e.clientY - containerRect.top;
      
      // Only update if we have valid coordinates
      if (newX >= 0 && newY >= 0) {
        // Add smooth transition for the ending position
        const tableElement = e.currentTarget as HTMLDivElement;
        tableElement.style.transition = 'transform 0.2s ease-out';
        
        // Update the table position in the database
        updateTablePosition.mutate({
          tableId: draggedTable.id,
          positionX: newX,
          positionY: newY
        });
      }
    }
    
    setIsDragging(false);
    setDraggedTable(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (isDragging && draggedTable && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      
      // Get current table element
      const tableElements = document.querySelectorAll('.restaurant-table');
      let draggedElement: Element | null = null;
      
      tableElements.forEach(el => {
        if (el.id === draggedTable.id) {
          draggedElement = el;
        }
      });
      
      if (draggedElement) {
        // Calculate new position relative to container
        const newX = e.clientX - containerRect.left;
        const newY = e.clientY - containerRect.top;
        
        // Update visual position immediately for smooth dragging
        (draggedElement as HTMLElement).style.left = `${newX}px`;
        (draggedElement as HTMLElement).style.top = `${newY}px`;
      }
    }
  };

  // Get customer name for a table if it has an order
  const getTableCustomer = (tableId: string) => {
    const order = tableOrders.find(order => order.tableId === tableId);
    return order?.customerName || '';
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
          {tablesWithOrderStatus.map(table => {
            const customerName = getTableCustomer(table.id);
            
            return (
              <div
                key={table.id}
                id={table.id}
                className={cn(
                  "restaurant-table absolute",
                  table.status === 'available' && 'available',
                  table.status === 'occupied' && 'occupied',
                  table.status === 'reserved' && 'reserved',
                  isDragging && draggedTable?.id === table.id && 'dragging'
                )}
                style={{
                  left: `${table.positionX}px`,
                  top: `${table.positionY}px`,
                  width: `${table.capacity * 20 + 40}px`,
                  height: `${table.capacity * 10 + 40}px`,
                }}
                onClick={() => onSelectTable(table)}
                draggable
                onDragStart={(e) => handleDragStart(table, e)}
                onDragEnd={handleDragEnd}
              >
                <div className="font-bold">{table.name}</div>
                <div className="text-xs">{table.capacity} seats</div>
                {customerName && (
                  <div className="text-xs mt-1 italic truncate max-w-full">
                    {customerName}
                  </div>
                )}
                <div className={cn(
                  "absolute bottom-1 right-1 h-2 w-2 rounded-full",
                  table.status === 'available' && 'bg-green-500',
                  table.status === 'occupied' && 'bg-red-500',
                  table.status === 'reserved' && 'bg-yellow-500'
                )} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
