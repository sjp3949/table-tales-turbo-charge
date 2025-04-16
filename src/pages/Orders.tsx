
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Order } from '@/types';
import { OrderCard } from '@/components/orders/OrderCard';
import { mockOrders } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Printer, AlertTriangle } from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [activeStatus, setActiveStatus] = useState('all');
  
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setViewDetailsOpen(true);
  };
  
  const handleUpdateStatus = (order: Order, newStatus: Order['status']) => {
    const updatedOrders = orders.map(o => 
      o.id === order.id
        ? { ...o, status: newStatus, updatedAt: new Date() }
        : o
    );
    setOrders(updatedOrders);
  };
  
  // Filter orders by status
  const filteredOrders = orders.filter(order => 
    activeStatus === 'all' || order.status === activeStatus
  );
  
  // Group active orders by status
  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage your restaurant orders
          </p>
        </div>
        
        <Tabs 
          value={activeStatus} 
          onValueChange={setActiveStatus}
          className="w-full"
        >
          <TabsList className="w-full sm:w-auto overflow-auto">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="preparing">Preparing</TabsTrigger>
            <TabsTrigger value="ready">Ready</TabsTrigger>
            <TabsTrigger value="served">Served</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
            <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onViewDetails={handleViewDetails}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
        )}
        
        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle className="flex justify-between items-center">
                  <span>
                    Order Details 
                    <span className="ml-2 text-sm text-muted-foreground">
                      #{selectedOrder.id}
                    </span>
                  </span>
                </DialogTitle>
                <DialogDescription>
                  {selectedOrder.tableId 
                    ? `Table ${selectedOrder.tableId.replace('table', '')}`
                    : 'Takeout Order'
                  }
                  {selectedOrder.customerName && ` - ${selectedOrder.customerName}`}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Time:</span>
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="capitalize">
                      {selectedOrder.status}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <ScrollArea className="max-h-52 overflow-auto">
                    <h4 className="font-medium mb-2">Order Items</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" className="w-full sm:w-auto">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Receipt
                </Button>
                <Button 
                  onClick={() => setViewDetailsOpen(false)} 
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </MainLayout>
  );
}
