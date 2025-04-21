
import { useState, useEffect } from 'react';
import { useRecipes } from '@/hooks/useRecipes';
import { useInventory } from '@/hooks/useInventory';
import { Recipe, InventoryItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Minus, 
  Edit, 
  Trash, 
  AlertTriangle,
  Save
} from 'lucide-react';

interface RecipeManagementProps {
  menuItemId: string;
  menuItemName: string;
}

export function RecipeManagement({ menuItemId, menuItemName }: RecipeManagementProps) {
  const { 
    getRecipeByMenuItemId, 
    createRecipe, 
    addIngredient, 
    updateIngredient, 
    removeIngredient 
  } = useRecipes();
  const { inventory, isLoading: isLoadingInventory } = useInventory();
  
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState<string>('');
  const [editingIngredient, setEditingIngredient] = useState<{
    id: string;
    quantity: number;
    unit: string;
  } | null>(null);
  
  // Load recipe data
  const loadRecipe = async () => {
    setIsLoading(true);
    try {
      const recipeData = await getRecipeByMenuItemId(menuItemId);
      setRecipe(recipeData);
    } catch (error) {
      console.error('Error loading recipe:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadRecipe();
  }, [menuItemId]);
  
  // Handle creating a new recipe
  const handleCreateRecipe = async () => {
    try {
      const recipeId = await createRecipe.mutateAsync({ menuItemId });
      loadRecipe();
    } catch (error) {
      console.error('Error creating recipe:', error);
    }
  };
  
  // Handle adding ingredient
  const handleAddIngredient = async () => {
    if (!recipe || !selectedIngredient || quantity <= 0) return;
    
    const selectedInventoryItem = inventory?.find(item => item.id === selectedIngredient);
    if (!selectedInventoryItem) return;
    
    try {
      await addIngredient.mutateAsync({
        recipeId: recipe.id,
        inventoryId: selectedIngredient,
        quantity,
        unit: unit || selectedInventoryItem.unit
      });
      
      // Reset form and close dialog
      setSelectedIngredient('');
      setQuantity(1);
      setUnit('');
      setAddDialogOpen(false);
      
      // Reload recipe
      loadRecipe();
    } catch (error) {
      console.error('Error adding ingredient:', error);
    }
  };
  
  // Handle updating ingredient
  const handleUpdateIngredient = async () => {
    if (!editingIngredient) return;
    
    try {
      await updateIngredient.mutateAsync({
        id: editingIngredient.id,
        quantity: editingIngredient.quantity,
        unit: editingIngredient.unit
      });
      
      // Reset form and close dialog
      setEditingIngredient(null);
      setEditDialogOpen(false);
      
      // Reload recipe
      loadRecipe();
    } catch (error) {
      console.error('Error updating ingredient:', error);
    }
  };
  
  // Handle removing ingredient
  const handleRemoveIngredient = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this ingredient?')) return;
    
    try {
      await removeIngredient.mutateAsync(id);
      loadRecipe();
    } catch (error) {
      console.error('Error removing ingredient:', error);
    }
  };
  
  // Handle opening edit dialog
  const handleOpenEditDialog = (ingredient: {
    id: string;
    quantity: number;
    unit: string;
  }) => {
    setEditingIngredient(ingredient);
    setEditDialogOpen(true);
  };
  
  if (isLoading || isLoadingInventory) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!recipe) {
    return (
      <div className="border rounded-md p-6 flex flex-col items-center justify-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-4">No recipe defined for this menu item.</p>
        <Button onClick={handleCreateRecipe}>
          <Plus className="h-4 w-4 mr-2" />
          Create Recipe
        </Button>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Recipe for {menuItemName}</h3>
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Ingredient
        </Button>
      </div>
      
      {recipe.ingredients.length === 0 ? (
        <div className="border rounded-md p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No ingredients added yet.</p>
          <Button 
            variant="outline"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Ingredient
          </Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recipe.ingredients.map(ingredient => (
              <TableRow key={ingredient.id}>
                <TableCell className="font-medium">{ingredient.inventoryName}</TableCell>
                <TableCell>{ingredient.quantity}</TableCell>
                <TableCell>{ingredient.unit}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditDialog({
                        id: ingredient.id,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit
                      })}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveIngredient(ingredient.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Add Ingredient Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Ingredient</DialogTitle>
            <DialogDescription>
              Select an ingredient from inventory and specify the quantity required for this recipe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ingredient">Ingredient</Label>
              <Select
                value={selectedIngredient}
                onValueChange={setSelectedIngredient}
              >
                <SelectTrigger id="ingredient">
                  <SelectValue placeholder="Select an ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {inventory?.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={quantity}
                  onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  placeholder="Use inventory unit if empty"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddIngredient} disabled={!selectedIngredient || quantity <= 0}>
              Add Ingredient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Ingredient Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update the quantity and unit for this ingredient.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-quantity">Quantity</Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editingIngredient?.quantity || 0}
                  onChange={e => setEditingIngredient(prev => 
                    prev ? { ...prev, quantity: parseFloat(e.target.value) || 0 } : null
                  )}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="edit-unit">Unit</Label>
                <Input
                  id="edit-unit"
                  value={editingIngredient?.unit || ''}
                  onChange={e => setEditingIngredient(prev => 
                    prev ? { ...prev, unit: e.target.value } : null
                  )}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateIngredient} 
              disabled={!editingIngredient || editingIngredient.quantity <= 0}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
