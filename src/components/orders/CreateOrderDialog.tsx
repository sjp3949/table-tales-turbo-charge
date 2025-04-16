import { useState } from 'react';
import { useMenu } from '@/hooks/useMenu';
import { useOrders } from '@/hooks/useOrders';
import { useTables } from '@/hooks/useTables';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Minus, Trash } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateOrderDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateOrderDialog({ open, onClose }: CreateOrderDialogProps) {
  const { menuItems, isLoading: isLoadingMenu } = useMenu();
  const { tables, isLoading: isLoadingTables } = useTables();
  const { createOrder } = useOrders();
  
  const [customerName, setCustomerName] = useState('');
  const [tableId, setTableId] = useState('takeout'); // Special value for takeout orders
  const [orderItems, setOrderItems] = useState<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[]>([]);
  
  const categories = Array.from(
    new Set(menuItems?.map(item => item.categoryId) || [])
  );
  
  const getMenuItemsByCategory = (categoryId: string) => {
    return menuItems?.filter(item => item.categoryId === categoryId) || [];
  };
  
  const addItemToOrder = (menuItemId: string, name: string, price: number) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItemId);
    
    if (existingItem) {
      setOrderItems(
        orderItems.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        { menuItemId, name, price, quantity: 1 }
      ]);
    }
  };
  
  const removeItemFromOrder = (menuItemId: string) => {
    const existingItem = orderItems.find(item => item.menuItemId === menuItemId);
    
    if (existingItem && existingItem.quantity > 1) {
      setOrderItems(
        orderItems.map(item =>
          item.menuItemId === menuItemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setOrderItems(orderItems.filter(item => item.menuItemId !== menuItemId));
    }
  };
  
  const calculateTotal = () => {
    return orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const handlePlaceOrder = async () => {
    try {
      const actualTableId = tableId === 'takeout' ? null : tableId;
      
      await createOrder.mutateAsync({
        tableId: actualTableId,
        customerName: customerName || undefined,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      setOrderItems([]);
      setCustomerName('');
      setTableId('takeout');
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Create New Order</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 flex-1">
          <div className="col-span-2">
            <Label htmlFor="customer-name">Customer Name (Optional)</Label>
            <Input
              id="customer-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="mt-1"
            />
          </div>
          
          {/* Table selection */}
          <div className="col-span-2">
            <Label htmlFor="table-id">Table or Takeout</Label>
            <Select 
              value={tableId} 
              onValueChange={setTableId}
            >
              <SelectTrigger id="table-id" className="mt-1">
                <SelectValue placeholder="Select table or takeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="takeout">Takeout (no table)</SelectItem>
                {tables?.map(table => (
                  <SelectItem key={table.id} value={table.id}>
                    {table.name} ({table.capacity} seats)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Menu Items */}
          <div className="border rounded-md overflow-hidden">
            <div className="bg-muted p-2 font-medium">Menu</div>
            <ScrollArea className="h-[300px]">
              <div className="p-2">
                {categories.map(categoryId => (
                  <div key={categoryId} className="mb-4">
                    <h4 className="font-medium mb-2 capitalize">{categoryId}</h4>
                    <div className="space-y-2">
                      {getMenuItemsByCategory(categoryId).map(item => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-muted/50 cursor-pointer"
                          onClick={() => addItemToOrder(item.id, item.name, item.price)}
                        >
                          <div>
                            <div className="font-medium">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {item.description?.substring(0, 30)}...
                            </div>
                          </div>
                          <div className="font-medium">${item.price.toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          
          {/* Current Order */}
          <div className="border rounded-md overflow-hidden flex flex-col">
            <div className="bg-muted p-2 font-medium">Current Order</div>
            <ScrollArea className="flex-1">
              <div className="p-2">
                {orderItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No items added yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {orderItems.map(item => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center justify-between rounded-md border p-2 text-sm"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">
                            ${item.price.toFixed(2)} x {item.quantity}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeItemFromOrder(item.menuItemId)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => addItemToOrder(item.menuItemId, item.name, item.price)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => setOrderItems(orderItems.filter(i => i.menuItemId !== item.menuItemId))}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="border-t p-2">
              <div className="flex justify-between font-medium mb-2">
                <span>Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
              
              <Button
                className="w-full"
                disabled={orderItems.length === 0}
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
