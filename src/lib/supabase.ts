import { createClient } from '@supabase/supabase-js'

// Supabase configuration with fallback for production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Create Supabase client only if environment variables are available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
// Database types
export interface MenuItem {
  id: string
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

export interface Order {
  id: string
  customer_name: string
  customer_mobile: string
  room_number: string
  total: number
  status: 'new' | 'preparing' | 'ready' | 'delivered'
  payment_method: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  menu_item_name: string
  quantity: number
  price: number
  veg: boolean
  created_at?: string
}

export interface RoomBill {
  id: string
  bill_id: string
  room_number: string
  customer_name: string
  customer_mobile: string
  total_amount: number
  is_paid: boolean
  created_at?: string
  updated_at?: string
}

// Menu Items API
export const menuItemsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('menu_items')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })
    
    if (error) throw error
    return data as MenuItem[]
  },

  async create(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('menu_items')
      .insert([item])
      .select()
      .single()
    
    if (error) throw error
    return data as MenuItem
  },

  async update(id: string, updates: Partial<MenuItem>) {
    const { data, error } = await supabase
      .from('menu_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data as MenuItem
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('menu_items')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Orders API
export const ordersAPI = {
  async getAll() {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (ordersError) throw ordersError

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
    
    if (itemsError) throw itemsError

    // Combine orders with their items
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }))

    return ordersWithItems
  },

  async create(order: Omit<Order, 'created_at' | 'updated_at'>, items: Omit<OrderItem, 'id' | 'order_id' | 'created_at'>[]) {
    // Insert order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([order])
      .select()
      .single()
    
    if (orderError) throw orderError

    // Insert order items
    const orderItemsData = items.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsData)
      .select()
    
    if (itemsError) throw itemsError

    return { order: orderData, items: itemsData }
  },

  async updateStatus(orderId: string, status: Order['status']) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', orderId)
      .select()
      .single()
    
    if (error) throw error
    return data as Order
  },

  async getByMobile(mobile: string) {
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_mobile', mobile)
      .order('created_at', { ascending: false })
    
    if (ordersError) throw ordersError

    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orders.map(o => o.id))
    
    if (itemsError) throw itemsError

    // Combine orders with their items
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: orderItems.filter(item => item.order_id === order.id)
    }))

    return ordersWithItems
  }
}

// Room Bills API
export const roomBillsAPI = {
  async getAll() {
    const { data, error } = await supabase
      .from('room_bills')
      .select('*')
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data as RoomBill[]
  },

  async upsert(bill: Omit<RoomBill, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('room_bills')
      .upsert([bill], { onConflict: 'bill_id' })
      .select()
      .single()
    
    if (error) throw error
    return data as RoomBill
  },

  async updatePaymentStatus(billId: string, isPaid: boolean) {
    const { data, error } = await supabase
      .from('room_bills')
      .update({ is_paid: isPaid, updated_at: new Date().toISOString() })
      .eq('bill_id', billId)
      .select()
      .single()
    
    if (error) throw error
    return data as RoomBill
  }
}

// Real-time subscriptions
export const subscribeToOrders = (callback: (payload: any) => void) => {
  return supabase
    .channel('orders_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, callback)
    .subscribe()
}

export const subscribeToMenuItems = (callback: (payload: any) => void) => {
  return supabase
    .channel('menu_items_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, callback)
    .subscribe()
}

export const subscribeToRoomBills = (callback: (payload: any) => void) => {
  return supabase
    .channel('room_bills_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'room_bills' }, callback)
    .subscribe()
}