
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCustomers } from '@/hooks/useCustomers';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, Search, User, Phone, Mail, MapPin, FileText, Edit, Eye } from 'lucide-react';
import { Customer } from '@/types';
import { toast } from '@/hooks/use-toast';

export default function Customers() {
  const { customers, isLoading, updateCustomer } = useCustomers();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  
  // Form state for editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const handleViewCustomer = (customer: Customer) => {
    setViewCustomer(customer);
  };
  
  const handleEditCustomer = (customer: Customer) => {
    setEditCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
    setEditEmail(customer.email || '');
    setEditAddress(customer.address || '');
    setEditNotes(customer.notes || '');
  };
  
  const handleSaveCustomer = async () => {
    if (!editCustomer) return;
    
    try {
      await updateCustomer.mutateAsync({
        id: editCustomer.id,
        name: editName,
        phone: editPhone,
        email: editEmail || undefined,
        address: editAddress || undefined,
        notes: editNotes || undefined,
      });
      
      toast({
        title: "Customer updated",
        description: "Customer information has been updated successfully",
      });
      
      setEditCustomer(null);
    } catch (error) {
      toast({
        title: "Error updating customer",
        description: "There was a problem updating customer information",
        variant: "destructive"
      });
    }
  };
  
  // Filter customers based on search query
  const filteredCustomers = customers?.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery) ||
    (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your restaurant customers
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>
        
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input 
            placeholder="Search customers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" className="shrink-0">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : !filteredCustomers?.length ? (
          <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
            <User className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No customers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCustomers.map(customer => (
              <Card key={customer.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate">{customer.name}</span>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleViewCustomer(customer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditCustomer(customer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{customer.phone}</span>
                  </div>
                  
                  {customer.email && (
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  
                  <Separator className="my-2" />
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Orders:</span>
                    <span className="font-medium">{customer.totalOrders}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="font-medium">₹{customer.totalSpent.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* View Customer Dialog */}
      <Dialog open={!!viewCustomer} onOpenChange={(open) => !open && setViewCustomer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
          </DialogHeader>
          
          {viewCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium">{viewCustomer.name}</h3>
                </div>
                
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{viewCustomer.phone}</span>
                  </div>
                  
                  {viewCustomer.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span>{viewCustomer.email}</span>
                    </div>
                  )}
                  
                  {viewCustomer.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
                      <span>{viewCustomer.address}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Order History</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold">{viewCustomer.totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Total Orders</div>
                  </div>
                  <div className="border rounded-md p-3 text-center">
                    <div className="text-2xl font-bold">₹{viewCustomer.totalSpent.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Total Spent</div>
                  </div>
                </div>
              </div>
              
              {viewCustomer.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <h4 className="font-medium">Notes</h4>
                    </div>
                    <p className="text-sm">{viewCustomer.notes}</p>
                  </div>
                </>
              )}
              
              <div className="text-xs text-muted-foreground">
                Customer since: {viewCustomer.createdAt.toLocaleDateString()}
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewCustomer(null)}>Close</Button>
            <Button onClick={() => {
              if (viewCustomer) {
                handleEditCustomer(viewCustomer);
                setViewCustomer(null);
              }
            }}>
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Customer Dialog */}
      <Dialog open={!!editCustomer} onOpenChange={(open) => !open && setEditCustomer(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information
            </DialogDescription>
          </DialogHeader>
          
          {editCustomer && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes</Label>
                <Input
                  id="edit-notes"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCustomer(null)}>Cancel</Button>
            <Button onClick={handleSaveCustomer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
