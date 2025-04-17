import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Check, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useSettings } from '@/hooks/useSettings';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const { settings, isLoading, updateSettings } = useSettings();
  
  const [restaurantName, setRestaurantName] = useState('Restaurant Pro');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for dining with us!');
  const [taxRate, setTaxRate] = useState('8.25');
  const [serviceCharge, setServiceCharge] = useState('0');
  const [requireCustomerDetails, setRequireCustomerDetails] = useState(false);
  const [notifications, setNotifications] = useState({
    newOrder: true,
    lowInventory: true,
    dailySummary: false,
  });
  
  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurantName || 'Restaurant Pro');
      setReceiptFooter(settings.receiptFooter || 'Thank you for dining with us!');
      setTaxRate(settings.taxRate?.toString() || '8.25');
      setServiceCharge(settings.serviceCharge?.toString() || '0');
      setRequireCustomerDetails(settings.requireCustomerDetails || false);
      setNotifications({
        newOrder: settings.notifications?.newOrder ?? true,
        lowInventory: settings.notifications?.lowInventory ?? true,
        dailySummary: settings.notifications?.dailySummary ?? false,
      });
    }
  }, [settings]);
  
  const handleSaveGeneral = async () => {
    try {
      await updateSettings.mutateAsync({
        restaurantName,
        receiptFooter,
        taxRate: parseFloat(taxRate),
        serviceCharge: parseFloat(serviceCharge),
        requireCustomerDetails,
      });
      
      toast({
        title: "Settings saved",
        description: "General settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem updating settings",
        variant: "destructive"
      });
    }
  };
  
  const handleSaveNotifications = async () => {
    try {
      await updateSettings.mutateAsync({
        notifications
      });
      
      toast({
        title: "Settings saved",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving settings",
        description: "There was a problem updating settings",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your restaurant management system
          </p>
        </div>
        
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="backup" className="hidden sm:block">Backup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure basic information about your restaurant
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="restaurant-name">Restaurant Name</Label>
                  <Input
                    id="restaurant-name"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="receipt-footer">Receipt Footer</Label>
                  <Input
                    id="receipt-footer"
                    value={receiptFooter}
                    onChange={(e) => setReceiptFooter(e.target.value)}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="service-charge">Service Charge (%)</Label>
                  <Input
                    id="service-charge"
                    type="number"
                    step="0.01"
                    value={serviceCharge}
                    onChange={(e) => setServiceCharge(e.target.value)}
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-customer">Require Customer Details</Label>
                    <p className="text-sm text-muted-foreground">
                      Make customer information mandatory when creating orders
                    </p>
                  </div>
                  <Switch
                    id="require-customer"
                    checked={requireCustomerDetails}
                    onCheckedChange={setRequireCustomerDetails}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveGeneral}>Save Changes</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Restaurant Information</CardTitle>
                <CardDescription>
                  Update your restaurant's address and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    defaultValue="123 Restaurant Street, City"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      defaultValue="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue="contact@restaurantpro.com"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Customize when and how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-order">New Order Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts when new orders are placed
                      </p>
                    </div>
                    <Switch
                      id="new-order"
                      checked={notifications.newOrder}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, newOrder: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="low-inventory">Low Inventory Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when inventory items are running low
                      </p>
                    </div>
                    <Switch
                      id="low-inventory"
                      checked={notifications.lowInventory}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, lowInventory: checked })
                      }
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="daily-summary">Daily Summary Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive a daily summary of sales and performance
                      </p>
                    </div>
                    <Switch
                      id="daily-summary"
                      checked={notifications.dailySummary}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, dailySummary: checked })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveNotifications}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Add and manage staff accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-12 border-b p-3 text-sm font-medium">
                    <div className="col-span-5">Name</div>
                    <div className="col-span-4">Role</div>
                    <div className="col-span-3 text-right">Actions</div>
                  </div>
                  
                  {/* Sample users */}
                  <div className="grid grid-cols-12 border-b p-3 text-sm">
                    <div className="col-span-5 font-medium">Admin User</div>
                    <div className="col-span-4">Administrator</div>
                    <div className="col-span-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 border-b p-3 text-sm">
                    <div className="col-span-5 font-medium">John Smith</div>
                    <div className="col-span-4">Manager</div>
                    <div className="col-span-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Edit
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-12 p-3 text-sm">
                    <div className="col-span-5 font-medium">Sarah Johnson</div>
                    <div className="col-span-4">Cashier</div>
                    <div className="col-span-3 text-right">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Add New User</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Backup & Restore</CardTitle>
                <CardDescription>
                  Manage your data backups and restore options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border p-4">
                  <h3 className="font-medium mb-2">Last Backup</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    May 15, 2023 - 10:30 AM (Automatic)
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline">Create New Backup</Button>
                    <Button variant="outline">Restore from Backup</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backups</Label>
                      <p className="text-sm text-muted-foreground">
                        Create daily backups of your data
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
