import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { InventoryItemCard } from '@/components/inventory/InventoryItem';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, AlertTriangle } from 'lucide-react';

export default function Inventory() {
  const { inventory, isLoading, updateInventoryItem } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  // Filter inventory items
  const filteredItems = inventory?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'low-stock' && item.quantity <= item.threshold);
    
    return matchesSearch && matchesFilter;
  }) ?? [];
  
  // Count low stock items
  const lowStockCount = inventory?.filter(
    item => item.quantity <= item.threshold
  ).length ?? 0;
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your restaurant inventory and stock levels
            </p>
          </div>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            value={activeFilter} 
            onValueChange={setActiveFilter}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all">All Items</TabsTrigger>
              <TabsTrigger value="low-stock" className="flex items-center">
                Low Stock
                {lowStockCount > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
                    {lowStockCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No inventory items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onSave={updateInventoryItem.mutate}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
