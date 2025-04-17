
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PopularItem } from "@/types";

interface PopularItemsProps {
  items: PopularItem[];
  isLoading?: boolean;
}

export function PopularItems({ items, isLoading = false }: PopularItemsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        No sales data available for the selected period.
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Item</TableHead>
            <TableHead className="text-center">Quantity</TableHead>
            <TableHead className="text-center">Price</TableHead>
            <TableHead className="text-right">Revenue</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={item.itemId}>
              <TableCell className="font-medium">
                {index + 1}. {item.name}
              </TableCell>
              <TableCell className="text-center">{item.count}</TableCell>
              <TableCell className="text-center">
                ${(item.revenue / item.count).toFixed(2)}
              </TableCell>
              <TableCell className="text-right font-medium">
                ${item.revenue.toFixed(2)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
