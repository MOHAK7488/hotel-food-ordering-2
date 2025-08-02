import React, { useState, useEffect } from 'react';
import { Phone, ArrowLeft, Calendar, Package, CreditCard, X, Search, AlertCircle, History, DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useOrders, useRoomBills } from '../hooks/useDatabase';

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
  room_number: string;
}

interface UserOrder {
  id: string;
  items: OrderItem[];
  customer_details: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  payment_method: string;
  bill_paid?: boolean;
}

interface PaymentSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  totalOrders: number;
  paidOrders: number;
  unpaidOrders: number;
}

interface OrderHistoryProps {
  onBack: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ onBack }) => {
  const [mobile, setMobile] = useState('');
  const [userOrders, setUserOrders] = useState<UserOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<UserOrder | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null);

  // Use database hooks
  const { getOrdersByMobile } = useOrders();
  const { roomBills } = useRoomBills();

  const searchOrders = () => {
    if (mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    getOrdersByMobile(mobile)
      .then((orders) => {
        // Sort by timestamp (newest first)
        const sortedOrders = orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        // Update orders with payment status based on room billing
        const ordersWithPaymentStatus = sortedOrders.map((order) => {
          const billId = `${order.customer_details.room_number}-${order.customer_details.mobile}`;
          const roomBill = roomBills.find(bill => bill.id === billId);
          return {
            ...order,
            timestamp: new Date(order.timestamp),
            bill_paid: roomBill?.is_paid || false
          };
        });
        
        setUserOrders(ordersWithPaymentStatus);
        
        // Calculate payment summary
        if (ordersWithPaymentStatus.length > 0) {
          const totalAmount = ordersWithPaymentStatus.reduce((sum, order) => sum + order.total, 0);
          const paidAmount = ordersWithPaymentStatus
            .filter(order => order.bill_paid)
            .reduce((sum, order) => sum + order.total, 0);
          const remainingAmount = totalAmount - paidAmount;
          const totalOrders = ordersWithPaymentStatus.length;
          const paidOrders = ordersWithPaymentStatus.filter(order => order.bill_paid).length;
          const unpaidOrders = totalOrders - paidOrders;
          
          setPaymentSummary({
            totalAmount,
            paidAmount,
            remainingAmount,
            totalOrders,
            paidOrders,
            unpaidOrders
          });
        } else {
          setPaymentSummary(null);
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching orders:', error);
        setUserOrders([]);
        setPaymentSummary(null);
        setIsLoading(false);
      });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'preparing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ready': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
      case 'preparing': return '👨‍🍳';
      case 'ready': return '📦';
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
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <History className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Order History
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Search your past orders and payment status
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Find Your Orders</h2>
              <p className="text-gray-600 text-sm sm:text-base">Enter your mobile number to view your order history and payment details</p>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium text-sm sm:text-base">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value.length <= 10) {
                          setMobile(value);
                        }
                      }}
                      className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                    />
                  </div>
                </div>
                <button
                  onClick={searchOrders}
                  disabled={isLoading || mobile.length !== 10}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span>Search Orders</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {hasSearched && paymentSummary && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 mb-6 sm:mb-8">
              <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Payment Summary</h3>
                <p className="text-gray-600 text-sm sm:text-base">Complete overview of your orders and payments</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-700">Total Amount</p>
                      <p className="text-2xl sm:text-3xl font-bold text-blue-900">₹{paymentSummary.totalAmount}</p>
                      <p className="text-xs sm:text-sm text-blue-600 mt-1">{paymentSummary.totalOrders} orders</p>
                    </div>
                    <div className="p-3 bg-blue-200 rounded-full">
                      <DollarSign className="h-6 w-6 text-blue-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 sm:p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-700">Paid Amount</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-900">₹{paymentSummary.paidAmount}</p>
                      <p className="text-xs sm:text-sm text-green-600 mt-1">{paymentSummary.paidOrders} orders paid</p>
                    </div>
                    <div className="p-3 bg-green-200 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-700" />
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 sm:p-6 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-700">Remaining Amount</p>
                      <p className="text-2xl sm:text-3xl font-bold text-red-900">₹{paymentSummary.remainingAmount}</p>
                      <p className="text-xs sm:text-sm text-red-600 mt-1">{paymentSummary.unpaidOrders} orders pending</p>
                    </div>
                    <div className="p-3 bg-red-200 rounded-full">
                      <Clock className="h-6 w-6 text-red-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Progress Bar */}
              <div className="bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${paymentSummary.totalAmount > 0 ? (paymentSummary.paidAmount / paymentSummary.totalAmount) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Payment Progress</span>
                <span>{paymentSummary.totalAmount > 0 ? Math.round((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100) : 0}% Complete</span>
              </div>

              {paymentSummary.remainingAmount > 0 && (
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                    <p className="text-yellow-800 font-medium">
                      You have ₹{paymentSummary.remainingAmount} pending payment for {paymentSummary.unpaidOrders} orders.
                    </p>
                  </div>
                  <p className="text-yellow-700 text-sm mt-1">
                    Please complete payment at the reception using UPI, cash, or card.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Orders Results */}
          {hasSearched && (
            <>
              {userOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Orders Found</h3>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base">
                    No orders found for mobile number +91 {mobile}. 
                    <br />Please check the number and try again.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      Orders for +91 {mobile} ({userOrders.length})
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">Your complete order history with payment status</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                      >
                        <div className="p-4 sm:p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-gray-900">Order #{order.id}</h3>
                              <p className="text-xs sm:text-sm text-gray-600 flex items-center">
                                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                {formatDate(order.timestamp)}
                              </p>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                                <span>{getStatusIcon(order.status)}</span>
                                <span>{getStatusText(order.status)}</span>
                              </span>
                              <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                                order.bill_paid 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-red-100 text-red-800 border-red-200'
                              }`}>
                                {order.bill_paid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                <span>{order.bill_paid ? 'PAID' : 'UNPAID'}</span>
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <Package className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                              <span className="text-gray-700 text-sm sm:text-base">Room {order.customer_details.room_number}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-600 text-sm sm:text-base">Customer:</span>
                              <span className="font-semibold text-gray-900 text-sm sm:text-base">{order.customer_details.name}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Items ({order.items.length})</h4>
                            <div className="space-y-1 max-h-24 sm:max-h-32 overflow-y-auto">
                              {order.items.slice(0, 3).map((item) => (
                                <div key={item.id} className="flex justify-between text-xs sm:text-sm bg-gray-50 p-2 rounded-lg">
                                  <span className="flex items-center space-x-2">
                                    <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
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

                          <div className="flex justify-between items-center mb-4 p-2 sm:p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                            <span className="font-bold text-gray-900 text-sm sm:text-base">Total</span>
                            <span className="text-lg sm:text-xl font-bold text-amber-600">₹{order.total}</span>
                          </div>

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                          >
                            <Package className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
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
                      <p className={`font-semibold flex items-center space-x-1 ${
                        selectedOrder.status === 'preparing' || selectedOrder.status === 'new' ? 'text-yellow-600' : 
                        selectedOrder.status === 'ready' ? 'text-blue-600' : 'text-green-600'
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
                      <p className="font-semibold">{selectedOrder.customer_details.room_number}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Customer Details</h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-gray-600 text-sm sm:text-base">Name:</span>
                      <p className="font-semibold text-sm sm:text-base">{selectedOrder.customer_details.name}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm sm:text-base">Mobile:</span>
                      <p className="font-semibold text-sm sm:text-base">+91 {selectedOrder.customer_details.mobile}</p>
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
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base sm:text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-xl sm:text-2xl font-bold text-amber-600">₹{selectedOrder.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                      selectedOrder.bill_paid 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {selectedOrder.bill_paid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{selectedOrder.bill_paid ? 'PAID' : 'UNPAID'}</span>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">Payment Method: {selectedOrder.payment_method}</p>
                </div>

                {!selectedOrder.bill_paid && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <span className="font-semibold text-yellow-800">Payment Pending</span>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      This order amount is still pending. Please complete payment at the reception using UPI, cash, or card.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;