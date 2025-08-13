import React, { useState, useEffect, useRef } from 'react';
import { 
  ChefHat, 
  Clock, 
  CheckCircle, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  Filter,
  Search,
  Bell,
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  AlertCircle,
  RefreshCw,
  Eye,
  X,
  LogOut,
  Shield,
  Volume2,
  VolumeX,
  CreditCard,
  Menu
} from 'lucide-react';
import { supabase, ordersAPI, subscribeToOrders, isSupabaseConfigured } from '../lib/supabase';
import RoomBilling from './RoomBilling';
import MenuManager from './MenuManager';

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  veg: boolean;
}

interface CustomerDetails {
  name: string;
  mobile: string;
  roomNumber: string;
}

interface RestaurantOrder {
  id: string;
  items: OrderItem[];
  customerDetails: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  paymentMethod: string;
  estimatedTime?: number;
  notes?: string;
}

interface RestaurantManagerProps {
  onLogout: () => void;
}

const RestaurantManager: React.FC<RestaurantManagerProps> = ({ onLogout }) => {
  const [orders, setOrders] = useState<RestaurantOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RestaurantOrder | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState<number>(0);
  const [sessionTimeLeft, setSessionTimeLeft] = useState<string>('');
  const [lastOrderCount, setLastOrderCount] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [newOrderAlert, setNewOrderAlert] = useState<boolean>(false);
  const [showRoomBilling, setShowRoomBilling] = useState<boolean>(false);
  const [showMenuManager, setShowMenuManager] = useState<boolean>(false);
  const [lastOrderIds, setLastOrderIds] = useState<Set<string>>(new Set());
  const [showNotificationPanel, setShowNotificationPanel] = useState<boolean>(false);
  const [notificationHistory, setNotificationHistory] = useState<Array<{
    id: string;
    message: string;
    timestamp: Date;
    type: 'new_order' | 'order_update';
    orderId: string;
    read: boolean;
  }>>([]);
  const [databaseConnected, setDatabaseConnected] = useState(false);
  
  // Audio context for notification sound
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        // Create audio context on user interaction
        const createAudioContext = () => {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
          }
        };

        // Add click listener to enable audio context
        document.addEventListener('click', createAudioContext, { once: true });
        document.addEventListener('touchstart', createAudioContext, { once: true });

        return () => {
          document.removeEventListener('click', createAudioContext);
          document.removeEventListener('touchstart', createAudioContext);
        };
      } catch (error) {
        console.log('Audio context not supported');
      }
    };

    const cleanup = initAudio();

    return () => {
      if (cleanup) cleanup();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = async () => {
    if (!soundEnabled) return;

    try {
      // Ensure audio context is created and resumed
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const context = audioContextRef.current;
      
      // Resume audio context if suspended
      if (context.state === 'suspended') {
        await context.resume();
      }

      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      // Create a pleasant notification sound (two-tone beep)
      oscillator.frequency.setValueAtTime(800, context.currentTime);
      oscillator.frequency.setValueAtTime(600, context.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, context.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.3);
    } catch (error) {
      console.log('Error playing notification sound:', error);
      
      // Fallback: Try to play a simple beep using the Web Audio API
      try {
        const context = new AudioContext();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
        
        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
      } catch (fallbackError) {
        console.log('Fallback audio also failed:', fallbackError);
      }
    }
  };

  // Add notification to history
  const addNotification = (message: string, type: 'new_order' | 'order_update', orderId: string) => {
    const newNotification = {
      id: Date.now().toString(),
      message,
      timestamp: new Date(),
      type,
      orderId,
      read: false
    };

    setNotificationHistory(prev => [newNotification, ...prev.slice(0, 49)]); // Keep last 50 notifications
  };

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setNotificationHistory(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  // Mark all notifications as read
  const markAllNotificationsAsRead = () => {
    setNotificationHistory(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
    setNotifications(0);
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotificationHistory([]);
    setNotifications(0);
  };

  // Check session validity and calculate remaining time
  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('managerLoginTime');
      if (!loginTime) {
        onLogout();
        return;
      }

      const currentTime = new Date().getTime();
      const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
      const elapsedTime = currentTime - parseInt(loginTime);
      const remainingTime = sessionDuration - elapsedTime;

      if (remainingTime <= 0) {
        // Session expired
        localStorage.removeItem('managerLoginTime');
        localStorage.removeItem('managerAuthenticated');
        onLogout();
        return;
      }

      // Calculate hours and minutes remaining
      const hoursLeft = Math.floor(remainingTime / (60 * 60 * 1000));
      const minutesLeft = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
      setSessionTimeLeft(`${hoursLeft}h ${minutesLeft}m`);
    };

    // Check session immediately
    checkSession();

    // Check session every minute
    const sessionInterval = setInterval(checkSession, 60000);

    return () => clearInterval(sessionInterval);
  }, [onLogout]);

  // Load orders from database/localStorage and listen for new orders with real-time updates
  useEffect(() => {
    const loadOrders = () => {
      try {
        const dbConnected = isSupabaseConfigured();
        setDatabaseConnected(dbConnected);
        console.log('Database connection status:', dbConnected);
        
        if (dbConnected) {
          console.log('Loading orders from Supabase database...');
          loadOrdersFromDatabase();
        } else {
          console.log('Loading orders from localStorage...');
          loadOrdersFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading orders:', error);
        loadOrdersFromLocalStorage();
      }
    };

    const loadOrdersFromDatabase = async () => {
      try {
        console.log('Attempting to load orders from database...');
        const dbOrders = await ordersAPI.getAll();
        console.log('Orders loaded from database:', dbOrders.length);
        
        const parsedOrders = dbOrders.map((order: any) => ({
          id: order.id,
          items: order.items.map((item: any) => ({
            id: parseInt(item.menu_item_id),
            name: item.menu_item_name,
            quantity: item.quantity,
            price: item.price,
            veg: item.veg
          })),
          customerDetails: {
            name: order.customer_name,
            mobile: order.customer_mobile,
            roomNumber: order.room_number
          },
          total: order.total,
          timestamp: new Date(order.created_at),
          status: order.status,
          paymentMethod: order.payment_method
        }));
        
        console.log('Parsed orders from database:', parsedOrders);
        processOrders(parsedOrders);
      } catch (error) {
        console.error('Error loading from database:', error);
        console.log('Falling back to localStorage due to database error');
        loadOrdersFromLocalStorage();
      }
    };

    const loadOrdersFromLocalStorage = () => {
      try {
        console.log('Loading orders from localStorage...');
        const savedOrders = localStorage.getItem('hotelOrders');
        console.log('Raw localStorage data:', savedOrders);
        
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
            ...order,
            timestamp: new Date(order.timestamp)
          }));
          console.log('Parsed orders from localStorage:', parsedOrders);
          processOrders(parsedOrders);
        } else {
          console.log('No orders found in localStorage');
          setOrders([]);
          setNotifications(0);
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
        setOrders([]);
        setNotifications(0);
      }
    };

    const processOrders = (parsedOrders: RestaurantOrder[]) => {
      console.log('Processing orders:', parsedOrders.length);
      
      // Check for new orders by comparing order IDs
      const currentOrderIds = new Set(parsedOrders.map((order: RestaurantOrder) => order.id));
      const newOrderIds = [...currentOrderIds].filter(id => !lastOrderIds.has(id));
      
      // If there are new orders and we have previous orders, show notification
      if (newOrderIds.length > 0 && lastOrderIds.size > 0) {
        console.log('New orders detected:', newOrderIds);
        playNotificationSound();
        setNewOrderAlert(true);
        
        // Add notifications for new orders
        newOrderIds.forEach(orderId => {
          const newOrder = parsedOrders.find((order: RestaurantOrder) => order.id === orderId);
          if (newOrder) {
            addNotification(
              `New order #${orderId} from Room ${newOrder.customerDetails.roomNumber}`,
              'new_order',
              orderId
            );
          }
        });
        
        // Show alert for 5 seconds
        setTimeout(() => {
          setNewOrderAlert(false);
        }, 5000);
      }
      
      // Update last order IDs
      setLastOrderIds(currentOrderIds);
      
      setOrders(parsedOrders);
      setLastOrderCount(parsedOrders.length);
      
      // Count new orders for notifications
      const newOrdersCount = parsedOrders.filter((order: RestaurantOrder) => order.status === 'new').length;
      setNotifications(newOrdersCount);
      
      console.log('Orders processed successfully. Total orders:', parsedOrders.length, 'New orders:', newOrdersCount);
    };

    // Load orders initially
    loadOrders();

    // Set up real-time subscriptions if database is connected
    let subscription: any = null;
    if (isSupabaseConfigured()) {
      console.log('Setting up real-time order subscriptions...');
      subscription = subscribeToOrders((payload) => {
        console.log('Real-time order update received:', payload);
        loadOrders();
      });
    }

    // Set up interval to check for new orders (fallback for localStorage)
    const refreshInterval = isSupabaseConfigured() ? 5000 : 2000; // 5 seconds for DB, 2 seconds for localStorage
    console.log('Setting up refresh interval:', refreshInterval + 'ms');
    const interval = setInterval(loadOrders, refreshInterval);

    return () => {
      clearInterval(interval);
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [lastOrderIds, soundEnabled]);

  // Legacy method for loading orders from localStorage
  const loadOrdersLegacy = () => {
    try {
      const savedOrders = localStorage.getItem('hotelOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp)
        }));
          
        setOrders(parsedOrders);
        setLastOrderCount(parsedOrders.length);
        
        // Count new orders for notifications
        const newOrdersCount = parsedOrders.filter((order: RestaurantOrder) => order.status === 'new').length;
        setNotifications(newOrdersCount);
      } else {
        setOrders([]);
        setNotifications(0);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
      setNotifications(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('managerLoginTime');
    localStorage.removeItem('managerAuthenticated');
    onLogout();
  };

  const updateOrderStatus = (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'delivered') => {
    if (isSupabaseConfigured()) {
      // Update in database
      ordersAPI.updateStatus(orderId, newStatus).then(() => {
        console.log('Order status updated in database');
        // Orders will be reloaded via real-time subscription
      }).catch(error => {
        console.error('Error updating order status in database:', error);
        // Fallback to localStorage update
        updateOrderStatusLocal(orderId, newStatus);
      });
    } else {
      updateOrderStatusLocal(orderId, newStatus);
    }
  };

  const updateOrderStatusLocal = (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'delivered') => {
    try {
      const updatedOrders = orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      localStorage.setItem('hotelOrders', JSON.stringify(updatedOrders));
      
      // Update notifications count
      const newOrdersCount = updatedOrders.filter(order => order.status === 'new').length;
      setNotifications(newOrdersCount);

      // Add notification for status update
      const order = orders.find(o => o.id === orderId);
      if (order) {
        addNotification(
          `Order #${orderId} status updated to ${newStatus.toUpperCase()}`,
          'order_update',
          orderId
        );
      }

      // Update selected order if it's the one being modified
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating order status locally:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800 border-red-200';
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'preparing': return <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'ready': return <Package className="h-3 w-3 sm:h-4 sm:w-4" />;
      case 'delivered': return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />;
      default: return <Clock className="h-3 w-3 sm:h-4 sm:w-4" />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = order.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerDetails.roomNumber.includes(searchTerm) ||
                         order.id.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayOrders = orders.filter(order => order.timestamp.toDateString() === today);
    
    return {
      totalOrders: todayOrders.length,
      totalRevenue: todayOrders.reduce((sum, order) => sum + order.total, 0),
      newOrders: todayOrders.filter(order => order.status === 'new').length,
      completedOrders: todayOrders.filter(order => order.status === 'delivered').length
    };
  };

  const stats = getTodayStats();

  // Show Room Billing if requested
  if (showRoomBilling) {
    return <RoomBilling onBack={() => setShowRoomBilling(false)} />;
  }

  // Show Menu Manager if requested
  if (showMenuManager) {
    return <MenuManager onBack={() => setShowMenuManager(false)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-3 sm:px-6 sm:py-4 rounded-2xl shadow-2xl animate-bounce border-2 border-red-300">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="relative">
              <Bell className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="font-bold text-sm sm:text-lg">🔔 New Order Received!</p>
              <p className="text-xs sm:text-sm opacity-90">Check the dashboard for details</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Restaurant Manager
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  {databaseConnected ? 'Live Dashboard - Database Connected' : 'Local Dashboard - Database Not Connected'}
                </p>
              </div>
            </div>
            {!databaseConnected && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-3 py-2 text-xs mr-4">
                <p className="text-yellow-800 font-medium">⚠️ Database not connected - orders are local only</p>
              </div>
            )}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => setShowMenuManager(true)}
                className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
              >
                <Menu className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Menu</span>
                <span className="sm:hidden">Menu</span>
              </button>
              <button
                onClick={() => setShowRoomBilling(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
              >
                <CreditCard className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Room Bills</span>
                <span className="sm:hidden">Bills</span>
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Sound On - Click to disable notifications' : 'Sound Off - Click to enable notifications'}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" /> : <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                <span className="text-xs sm:text-sm text-green-700 font-medium">Session: {sessionTimeLeft}</span>
              </div>
              
              {/* Notification Bell with Panel */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                  className={`p-2 rounded-xl transition-all duration-300 hover:bg-gray-100 ${
                    notifications > 0 ? 'animate-pulse' : ''
                  }`}
                  title="View notifications"
                >
                  <Bell className={`h-5 w-5 sm:h-6 sm:w-6 ${notifications > 0 ? 'text-red-600' : 'text-gray-600'}`} />
                  {notifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs animate-bounce">
                      {notifications}
                    </span>
                  )}
                </button>

                {/* Notification Panel */}
                {showNotificationPanel && (
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                        <div className="flex space-x-2">
                          {notificationHistory.filter(n => !n.read).length > 0 && (
                            <button
                              onClick={markAllNotificationsAsRead}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              Mark all read
                            </button>
                          )}
                          <button
                            onClick={clearAllNotifications}
                            className="text-xs text-red-600 hover:text-red-800 font-medium"
                          >
                            Clear all
                          </button>
                          <button
                            onClick={() => setShowNotificationPanel(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {notificationHistory.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notificationHistory.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${
                                !notification.read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${
                                  notification.type === 'new_order' 
                                    ? 'bg-red-100 text-red-600' 
                                    : 'bg-blue-100 text-blue-600'
                                }`}>
                                  {notification.type === 'new_order' ? (
                                    <AlertCircle className="h-4 w-4" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatTime(notification.timestamp)} - {formatDate(notification.timestamp)}
                                  </p>
                                </div>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">New Orders</p>
                  <p className={`text-xl sm:text-3xl font-bold ${stats.newOrders > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                    {stats.newOrders}
                  </p>
                </div>
                <div className={`p-2 sm:p-3 rounded-full ${stats.newOrders > 0 ? 'bg-red-100 animate-pulse' : 'bg-red-100'}`}>
                  <AlertCircle className={`h-4 w-4 sm:h-6 sm:w-6 ${stats.newOrders > 0 ? 'text-red-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-6 sm:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative w-full sm:w-auto">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 w-full sm:w-auto text-sm sm:text-base"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-700 font-medium">Auto-refresh: ON</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 sm:px-4 sm:py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 text-xs sm:text-sm"
                >
                  <option value="all">All Orders</option>
                  <option value="new">New Orders</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  order.status === 'new' 
                    ? 'border-red-200 ring-2 ring-red-100 animate-pulse' 
                    : 'border-gray-100'
                }`}
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">{formatDate(order.timestamp)} at {formatTime(order.timestamp)}</p>
                    </div>
                    <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getStatusColor(order.status)} ${
                      order.status === 'new' ? 'animate-pulse' : ''
                    }`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.toUpperCase()}</span>
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{order.customerDetails.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-gray-700 text-sm sm:text-base">+91 {order.customerDetails.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-gray-700 text-sm sm:text-base">Room {order.customerDetails.roomNumber}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Items ({order.items.length})</h4>
                    <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs sm:text-sm bg-gray-50 p-2 rounded-lg">
                          <span className="flex items-center space-x-2">
                            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{item.name} x{item.quantity}</span>
                          </span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                    <span className="font-bold text-gray-900 text-sm sm:text-base">Total</span>
                    <span className="text-lg sm:text-xl font-bold text-amber-600">₹{order.total}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 sm:px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                    >
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span>View</span>
                    </button>
                    
                    {order.status === 'new' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'preparing');
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2 px-3 sm:px-4 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <ChefHat className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Start</span>
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'ready');
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-3 sm:px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Ready</span>
                      </button>
                    )}
                    
                    {order.status === 'ready' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'delivered');
                        }}
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-3 sm:px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <Truck className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span>Deliver</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <ChefHat className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-base sm:text-lg">No orders found</p>
              <p className="text-gray-400 text-xs sm:text-sm mt-2">Orders will appear here when customers place them</p>
            </div>
          )}
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-gray-600">Order ID:</span>
                      <p className="font-semibold">#{selectedOrder.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className={`font-semibold ${selectedOrder.status === 'new' ? 'text-red-600' : selectedOrder.status === 'preparing' ? 'text-yellow-600' : selectedOrder.status === 'ready' ? 'text-blue-600' : 'text-green-600'}`}>
                        {selectedOrder.status.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-semibold">{formatDate(selectedOrder.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <p className="font-semibold">{formatTime(selectedOrder.timestamp)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Customer Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="font-semibold text-sm sm:text-base">{selectedOrder.customerDetails.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-sm sm:text-base">+91 {selectedOrder.customerDetails.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                      <span className="text-sm sm:text-base">Room {selectedOrder.customerDetails.roomNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-2 sm:p-3 rounded-lg">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <div>
                            <p className="font-semibold text-sm sm:text-base">{item.name}</p>
                            <p className="text-xs sm:text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm sm:text-base">x{item.quantity}</p>
                          <p className="text-xs sm:text-sm text-gray-600">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 sm:p-4 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base sm:text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-600">₹{selectedOrder.total}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Payment: {selectedOrder.paymentMethod}</p>
                </div>

                <div className="flex space-x-3">
                  {selectedOrder.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateOrderStatus(selectedOrder.id, 'preparing');
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                    >
                      <ChefHat className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Start Preparing</span>
                    </button>
                  )}
                  
                  {selectedOrder.status === 'preparing' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateOrderStatus(selectedOrder.id, 'ready');
                      }}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                    >
                      <Package className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Mark as Ready</span>
                    </button>
                  )}
                  
                  {selectedOrder.status === 'ready' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateOrderStatus(selectedOrder.id, 'delivered');
                      }}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 sm:py-3 px-3 sm:px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                    >
                      <Truck className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Mark as Delivered</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantManager;