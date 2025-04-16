
import { useState } from 'react';
import { InventoryItem } from '@/types';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Edit, Save, Package, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InventoryItemCardProps {
  item: InventoryItem;
  onSave: (item: InventoryItem) => void;
}

export function InventoryItemCard({ item, onSave }: InventoryItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [quantity, setQuantity] = useState(item.quantity);
  
  const handleSave = () => {
    onSave({
      ...item,
      quantity,
    });
    setIsEditing(false);
  };
  
  const isLowStock = item.quantity <= item.threshold;
  
  return (
    <Card className={cn(
      isLowStock && !isEditing && 'border-yellow-300 dark:border-yellow-800'
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              {item.name}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              Cost: ${item.cost.toFixed(2)} per {item.unit}
            </div>
          </div>
          {isLowStock && !isEditing && (
            <Badge 
              variant="outline" 
              className="bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Low Stock
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Quantity:</span>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-24 h-8 text-sm"
              />
            ) : (
              <span className={cn(
                "font-bold",
                isLowStock && "text-yellow-600 dark:text-yellow-400"
              )}>
                {item.quantity} {item.unit}
              </span>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Threshold:</span>
            <span>{item.threshold} {item.unit}</span>
          </div>
          
          <div className="pt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className={cn(
                  "h-2.5 rounded-full",
                  isLowStock 
                    ? "bg-yellow-500"
                    : "bg-green-500"
                )}
                style={{ width: `${Math.min(100, (item.quantity / (item.threshold * 2)) * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        {isEditing ? (
          <Button 
            className="w-full"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
        ) : (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setIsEditing(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Stock
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
