import React, { useState, useEffect } from 'react';
import { User, Phone, LogOut, History, Clock, MapPin, Star, ArrowLeft, Calendar, Package, CreditCard, X } from 'lucide-react';

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

interface UserOrder {
  id: string;
  items: OrderItem[];
  customerDetails: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'preparing' | 'on-the-way' | 'delivered';
  paymentMethod: string;
}

interface UserDashboardProps {
  userMobile: string;
  onLogout: () => void;
  onBack: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ userMobile, onLogout, onBack }) => {
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUserOrders = () => {
      const savedOrders = localStorage.getItem('hotelOrders');
      if (savedOrders) {
        const allOrders = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp)
        }));
        
        // Filter orders by user's mobile number
        const filteredOrders = allOrders.filter((order: UserOrder) => 
          order.customerDetails.mobile === userMobile
        );
        
        // Sort by timestamp (newest first)
        filteredOrders.sort((a: UserOrder, b: UserOrder) => b.timestamp.getTime() - a.timestamp.getTime());
        
        setUserOrders(filteredOrders);
      }
      setIsLoading(false);
    };

    loadUserOrders();

    // Set up real-time updates
    const interval = setInterval(loadUserOrders, 1000);
    return () => clearInterval(interval);
  }, [userMobile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready':
      case 'on-the-way': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
      case 'preparing': return '👨‍🍳';
      case 'ready':
      case 'on-the-way': return '🚚';
      case 'delivered': return '✅';
      default: return '⏳';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'NEW';
      case 'preparing': return 'PREPARING';
      case 'ready': return 'READY';
      case 'delivered': return 'DELIVERED';
      default: return status.toUpperCase();
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-all duration-300"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <User className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    My Order History
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    +91 {userMobile}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Orders Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {userOrders.length === 0 ? (
            <div className="text-center py-16">
              <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
              <p className="text-gray-600 mb-6">You haven't placed any orders yet. Start exploring our delicious menu!</p>
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Orders ({userOrders.length})</h2>
                <p className="text-gray-600">Track your order history and status updates</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {userOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.id}</h3>
                          <p className="text-sm text-gray-600 flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(order.timestamp)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                          <span>{getStatusIcon(order.status)}</span>
                          <span>{getStatusText(order.status)}</span>
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <MapPin className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">Room {order.customerDetails.roomNumber}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Items ({order.items.length})</h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {order.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                              <span className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span>{item.name} x{item.quantity}</span>
                              </span>
                              <span className="font-semibold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <div className="text-xs text-gray-500 text-center py-1">
                              +{order.items.length - 3} more items
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-amber-600">₹{order.total}</span>
                      </div>

                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        <History className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
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
                      <p className={`font-semibold flex items-center space-x-1 ${
                        selectedOrder.status === 'preparing' || selectedOrder.status === 'new' ? 'text-yellow-600' : 
                        selectedOrder.status === 'on-the-way' || selectedOrder.status === 'ready' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        <span>{getStatusIcon(selectedOrder.status)}</span>
                        <span>{getStatusText(selectedOrder.status)}</span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date & Time:</span>
                      <p className="font-semibold">{formatDate(selectedOrder.timestamp)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Room:</span>
                      <p className="font-semibold">{selectedOrder.customerDetails.roomNumber}</p>
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;