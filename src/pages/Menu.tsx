
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { MenuItem, MenuCategory } from '@/types';
import { MenuCard } from '@/components/menu/MenuCard';
import { MenuDialog } from '@/components/menu/MenuDialog';
import { mockMenuItems, mockCategories } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { PlusCircle, Search } from 'lucide-react';

export default function Menu() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [categories] = useState<MenuCategory[]>(mockCategories);
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
  
  const handleDeleteItem = (item: MenuItem) => {
    // In a real app, show confirmation dialog first
    setMenuItems(menuItems.filter(i => i.id !== item.id));
  };
  
  const handleToggleAvailability = (item: MenuItem, available: boolean) => {
    setMenuItems(
      menuItems.map(i => 
        i.id === item.id
          ? { ...i, available }
          : i
      )
    );
  };
  
  const handleSaveItem = (item: MenuItem) => {
    if (editingItem) {
      // Update existing item
      setMenuItems(
        menuItems.map(i => 
          i.id === item.id
            ? item
            : i
        )
      );
    } else {
      // Add new item
      setMenuItems([...menuItems, item]);
    }
    setDialogOpen(false);
  };
  
  // Filter menu items by category and search query
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  
  const getCategoryNameById = (id: string) => {
    const category = categories.find(cat => cat.id === id);
    return category?.name || id;
  };
  
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
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id}>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {filteredItems.length === 0 ? (
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
                onDelete={handleDeleteItem}
                onToggleAvailability={handleToggleAvailability}
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
