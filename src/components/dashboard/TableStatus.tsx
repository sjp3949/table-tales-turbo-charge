
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TableStatusProps {
  occupied: number;
  total: number;
}

export function TableStatus({ occupied, total }: TableStatusProps) {
  // Calculate percentage safely to avoid NaN
  const percentage = total > 0 ? (occupied / total) * 100 : 0;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Table Status</CardTitle>
        <CardDescription>Current table occupancy</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Occupancy</span>
            <span className="text-sm font-medium">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Occupied</span>
              <span className="text-lg font-bold">{occupied}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Available</span>
              <span className="text-lg font-bold">{total - occupied}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-lg font-bold">{total}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
