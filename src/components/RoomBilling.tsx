import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Calendar,
  User,
  Phone,
  Package,
  DollarSign,
  AlertCircle,
  Filter,
  Search,
  X,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
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

interface RoomOrder {
  id: string;
  items: OrderItem[];
  customer_details: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  payment_method: string;
  bill_paid?: boolean;
}

interface RoomBill {
  id: string; // Unique identifier for each bill (room + mobile combination)
  room_number: string;
  customer_name: string;
  customer_mobile: string;
  orders: RoomOrder[];
  total_amount: number;
  is_paid: boolean;
  created_at: Date;
  updated_at: Date;
}

interface RoomBillingProps {
  onBack: () => void;
}

const RoomBilling: React.FC<RoomBillingProps> = ({ onBack }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomBill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');

  // Use database hooks
  const { orders } = useOrders();
  const { roomBills, updateBillPaymentStatus, loading: billsLoading, error: billsError } = useRoomBills();

  const markBillAsPaid = (billId: string) => {
    updateBillPaymentStatus(billId, true)
      .then(() => {
        // Update selected room if it's the one being modified
        if (selectedRoom && selectedRoom.id === billId) {
          setSelectedRoom({ ...selectedRoom, is_paid: true });
        }
      })
      .catch((error) => {
        console.error('Error updating bill payment status:', error);
        alert('Failed to update payment status. Please try again.');
      });
  };

  const markBillAsUnpaid = (billId: string) => {
    updateBillPaymentStatus(billId, false)
      .then(() => {
        // Update selected room if it's the one being modified
        if (selectedRoom && selectedRoom.id === billId) {
          setSelectedRoom({ ...selectedRoom, is_paid: false });
        }
      })
      .catch((error) => {
        console.error('Error updating bill payment status:', error);
        alert('Failed to update payment status. Please try again.');
      });
  };

  const filteredBills = roomBills.filter(bill => {
    const matchesSearch = bill.room_number.includes(searchTerm) ||
                         bill.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         bill.customer_mobile.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && bill.is_paid) ||
                         (statusFilter === 'unpaid' && !bill.is_paid);
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTotalStats = () => {
    const totalBills = roomBills.length;
    const paidBills = roomBills.filter(bill => bill.is_paid).length;
    const unpaidBills = roomBills.filter(bill => !bill.is_paid).length;
    const totalRevenue = roomBills.reduce((sum, bill) => sum + bill.total_amount, 0);
    const paidRevenue = roomBills.filter(bill => bill.is_paid).reduce((sum, bill) => sum + bill.total_amount, 0);
    const unpaidRevenue = roomBills.filter(bill => !bill.is_paid).reduce((sum, bill) => sum + bill.total_amount, 0);
    const totalOrders = orders.length;
    const uniqueRooms = new Set(roomBills.map(bill => bill.room_number)).size;

    return {
      totalBills,
      uniqueRooms,
      paidBills,
      unpaidBills,
      totalRevenue,
      paidRevenue,
      unpaidRevenue,
      totalOrders
    };
  };

  const stats = getTotalStats();

  if (billsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading room bills...</p>
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
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Customer Billing Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Separate bills for each customer • Real-time updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 sm:gap-6 mb-8">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Bills</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalBills}</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                  <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Unique Rooms</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.uniqueRooms}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <MapPin className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="p-2 sm:p-3 bg-indigo-100 rounded-full">
                  <Package className="h-4 w-4 sm:h-6 sm:w-6 text-indigo-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Paid Bills</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.paidBills}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Unpaid Bills</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.unpaidBills}</p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Paid Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">₹{stats.paidRevenue}</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600">₹{stats.unpaidRevenue}</p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 rounded-full">
                  <Clock className="h-4 w-4 sm:h-6 sm:w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-900">Smart Billing System</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div>
                <span className="font-medium">Separate Bills:</span> Each customer gets their own bill even in the same room
              </div>
              <div>
                <span className="font-medium">Customer Bills Found:</span> {roomBills.length}
              </div>
              <div>
                <span className="font-medium">Database:</span> Real-time synchronization
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="relative">
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by room number, name, or mobile..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 w-full md:w-80"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Bills ({roomBills.length})</option>
                  <option value="paid">Paid Bills ({stats.paidBills})</option>
                  <option value="unpaid">Unpaid Bills ({stats.unpaidBills})</option>
                </select>
              </div>
            </div>
          </div>

          {/* Room Bills List */}
          {billsError ? (
            <div className="text-center py-16">
              <CreditCard className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-red-900 mb-2">Database Connection Error</h3>
              <p className="text-red-600 mb-4">Unable to load room bills. Please check your database connection.</p>
              <p className="text-sm text-red-500">{billsError}</p>
            </div>
          ) : filteredBills.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {roomBills.length === 0 ? 'No Bills Found' : 'No Matching Bills'}
              </h3>
              <p className="text-gray-600 mb-4">
                {roomBills.length === 0 
                  ? 'No customer bills available. Bills will appear here when customers place orders.'
                  : 'No customer bills match your current search and filter criteria.'
                }
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <div
                  key={bill.id}
                  className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                    !bill.is_paid ? 'border-red-200 ring-2 ring-red-100' : 'border-green-200 ring-2 ring-green-100'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                          Room {bill.room_number}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(bill.created_at)} - {formatDate(bill.updated_at)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Bill ID: {bill.id}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                        bill.is_paid 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {bill.is_paid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{bill.is_paid ? 'PAID' : 'UNPAID'}</span>
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Orders</span>
                        <span className="font-semibold text-gray-900">{orders.filter(o => o.customer_details.room_number === bill.room_number && o.customer_details.mobile === bill.customer_mobile).length}</span>
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4 text-gray-600" />
                          <span className="font-semibold text-gray-900">{bill.customer_name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-600" />
                          <span className="text-gray-700">+91 {bill.customer_mobile}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                      <span className="font-bold text-gray-900">Total Bill</span>
                      <span className="text-xl font-bold text-amber-600">₹{bill.total_amount}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRoom(bill)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Package className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      {!bill.is_paid ? (
                        <button
                          onClick={() => markBillAsPaid(bill.id)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markBillAsUnpaid(bill.id)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <Clock className="h-4 w-4" />
                          <span>Mark Unpaid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Customer Bill Details - Room {selectedRoom.room_number}
                </h3>
                <button
                  onClick={() => setSelectedRoom(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Bill Summary */}
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-4 sm:p-6 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900">Bill Summary</h4>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center space-x-2 ${
                      selectedRoom.is_paid 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {selectedRoom.is_paid ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      <span>{selectedRoom.is_paid ? 'PAID' : 'UNPAID'}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-600">Bill ID:</span>
                      <p className="font-semibold text-lg">{selectedRoom.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <p className="font-semibold text-lg">{orders.filter(o => o.customer_details.room_number === selectedRoom.room_number && o.customer_details.mobile === selectedRoom.customer_mobile).length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">First Order:</span>
                      <p className="font-semibold text-lg">{formatDate(selectedRoom.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Order:</span>
                      <p className="font-semibold text-lg">{formatDate(selectedRoom.updated_at)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-3xl font-bold text-amber-600">₹{selectedRoom.total_amount}</span>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-semibold">{selectedRoom.customer_name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span>+91 {selectedRoom.customer_mobile}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-600" />
                      <span>Room {selectedRoom.room_number}</span>
                    </div>
                  </div>
                </div>

                {/* Orders List */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Complete Order History</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {orders.filter(o => o.customer_details.room_number === selectedRoom.room_number && o.customer_details.mobile === selectedRoom.customer_mobile).map((order, index) => (
                      <div key={order.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900">Order #{order.id}</h5>
                            <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold mt-1 ${
                              order.status === 'new' ? 'bg-red-100 text-red-800' :
                              order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {order.status.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-lg font-bold text-amber-600">₹{order.total}</span>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-700 mb-2">Items ({order.items.length}):</p>
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                              <span className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                <span>{item.name} x{item.quantity}</span>
                              </span>
                              <span className="font-semibold">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  {!selectedRoom.is_paid ? (
                    <button
                      onClick={() => markBillAsPaid(selectedRoom.id)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Mark as Paid</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markBillAsUnpaid(selectedRoom.id)}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <Clock className="h-5 w-5" />
                      <span>Mark as Unpaid</span>
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

export default RoomBilling;