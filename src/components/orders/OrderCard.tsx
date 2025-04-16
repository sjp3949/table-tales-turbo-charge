
import { Order } from '@/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  ClipboardList, 
  Clock, 
  CreditCard, 
  Printer,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderCardProps {
  order: Order;
  onViewDetails: (order: Order) => void;
  onUpdateStatus: (order: Order, status: Order['status']) => void;
}

export function OrderCard({ order, onViewDetails, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'served':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };
  
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    switch (currentStatus) {
      case 'pending':
        return 'preparing';
      case 'preparing':
        return 'ready';
      case 'ready':
        return 'served';
      case 'served':
        return 'completed';
      default:
        return null;
    }
  };
  
  const nextStatus = getNextStatus(order.status);
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>
              {order.tableId ? `Table ${order.tableId.replace('table', '')}` : 'Takeout Order'}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {order.customerName || 'No customer name'}
            </div>
          </div>
          <Badge className={cn(getStatusColor(order.status))}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-0">
        <div className="space-y-1 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>Order time: {formatTime(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
            <span>{order.items.length} items</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <span>Total: ${order.total.toFixed(2)}</span>
          </div>
        </div>
        
        <Separator className="my-2" />
        
        <div className="max-h-32 overflow-y-auto text-sm">
          <ul className="space-y-1">
            {order.items.slice(0, 3).map(item => (
              <li key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
            {order.items.length > 3 && (
              <li className="text-muted-foreground text-xs text-center pt-1">
                +{order.items.length - 3} more items
              </li>
            )}
          </ul>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between mt-4">
        <Button variant="outline" size="sm" onClick={() => onViewDetails(order)}>
          <Printer className="h-4 w-4 mr-1" /> 
          Details
        </Button>
        
        {nextStatus && (
          <Button 
            size="sm" 
            onClick={() => onUpdateStatus(order, nextStatus)}
            className="space-x-1"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>
              {nextStatus === 'preparing' && 'Start Preparing'}
              {nextStatus === 'ready' && 'Mark Ready'}
              {nextStatus === 'served' && 'Mark Served'}
              {nextStatus === 'completed' && 'Complete'}
            </span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
