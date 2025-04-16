
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PopularItem } from "@/types";

interface PopularItemsProps {
  items: PopularItem[];
}

export function PopularItems({ items }: PopularItemsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Popular Items</CardTitle>
        <CardDescription>Top selling menu items this week</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={item.itemId} className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 dark:bg-primary/20">
                <span className="text-sm font-medium text-primary">
                  {index + 1}
                </span>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium leading-none">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Sold {item.count} times
                </p>
              </div>
              <div className="font-medium">${item.revenue.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
