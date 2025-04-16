
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MenuItem } from '@/types';
import { MenuCard } from '@/components/menu/MenuCard';
import { MenuDialog } from '@/components/menu/MenuDialog';
import { useMenu } from '@/hooks/useMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search } from 'lucide-react';

export default function Menu() {
  const { menuItems, categories, isLoading, addMenuItem, updateMenuItem, deleteMenuItem } = useMenu();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | undefined>(undefined);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleAddItem = () => {
    setEditingItem(undefined);
    setDialogOpen(true);
  };
  
  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setDialogOpen(true);
  };
  
  const handleSaveItem = (item: MenuItem) => {
    if (editingItem) {
      updateMenuItem.mutate(item);
    } else {
      addMenuItem.mutate(item);
    }
    setDialogOpen(false);
  };
  
  // Filter menu items by category and search query
  const filteredItems = menuItems?.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) ?? [];
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Menu</h1>
            <p className="text-muted-foreground">
              Manage your restaurant menu items and categories
            </p>
          </div>
          <Button onClick={handleAddItem}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs 
            value={activeCategory} 
            onValueChange={setActiveCategory}
            className="w-full"
          >
            <TabsList className="w-full sm:w-auto overflow-auto">
              <TabsTrigger value="all">All Categories</TabsTrigger>
              {categories?.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
            <p className="mb-4 text-muted-foreground">No menu items found</p>
            <Button variant="outline" onClick={handleAddItem}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Menu Item
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <MenuCard
                key={item.id}
                item={item}
                onEdit={handleEditItem}
                onDelete={() => deleteMenuItem.mutate(item.id)}
                onToggleAvailability={(item, available) => 
                  updateMenuItem.mutate({ ...item, available })
                }
              />
            ))}
          </div>
        )}
        
        <MenuDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveItem}
          initialData={editingItem}
          categories={categories}
        />
      </div>
    </MainLayout>
  );
}
