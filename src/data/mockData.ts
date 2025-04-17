
import { MenuItem, MenuCategory, Table, TableSection, Order, InventoryItem, DashboardStats } from '@/types';

// Mock Menu Categories
export const mockCategories: MenuCategory[] = [
  { id: 'cat1', name: 'Appetizers', orderIndex: 0 },
  { id: 'cat2', name: 'Main Course', orderIndex: 1 },
  { id: 'cat3', name: 'Desserts', orderIndex: 2 },
  { id: 'cat4', name: 'Beverages', orderIndex: 3 },
  { id: 'cat5', name: 'Sides', orderIndex: 4 },
];

// Mock Menu Items
export const mockMenuItems: MenuItem[] = [
  // Appetizers
  {
    id: 'item1',
    name: 'Crispy Spring Rolls',
    price: 7.99,
    description: 'Vegetable filled spring rolls served with sweet chili sauce',
    categoryId: 'cat1',
    available: true,
  },
  {
    id: 'item2',
    name: 'Garlic Bread',
    price: 5.99,
    description: 'Toasted bread with garlic butter and herbs',
    categoryId: 'cat1',
    available: true,
  },
  {
    id: 'item3',
    name: 'Chicken Wings',
    price: 9.99,
    description: 'Spicy buffalo wings served with blue cheese dip',
    categoryId: 'cat1',
    available: true,
  },
  
  // Main Course
  {
    id: 'item4',
    name: 'Grilled Salmon',
    price: 18.99,
    description: 'Fresh salmon fillet served with seasonal vegetables',
    categoryId: 'cat2',
    available: true,
  },
  {
    id: 'item5',
    name: 'Chicken Alfredo',
    price: 16.99,
    description: 'Fettuccine pasta with creamy alfredo sauce and grilled chicken',
    categoryId: 'cat2',
    available: true,
  },
  {
    id: 'item6',
    name: 'Veggie Burger',
    price: 14.99,
    description: 'Plant-based patty with lettuce, tomato and special sauce',
    categoryId: 'cat2',
    available: true,
  },
  
  // Desserts
  {
    id: 'item7',
    name: 'Chocolate Lava Cake',
    price: 8.99,
    description: 'Warm chocolate cake with molten center, served with ice cream',
    categoryId: 'cat3',
    available: true,
  },
  {
    id: 'item8',
    name: 'New York Cheesecake',
    price: 7.99,
    description: 'Classic cheesecake with berry compote',
    categoryId: 'cat3',
    available: true,
  },
  
  // Beverages
  {
    id: 'item9',
    name: 'Fresh Lemonade',
    price: 3.99,
    description: 'Freshly squeezed lemonade with mint',
    categoryId: 'cat4',
    available: true,
  },
  {
    id: 'item10',
    name: 'Iced Tea',
    price: 2.99,
    description: 'House-brewed iced tea with lemon',
    categoryId: 'cat4',
    available: true,
  },
  
  // Sides
  {
    id: 'item11',
    name: 'French Fries',
    price: 4.99,
    description: 'Crispy golden fries with sea salt',
    categoryId: 'cat5',
    available: true,
  },
  {
    id: 'item12',
    name: 'Side Salad',
    price: 5.99,
    description: 'Fresh mixed greens with house dressing',
    categoryId: 'cat5',
    available: true,
  },
];

// Mock Table Sections
export const mockTableSections: TableSection[] = [
  {
    id: 'section1',
    name: 'Main Dining Area',
    tables: [
      { id: 'table1', name: 'Table 1', section: 'Main Dining Area', sectionId: 'section1', sectionName: 'Main Dining Area', capacity: 4, status: 'available', positionX: 100, positionY: 100 },
      { id: 'table2', name: 'Table 2', section: 'Main Dining Area', sectionId: 'section1', sectionName: 'Main Dining Area', capacity: 2, status: 'occupied', positionX: 250, positionY: 100, orderId: 'order1' },
      { id: 'table3', name: 'Table 3', section: 'Main Dining Area', sectionId: 'section1', sectionName: 'Main Dining Area', capacity: 6, status: 'reserved', positionX: 400, positionY: 100 },
      { id: 'table4', name: 'Table 4', section: 'Main Dining Area', sectionId: 'section1', sectionName: 'Main Dining Area', capacity: 4, status: 'available', positionX: 100, positionY: 250 },
      { id: 'table5', name: 'Table 5', section: 'Main Dining Area', sectionId: 'section1', sectionName: 'Main Dining Area', capacity: 4, status: 'available', positionX: 250, positionY: 250 },
    ]
  },
  {
    id: 'section2',
    name: 'Outdoor Patio',
    tables: [
      { id: 'table6', name: 'Table 6', section: 'Outdoor Patio', sectionId: 'section2', sectionName: 'Outdoor Patio', capacity: 2, status: 'available', positionX: 100, positionY: 100 },
      { id: 'table7', name: 'Table 7', section: 'Outdoor Patio', sectionId: 'section2', sectionName: 'Outdoor Patio', capacity: 2, status: 'occupied', positionX: 250, positionY: 100, orderId: 'order2' },
      { id: 'table8', name: 'Table 8', section: 'Outdoor Patio', sectionId: 'section2', sectionName: 'Outdoor Patio', capacity: 4, status: 'available', positionX: 400, positionY: 100 },
    ]
  },
  {
    id: 'section3',
    name: 'Private Room',
    tables: [
      { id: 'table9', name: 'Table 9', section: 'Private Room', sectionId: 'section3', sectionName: 'Private Room', capacity: 8, status: 'available', positionX: 150, positionY: 150 },
      { id: 'table10', name: 'Table 10', section: 'Private Room', sectionId: 'section3', sectionName: 'Private Room', capacity: 10, status: 'reserved', positionX: 350, positionY: 150 },
    ]
  }
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: 'order1',
    tableId: 'table2',
    customerName: 'John Smith',
    items: [
      { id: 'oi1', menuItemId: 'item1', name: 'Crispy Spring Rolls', price: 7.99, quantity: 1 },
      { id: 'oi2', menuItemId: 'item5', name: 'Chicken Alfredo', price: 16.99, quantity: 2 },
      { id: 'oi3', menuItemId: 'item9', name: 'Fresh Lemonade', price: 3.99, quantity: 2 },
    ],
    status: 'served',
    createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    updatedAt: new Date(Date.now() - 1800000), // 30 mins ago
    total: 49.95,
  },
  {
    id: 'order2',
    tableId: 'table7',
    customerName: 'Sarah Johnson',
    items: [
      { id: 'oi4', menuItemId: 'item3', name: 'Chicken Wings', price: 9.99, quantity: 1 },
      { id: 'oi5', menuItemId: 'item6', name: 'Veggie Burger', price: 14.99, quantity: 1 },
      { id: 'oi6', menuItemId: 'item10', name: 'Iced Tea', price: 2.99, quantity: 2 },
    ],
    status: 'preparing',
    createdAt: new Date(Date.now() - 1800000), // 30 mins ago
    updatedAt: new Date(Date.now() - 900000), // 15 mins ago
    total: 30.96,
  },
  {
    id: 'order3',
    customerName: 'Takeout #42',
    items: [
      { id: 'oi7', menuItemId: 'item4', name: 'Grilled Salmon', price: 18.99, quantity: 1 },
      { id: 'oi8', menuItemId: 'item12', name: 'Side Salad', price: 5.99, quantity: 1 },
    ],
    status: 'ready',
    createdAt: new Date(Date.now() - 2700000), // 45 mins ago
    updatedAt: new Date(Date.now() - 300000), // 5 mins ago
    total: 24.98,
  }
];

// Mock Inventory Items
export const mockInventoryItems: InventoryItem[] = [
  { id: 'inv1', name: 'Chicken Breast', quantity: 20, unit: 'kg', threshold: 5, cost: 8.99 },
  { id: 'inv2', name: 'Salmon Fillet', quantity: 15, unit: 'kg', threshold: 3, cost: 12.99 },
  { id: 'inv3', name: 'Pasta', quantity: 25, unit: 'kg', threshold: 5, cost: 2.99 },
  { id: 'inv4', name: 'Rice', quantity: 30, unit: 'kg', threshold: 8, cost: 1.99 },
  { id: 'inv5', name: 'Flour', quantity: 15, unit: 'kg', threshold: 5, cost: 0.99 },
  { id: 'inv6', name: 'Sugar', quantity: 10, unit: 'kg', threshold: 3, cost: 1.29 },
  { id: 'inv7', name: 'Vegetable Oil', quantity: 12, unit: 'liter', threshold: 3, cost: 3.99 },
  { id: 'inv8', name: 'Milk', quantity: 20, unit: 'liter', threshold: 5, cost: 2.49 },
  { id: 'inv9', name: 'Potatoes', quantity: 25, unit: 'kg', threshold: 7, cost: 1.79 },
  { id: 'inv10', name: 'Tomatoes', quantity: 18, unit: 'kg', threshold: 5, cost: 2.99 },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalSalesToday: 923.45,
  totalOrdersToday: 42,
  averageOrderValue: 22.00,
  tablesOccupied: 7,
  totalTables: 15,
  salesByDay: [
    { date: '2023-05-01', total: 876.50 },
    { date: '2023-05-02', total: 923.45 },
    { date: '2023-05-03', total: 781.20 },
    { date: '2023-05-04', total: 1045.75 },
    { date: '2023-05-05', total: 1287.30 },
    { date: '2023-05-06', total: 1458.90 },
    { date: '2023-05-07', total: 985.40 },
  ],
  popularItems: [
    { itemId: 'item5', name: 'Chicken Alfredo', count: 37, revenue: 628.63 },
    { itemId: 'item4', name: 'Grilled Salmon', count: 28, revenue: 531.72 },
    { itemId: 'item7', name: 'Chocolate Lava Cake', count: 25, revenue: 224.75 },
    { itemId: 'item1', name: 'Crispy Spring Rolls', count: 22, revenue: 175.78 },
    { itemId: 'item9', name: 'Fresh Lemonade', count: 45, revenue: 179.55 },
  ]
};
