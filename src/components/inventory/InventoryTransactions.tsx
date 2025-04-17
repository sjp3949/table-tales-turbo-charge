
import { useState } from 'react';
import { InventoryTransaction } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ArrowUpCircle, ArrowDownCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface InventoryTransactionListProps {
  transactions: InventoryTransaction[];
  isLoading: boolean;
}

export function InventoryTransactionList({ transactions, isLoading }: InventoryTransactionListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => 
    transaction.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.transactionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (transaction.notes && transaction.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Transaction History</h2>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No transactions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map(transaction => (
            <Card key={transaction.id}>
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-base">{transaction.itemName}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {transaction.createdAt.toLocaleString()}
                  </span>
                </div>
                <TransactionTypeBadge type={transaction.transactionType} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {transaction.transactionType === 'restock' ? (
                    <ArrowUpCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <ArrowDownCircle className="h-5 w-5 text-amber-500" />
                  )}
                  <span>
                    <span className="font-medium">{transaction.previousQuantity}</span>
                    {' → '}
                    <span className="font-bold">{transaction.newQuantity}</span>
                  </span>
                  <span className="text-muted-foreground">
                    ({transaction.transactionType === 'restock' ? '+' : '-'}
                    {Math.abs(transaction.newQuantity - transaction.previousQuantity)})
                  </span>
                </div>
                {transaction.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {transaction.notes}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function TransactionTypeBadge({ type }: { type: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize",
        type === 'restock' && "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
        type === 'usage' && "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
        type === 'adjustment' && "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
      )}
    >
      {type}
    </Badge>
  );
}
