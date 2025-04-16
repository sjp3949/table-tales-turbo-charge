import { useState } from 'react';
import { Table } from '@/types';
import { useOrders } from '@/hooks/useOrders';
import { mockMenuItems, mockOrders } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, Trash, Plus, Minus, Printer } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TableActionDialogProps {
  table: Table | null;
  open: boolean;
  onClose: () => void;
}

export function TableActionDialog({ table, open, onClose }: TableActionDialogProps) {
  const [activeTab, setActiveTab] = useState('order');
  const [orderItems, setOrderItems] = useState<{
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[]>([]);
  const [customerName, setCustomerName] = useState('');
  
  const { createOrder } = useOrders();
  
  const categories = Array.from(
    new Set(mockMenuItems.map(item => item.categoryId))
  );
  
  const getMenuItemsByCategory = (categoryId: string) => {
    return mockMenuItems.filter(item => item.categoryId === categoryId);
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
    if (!table) return;
    
    try {
      await createOrder.mutateAsync({
        tableId: table.id,
        customerName: customerName || undefined,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.price
        }))
      });
      
      setOrderItems([]);
      setCustomerName('');
      onClose();
    } catch (error) {
      console.error('Error creating order:', error);
    }
  };
  
  if (!table) return null;
  
  const existingOrder = mockOrders.find(order => order.tableId === table.id);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {table.name} - {table.capacity} Seats
            <span className={cn(
              "ml-2 inline-block px-2 py-1 text-xs rounded-full",
              table.status === 'available' && 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
              table.status === 'occupied' && 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
              table.status === 'reserved' && 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
            )}>
              {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
            </span>
          </DialogTitle>
          <DialogDescription>
            Manage orders and reservations for this table
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="order">Order</TabsTrigger>
            <TabsTrigger value="info">Table Info</TabsTrigger>
          </TabsList>
          
          <TabsContent value="order" className="flex-1 flex flex-col">
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
              
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted p-2 font-medium">Menu</div>
                <ScrollArea className="h-[300px]">
                  <div className="p-2">
                    {categories.map(categoryId => {
                      const categoryItems = getMenuItemsByCategory(categoryId);
                      const categoryName = mockMenuItems
                        .find(item => item.categoryId === categoryId)?.categoryId || categoryId;
                      
                      return (
                        <div key={categoryId} className="mb-4">
                          <h4 className="font-medium mb-2">
                            {categoryName === 'cat1' ? 'Appetizers' : 
                             categoryName === 'cat2' ? 'Main Course' :
                             categoryName === 'cat3' ? 'Desserts' :
                             categoryName === 'cat4' ? 'Beverages' : 'Other'}
                          </h4>
                          <div className="space-y-2">
                            {categoryItems.map(item => (
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
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
              
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
                  
                  <div className="flex space-x-2">
                    <Button
                      className="flex-1"
                      disabled={orderItems.length === 0}
                      onClick={handlePlaceOrder}
                    >
                      Place Order
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="flex-1"
                      disabled={orderItems.length === 0}
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Print
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="info" className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="table-name">Table Name</Label>
                  <Input id="table-name" value={table.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="table-capacity">Capacity</Label>
                  <Input id="table-capacity" type="number" value={table.capacity} readOnly />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="table-section">Section</Label>
                <Input id="table-section" value={table.section} readOnly />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="table-status">Status</Label>
                <div className="flex space-x-2">
                  <Button 
                    variant={table.status === 'available' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    Available
                  </Button>
                  <Button 
                    variant={table.status === 'occupied' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    Occupied
                  </Button>
                  <Button 
                    variant={table.status === 'reserved' ? 'default' : 'outline'}
                    className="flex-1"
                  >
                    Reserved
                  </Button>
                </div>
              </div>
              
              {existingOrder && (
                <div className="border rounded-md p-3 mt-4">
                  <h4 className="font-medium mb-2">Current Order</h4>
                  <div className="space-y-1 text-sm">
                    {existingOrder.items.map(item => (
                      <div key={item.id} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator className="my-2" />
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${existingOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
