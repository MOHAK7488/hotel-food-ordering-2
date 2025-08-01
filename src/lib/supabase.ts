import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database Types
export interface MenuItem {
  id: number
  name: string
  price: number
  description: string
  category: string
  veg: boolean
  image: string
  popular?: boolean
  spicy?: boolean
  disabled?: boolean
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: number
  name: string
  quantity: number
  price: number
  veg: boolean
}

export interface CustomerDetails {
  name: string
  mobile: string
  room_number: string
}

export interface Order {
  id: string
  items: OrderItem[]
  customer_details: CustomerDetails
  total: number
  timestamp: string
  status: 'new' | 'preparing' | 'ready' | 'delivered'
  payment_method: string
  bill_paid?: boolean
}

export interface RoomBill {
  id: string
  room_number: string
  customer_name: string
  customer_mobile: string
  total_amount: number
  is_paid: boolean
  created_at: string
  updated_at: string
}

// Database Functions
export const menuService = {
  // Get all menu items
  async getMenuItems(): Promise<MenuItem[]> {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Add new menu item
  async addMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update menu item
  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Delete menu item
  async deleteMenuItem(id: number): Promise<void> {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // Toggle menu item status
  async toggleMenuItemStatus(id: number, disabled: boolean): Promise<MenuItem> {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ disabled, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

export const orderService = {
  // Get all orders
  async getOrders(): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create new order
  async createOrder(order: Omit<Order, 'id'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get orders by mobile number
  async getOrdersByMobile(mobile: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_details->>mobile', mobile)
      .order('timestamp', { ascending: false })
    
    if (error) throw error
    return data || []
  }
}

export const billingService = {
  // Get all room bills
  async getRoomBills(): Promise<RoomBill[]> {
    const { data, error } = await supabase
      .from('room_bills')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  },

  // Create or update room bill
  async upsertRoomBill(bill: Omit<RoomBill, 'created_at' | 'updated_at'>): Promise<RoomBill> {
    const { data, error } = await supabase
      .from('room_bills')
      .upsert([bill])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Update bill payment status
  async updateBillPaymentStatus(id: string, isPaid: boolean): Promise<RoomBill> {
    const { data, error } = await supabase
      .from('room_bills')
      .update({ is_paid: isPaid, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to menu changes
  subscribeToMenuChanges(callback: (payload: any) => void) {
    return supabase
      .channel('menu_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, callback)
      .subscribe()
  },

  // Subscribe to new orders
  subscribeToNewOrders(callback: (payload: any) => void) {
    return supabase
      .channel('new_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, callback)
      .subscribe()
  },

  // Subscribe to order status changes
  subscribeToOrderUpdates(callback: (payload: any) => void) {
    return supabase
      .channel('order_updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, callback)
      .subscribe()
  }
}