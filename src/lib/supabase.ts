import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface DatabaseOrder {
  id: string
  customer_name: string
  customer_mobile: string
  room_number: string
  items: any[]
  total: number
  status: 'preparing' | 'on-the-way' | 'delivered'
  payment_method: string
  created_at: string
}