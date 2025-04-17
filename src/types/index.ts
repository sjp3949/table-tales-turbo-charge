
// Types for the restaurant management app

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  image?: string;
  available: boolean;
}

export interface MenuCategory {
  id: string;
  name: string;
  orderIndex: number;
}

export interface Table {
  id: string;
  name: string;
  section: string;
  sectionId: string;
  sectionName: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  positionX: number;
  positionY: number;
  orderId?: string;
}

export interface TableSection {
  id: string;
  name: string;
  tables: Table[];
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId?: string;
  customerName?: string;
  items: OrderItem[];
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  total: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  cost: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  itemName: string;
  previousQuantity: number;
  newQuantity: number;
  transactionType: string;
  notes?: string;
  createdAt: Date;
}

export interface InventoryReport {
  id: string;
  reportType: string;
  reportDate: Date;
  summary: {
    totalItems: number;
    lowStockCount: number;
    lowStockItems: Array<{
      id: string;
      name: string;
      quantity: number;
      threshold: number;
      unit: string;
    }>;
    totalValue: number;
    generatedAt: string;
  };
  createdAt: Date;
}

export interface RecipeIngredient {
  id: string;
  inventoryItemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  menuItemId: string;
  ingredients: RecipeIngredient[];
}

export interface DailySales {
  date: string;
  total: number;
}

export interface PopularItem {
  itemId: string;
  name: string;
  count: number;
  revenue: number;
}

export interface DashboardStats {
  totalSalesToday: number;
  totalOrdersToday: number;
  averageOrderValue: number;
  tablesOccupied: number;
  totalTables: number;
  salesByDay: DailySales[];
  popularItems: PopularItem[];
}
