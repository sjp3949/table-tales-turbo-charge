
import { useState, useEffect } from 'react';
import { MenuItem, MenuCategory } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RecipeManagement } from '@/components/menu/RecipeManagement';

interface MenuDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  initialData?: MenuItem;
  categories: MenuCategory[];
}

export function MenuDialog({
  open,
  onClose,
  onSave,
  initialData,
  categories
}: MenuDialogProps) {
  const [itemData, setItemData] = useState<MenuItem>({
    id: '',
    name: '',
    price: 0,
    description: '',
    categoryId: '',
    available: true,
  });
  
  const [activeTab, setActiveTab] = useState('details');
  
  useEffect(() => {
    if (initialData) {
      setItemData(initialData);
    } else {
      // Reset form for new item
      setItemData({
        id: `item-${Date.now()}`,
        name: '',
        price: 0,
        description: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        available: true,
      });
      setActiveTab('details');
    }
  }, [initialData, open, categories]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setItemData(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setItemData(prev => ({
      ...prev,
      categoryId: value,
    }));
  };
  
  const handleAvailabilityChange = (checked: boolean) => {
    setItemData(prev => ({
      ...prev,
      available: checked,
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(itemData);
  };
  
  const isEdit = !!initialData;
  const showRecipeTab = isEdit;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? 'Update the details of the menu item and manage its recipe.'
                : 'Fill in the details to add a new menu item.'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              {showRecipeTab && <TabsTrigger value="recipe">Recipe</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="details" className="py-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={itemData.name}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Price
                  </Label>
                  <div className="col-span-3 flex items-center">
                    <span className="mr-2">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemData.price}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select
                    value={itemData.categoryId}
                    onValueChange={handleCategoryChange}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={itemData.description}
                    onChange={handleChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="available" className="text-right">
                    Available
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="available"
                      checked={itemData.available}
                      onCheckedChange={handleAvailabilityChange}
                    />
                    <Label htmlFor="available">
                      {itemData.available ? 'Yes' : 'No'}
                    </Label>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {showRecipeTab && (
              <TabsContent value="recipe" className="py-4">
                <RecipeManagement 
                  menuItemId={itemData.id} 
                  menuItemName={itemData.name} 
                />
              </TabsContent>
            )}
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {activeTab === 'details' ? (
              <Button type="submit">{isEdit ? 'Save Changes' : 'Add Item'}</Button>
            ) : (
              <Button type="button" onClick={() => setActiveTab('details')}>
                Back to Details
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
