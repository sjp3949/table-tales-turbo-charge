
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { InventoryItemCard } from '@/components/inventory/InventoryItem';
import { InventoryTransactionList } from '@/components/inventory/InventoryTransactions';
import { AddInventoryItemDialog } from '@/components/inventory/AddInventoryItemDialog';
import { useInventory } from '@/hooks/useInventory';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlusCircle, 
  Search, 
  AlertTriangle, 
  Clock, 
  BarChart
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Inventory() {
  const { 
    inventory, 
    isLoading, 
    transactions,
    isLoadingTransactions,
    updateInventoryItem,
    generateInventoryReport
  } = useInventory();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('items');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  // Filter inventory items
  const filteredItems = inventory?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'low-stock' && item.quantity <= item.threshold);
    
    return matchesSearch && matchesFilter;
  }) ?? [];
  
  // Count low stock items
  const lowStockCount = inventory?.filter(
    item => item.quantity <= item.threshold
  ).length ?? 0;

  // Calculate inventory statistics
  const totalItems = inventory?.length ?? 0;
  const totalValue = inventory?.reduce(
    (sum, item) => sum + (item.quantity * item.cost), 0
  ) ?? 0;

  // Handle report generation
  const handleGenerateReport = async (reportType: 'daily' | 'weekly' | 'monthly') => {
    setIsGeneratingReport(true);
    try {
      await generateInventoryReport.mutateAsync(reportType);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your restaurant inventory and stock levels
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Item
            </Button>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <BarChart className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generate Inventory Report</DialogTitle>
                  <DialogDescription>
                    Create a snapshot of your current inventory status
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Total Items</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Inventory Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Low Stock Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{lowStockCount}</div>
                      {lowStockCount > 0 && (
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                          {lowStockCount} item{lowStockCount !== 1 ? 's' : ''} below threshold
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <DialogFooter className="gap-2 mt-4">
                  <Button
                    onClick={() => handleGenerateReport('daily')}
                    disabled={isGeneratingReport}
                  >
                    Daily Report
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport('weekly')}
                    disabled={isGeneratingReport}
                  >
                    Weekly Report
                  </Button>
                  <Button
                    onClick={() => handleGenerateReport('monthly')}
                    disabled={isGeneratingReport}
                    variant="outline"
                  >
                    Monthly Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Add Inventory Item Dialog */}
        <AddInventoryItemDialog 
          isOpen={isAddDialogOpen} 
          onClose={() => setIsAddDialogOpen(false)} 
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="items">Inventory Items</TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center">
              Transaction History
              <Clock className="h-4 w-4 ml-2" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-4 mt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search inventory..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                value={activeFilter} 
                onValueChange={setActiveFilter}
                className="w-full"
              >
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="low-stock" className="flex items-center">
                    Low Stock
                    {lowStockCount > 0 && (
                      <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-400">
                        {lowStockCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No inventory items found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredItems.map(item => (
                  <InventoryItemCard
                    key={item.id}
                    item={item}
                    onSave={updateInventoryItem.mutate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-6">
            <InventoryTransactionList 
              transactions={transactions || []}
              isLoading={isLoadingTransactions}
            />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
