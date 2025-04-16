
import { useState } from 'react';
import { MenuItem } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Trash, MoreHorizontal } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/useMenu';

interface MenuCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (item: MenuItem) => void;
  onToggleAvailability: (item: MenuItem, available: boolean) => void;
}

export function MenuCard({ item, onEdit, onDelete, onToggleAvailability }: MenuCardProps) {
  const [isAvailable, setIsAvailable] = useState(item.available);
  const { categories } = useMenu();
  
  const category = categories.find(c => c.id === item.categoryId);
  
  const handleAvailabilityChange = (checked: boolean) => {
    setIsAvailable(checked);
    onToggleAvailability(item, checked);
  };
  
  return (
    <Card className={cn(
      "h-full transition-all duration-300",
      !isAvailable && "opacity-70"
    )}>
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription className="line-clamp-2">{item.description}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(item)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Item
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(item)}
                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-lg font-bold mt-2">${item.price.toFixed(2)}</div>
        
        <div className="mt-4 flex items-center space-x-2">
          <Switch 
            id={`available-${item.id}`} 
            checked={isAvailable}
            onCheckedChange={handleAvailabilityChange}
          />
          <Label htmlFor={`available-${item.id}`}>Available</Label>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          Category: {category?.name || 'Uncategorized'}
        </div>
      </CardFooter>
    </Card>
  );
}
