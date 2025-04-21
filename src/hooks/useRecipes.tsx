
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Recipe, RecipeIngredient } from '@/types';
import { toast } from '@/hooks/use-toast';

export function useRecipes() {
  const queryClient = useQueryClient();

  // Get all recipes
  const { data: recipes, isLoading } = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data: recipesData, error } = await supabase
        .from('recipes')
        .select(`
          *,
          menu_items (id, name),
          recipe_ingredients (
            id, recipe_id, inventory_id, quantity, unit,
            inventory (id, name, unit)
          )
        `);
      
      if (error) {
        toast({
          title: 'Error fetching recipes',
          description: error.message,
          variant: 'destructive',
        });
        throw error;
      }
      
      return recipesData.map(recipe => ({
        id: recipe.id,
        menuItemId: recipe.menu_item_id,
        menuItemName: recipe.menu_items?.name || 'Unknown Item',
        createdAt: new Date(recipe.created_at),
        ingredients: (recipe.recipe_ingredients || []).map(ingredient => ({
          id: ingredient.id,
          recipeId: ingredient.recipe_id,
          inventoryId: ingredient.inventory_id,
          inventoryName: ingredient.inventory?.name || 'Unknown Ingredient',
          quantity: ingredient.quantity,
          unit: ingredient.unit
        }))
      })) as Recipe[];
    },
  });

  // Get recipe by menu item ID
  const getRecipeByMenuItemId = async (menuItemId: string) => {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_ingredients (
          id, recipe_id, inventory_id, quantity, unit,
          inventory (id, name, unit)
        )
      `)
      .eq('menu_item_id', menuItemId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // No recipe found for this menu item
        return null;
      }
      toast({
        title: 'Error fetching recipe',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      menuItemId: data.menu_item_id,
      createdAt: new Date(data.created_at),
      ingredients: (data.recipe_ingredients || []).map(ingredient => ({
        id: ingredient.id,
        recipeId: ingredient.recipe_id,
        inventoryId: ingredient.inventory_id,
        inventoryName: ingredient.inventory?.name || 'Unknown Ingredient',
        quantity: ingredient.quantity,
        unit: ingredient.unit
      }))
    } as Recipe;
  };

  // Create a recipe
  const createRecipe = useMutation({
    mutationFn: async ({ menuItemId }: { menuItemId: string }) => {
      // Check if recipe already exists
      const { data: existingRecipe } = await supabase
        .from('recipes')
        .select('id')
        .eq('menu_item_id', menuItemId)
        .maybeSingle();
      
      if (existingRecipe) {
        return existingRecipe.id; // Return existing recipe ID
      }
      
      // Create new recipe
      const { data, error } = await supabase
        .from('recipes')
        .insert({ menu_item_id: menuItemId })
        .select()
        .single();

      if (error) throw error;
      
      return data.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating recipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Add ingredient to recipe
  const addIngredient = useMutation({
    mutationFn: async ({ 
      recipeId, 
      inventoryId, 
      quantity, 
      unit 
    }: { 
      recipeId: string; 
      inventoryId: string; 
      quantity: number; 
      unit: string;
    }) => {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .insert({
          recipe_id: recipeId,
          inventory_id: inventoryId,
          quantity,
          unit
        })
        .select()
        .single();

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Ingredient added',
        description: 'Ingredient has been added to the recipe.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error adding ingredient',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update ingredient
  const updateIngredient = useMutation({
    mutationFn: async ({ 
      id, 
      quantity, 
      unit 
    }: { 
      id: string; 
      quantity: number; 
      unit: string;
    }) => {
      const { data, error } = await supabase
        .from('recipe_ingredients')
        .update({
          quantity,
          unit
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Ingredient updated',
        description: 'Ingredient has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating ingredient',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Remove ingredient
  const removeIngredient = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipe_ingredients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Ingredient removed',
        description: 'Ingredient has been removed from the recipe.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error removing ingredient',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete recipe
  const deleteRecipe = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      toast({
        title: 'Recipe deleted',
        description: 'Recipe has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting recipe',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    recipes,
    isLoading,
    getRecipeByMenuItemId,
    createRecipe,
    addIngredient,
    updateIngredient,
    removeIngredient,
    deleteRecipe,
  };
}
