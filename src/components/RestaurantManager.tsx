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
  CreditCard
} from 'lucide-react';
import RoomBilling from './RoomBilling';

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
  
  // Audio context for notification sound
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudio = () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.log('Audio context not supported');
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play notification sound
  const playNotificationSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      const context = audioContextRef.current;
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
    }
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

  // Load orders from localStorage and listen for new orders with real-time updates
  useEffect(() => {
    const loadOrders = () => {
      const savedOrders = localStorage.getItem('hotelOrders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp)
        }));
        
        // Check for new orders
        const currentOrderCount = parsedOrders.length;
        if (currentOrderCount > lastOrderCount && lastOrderCount > 0) {
          // New order detected!
          playNotificationSound();
          setNewOrderAlert(true);
          
          // Show alert for 3 seconds
          setTimeout(() => {
            setNewOrderAlert(false);
          }, 3000);
        }
        
        setOrders(parsedOrders);
        setLastOrderCount(currentOrderCount);
        
        // Count new orders for notifications
        const newOrdersCount = parsedOrders.filter((order: RestaurantOrder) => order.status === 'new').length;
        setNotifications(newOrdersCount);
      }
    };

    // Load orders initially
    loadOrders();

    // Set up interval to check for new orders every second for real-time updates
    const interval = setInterval(loadOrders, 1000);

    return () => clearInterval(interval);
  }, [lastOrderCount, soundEnabled]);

  const handleLogout = () => {
    localStorage.removeItem('managerLoginTime');
    localStorage.removeItem('managerAuthenticated');
    onLogout();
  };

  const updateOrderStatus = (orderId: string, newStatus: 'new' | 'preparing' | 'ready' | 'delivered') => {
    const updatedOrders = orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('hotelOrders', JSON.stringify(updatedOrders));
    
    // Update notifications count
    const newOrdersCount = updatedOrders.filter(order => order.status === 'new').length;
    setNotifications(newOrdersCount);

    // Update selected order if it's the one being modified
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
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
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'preparing': return <ChefHat className="h-4 w-4" />;
      case 'ready': return <Package className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* New Order Alert */}
      {newOrderAlert && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce border-2 border-red-300">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bell className="h-6 w-6 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="font-bold text-lg">New Order Received!</p>
              <p className="text-sm opacity-90">Check the dashboard for details</p>
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
                <ChefHat className="h-8 w-8 text-amber-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Restaurant Manager
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                  Live Dashboard - Real-time Updates
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowRoomBilling(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Room Bills</span>
              </button>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={soundEnabled ? 'Sound On' : 'Sound Off'}
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </button>
              <div className="hidden md:flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 font-medium">Session: {sessionTimeLeft}</span>
              </div>
              <div className="relative">
                <Bell className={`h-6 w-6 text-gray-600 ${notifications > 0 ? 'animate-pulse' : ''}`} />
                {notifications > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs animate-bounce">
                    {notifications}
                  </span>
                )}
              </div>
              <button 
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Orders</p>
                  <p className={`text-3xl font-bold ${stats.newOrders > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                    {stats.newOrders}
                  </p>
                </div>
                <div className={`p-3 rounded-full ${stats.newOrders > 0 ? 'bg-red-100 animate-pulse' : 'bg-red-100'}`}>
                  <AlertCircle className={`h-6 w-6 ${stats.newOrders > 0 ? 'text-red-600' : 'text-red-600'}`} />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedOrders}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-full border border-green-200">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">Auto-refresh: ON</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
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
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                  order.status === 'new' 
                    ? 'border-red-200 ring-2 ring-red-100 animate-pulse' 
                    : 'border-gray-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">{formatDate(order.timestamp)} at {formatTime(order.timestamp)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getStatusColor(order.status)} ${
                      order.status === 'new' ? 'animate-pulse' : ''
                    }`}>
                      {getStatusIcon(order.status)}
                      <span>{order.status.toUpperCase()}</span>
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold text-gray-900">{order.customerDetails.name}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{order.customerDetails.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">Room {order.customerDetails.roomNumber}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Items ({order.items.length})</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                          <span className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                            <span>{item.name} x{item.quantity}</span>
                          </span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-amber-600">₹{order.total}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {order.status === 'new' && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateOrderStatus(order.id, 'preparing');
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-2 px-4 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <ChefHat className="h-4 w-4" />
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
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Package className="h-4 w-4" />
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
                        className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Truck className="h-4 w-4" />
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
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
            </div>
          )}
        </div>
      </section>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Order Details
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
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

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Details</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{selectedOrder.customerDetails.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>{selectedOrder.customerDetails.mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span>Room {selectedOrder.customerDetails.roomNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className={`w-3 h-3 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">x{item.quantity}</p>
                          <p className="text-sm text-gray-600">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-amber-600">₹{selectedOrder.total}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Payment: {selectedOrder.paymentMethod}</p>
                </div>

                <div className="flex space-x-3">
                  {selectedOrder.status === 'new' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        updateOrderStatus(selectedOrder.id, 'preparing');
                      }}
                      className="flex-1 bg-gradient-to-r from-yellow-600 to-yellow-700 text-white py-3 px-4 rounded-xl hover:from-yellow-700 hover:to-yellow-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <ChefHat className="h-5 w-5" />
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
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Package className="h-5 w-5" />
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
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Truck className="h-5 w-5" />
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