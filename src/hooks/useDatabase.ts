import { useState, useEffect } from 'react'
import { supabase, menuService, orderService, billingService, subscriptions } from '../lib/supabase'
import type { MenuItem, Order, RoomBill } from '../lib/supabase'

// Custom hook for menu management
export const useMenuItems = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadMenuItems = async () => {
    try {
      setLoading(true)
      const items = await menuService.getMenuItems()
      setMenuItems(items)
      setError(null)
    } catch (err) {
      console.error('Error loading menu items:', err)
      setError('Failed to load menu items')
    } finally {
      setLoading(false)
    }
  }

  const addMenuItem = async (item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newItem = await menuService.addMenuItem(item)
      setMenuItems(prev => [newItem, ...prev])
      return newItem
    } catch (err) {
      console.error('Error adding menu item:', err)
      throw err
    }
  }

  const updateMenuItem = async (id: number, updates: Partial<MenuItem>) => {
    try {
      const updatedItem = await menuService.updateMenuItem(id, updates)
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      return updatedItem
    } catch (err) {
      console.error('Error updating menu item:', err)
      throw err
    }
  }

  const deleteMenuItem = async (id: number) => {
    try {
      await menuService.deleteMenuItem(id)
      setMenuItems(prev => prev.filter(item => item.id !== id))
    } catch (err) {
      console.error('Error deleting menu item:', err)
      throw err
    }
  }

  const toggleMenuItemStatus = async (id: number, disabled: boolean) => {
    try {
      const updatedItem = await menuService.toggleMenuItemStatus(id, disabled)
      setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item))
      return updatedItem
    } catch (err) {
      console.error('Error toggling menu item status:', err)
      throw err
    }
  }

  useEffect(() => {
    loadMenuItems()

    // Subscribe to real-time menu changes
    const subscription = subscriptions.subscribeToMenuChanges((payload) => {
      console.log('Menu change detected:', payload)
      loadMenuItems() // Reload menu items when changes occur
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return {
    menuItems,
    loading,
    error,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemStatus,
    refreshMenuItems: loadMenuItems
  }
}

// Custom hook for order management
export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const orderData = await orderService.getOrders()
      setOrders(orderData)
      setError(null)
    } catch (err) {
      console.error('Error loading orders:', err)
      setError('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const newOrder = await orderService.createOrder({
        ...order,
        id: Date.now().toString() // Generate unique ID
      })
      setOrders(prev => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      console.error('Error creating order:', err)
      throw err
    }
  }

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status)
      setOrders(prev => prev.map(order => order.id === id ? updatedOrder : order))
      return updatedOrder
    } catch (err) {
      console.error('Error updating order status:', err)
      throw err
    }
  }

  const getOrdersByMobile = async (mobile: string) => {
    try {
      return await orderService.getOrdersByMobile(mobile)
    } catch (err) {
      console.error('Error getting orders by mobile:', err)
      throw err
    }
  }

  useEffect(() => {
    loadOrders()

    // Subscribe to real-time order changes
    const newOrdersSubscription = subscriptions.subscribeToNewOrders((payload) => {
      console.log('New order detected:', payload)
      loadOrders() // Reload orders when new orders are created
    })

    const orderUpdatesSubscription = subscriptions.subscribeToOrderUpdates((payload) => {
      console.log('Order update detected:', payload)
      loadOrders() // Reload orders when orders are updated
    })

    return () => {
      newOrdersSubscription.unsubscribe()
      orderUpdatesSubscription.unsubscribe()
    }
  }, [])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrderStatus,
    getOrdersByMobile,
    refreshOrders: loadOrders
  }
}

// Custom hook for room billing
export const useRoomBills = () => {
  const [roomBills, setRoomBills] = useState<RoomBill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadRoomBills = async () => {
    try {
      setLoading(true)
      const bills = await billingService.getRoomBills()
      setRoomBills(bills)
      setError(null)
    } catch (err) {
      console.error('Error loading room bills:', err)
      setError('Failed to load room bills')
    } finally {
      setLoading(false)
    }
  }

  const upsertRoomBill = async (bill: Omit<RoomBill, 'created_at' | 'updated_at'>) => {
    try {
      const upsertedBill = await billingService.upsertRoomBill(bill)
      setRoomBills(prev => {
        const existingIndex = prev.findIndex(b => b.id === upsertedBill.id)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex] = upsertedBill
          return updated
        } else {
          return [upsertedBill, ...prev]
        }
      })
      return upsertedBill
    } catch (err) {
      console.error('Error upserting room bill:', err)
      throw err
    }
  }

  const updateBillPaymentStatus = async (id: string, isPaid: boolean) => {
    try {
      const updatedBill = await billingService.updateBillPaymentStatus(id, isPaid)
      setRoomBills(prev => prev.map(bill => bill.id === id ? updatedBill : bill))
      return updatedBill
    } catch (err) {
      console.error('Error updating bill payment status:', err)
      throw err
    }
  }

  useEffect(() => {
    loadRoomBills()
  }, [])

  return {
    roomBills,
    loading,
    error,
    upsertRoomBill,
    updateBillPaymentStatus,
    refreshRoomBills: loadRoomBills
  }
}

// Database connection status hook
export const useDatabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('menu_items').select('count').limit(1)
        setIsConnected(!error)
      } catch (err) {
        setIsConnected(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkConnection()
  }, [])

  return { isConnected, isLoading }
}