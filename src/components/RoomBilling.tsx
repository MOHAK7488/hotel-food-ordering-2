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
  X
} from 'lucide-react';

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

interface RoomOrder {
  id: string;
  items: OrderItem[];
  customerDetails: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  paymentMethod: string;
  billPaid?: boolean;
}

interface RoomBill {
  roomNumber: string;
  orders: RoomOrder[];
  totalAmount: number;
  isPaid: boolean;
  lastOrderDate: Date;
}

interface RoomBillingProps {
  onBack: () => void;
}

const RoomBilling: React.FC<RoomBillingProps> = ({ onBack }) => {
  const [roomBills, setRoomBills] = useState<RoomBill[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomBill | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoomBills = () => {
      const savedOrders = localStorage.getItem('hotelOrders');
      const savedBills = localStorage.getItem('hotelRoomBills');
      
      if (savedOrders) {
        const allOrders: RoomOrder[] = JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp),
          billPaid: order.billPaid || false
        }));

        // Group orders by room number
        const roomOrdersMap = new Map<string, RoomOrder[]>();
        
        allOrders.forEach(order => {
          const roomNumber = order.customerDetails.roomNumber;
          if (!roomOrdersMap.has(roomNumber)) {
            roomOrdersMap.set(roomNumber, []);
          }
          roomOrdersMap.get(roomNumber)!.push(order);
        });

        // Load saved bill payment status
        const savedBillStatus = savedBills ? JSON.parse(savedBills) : {};

        // Create room bills
        const bills: RoomBill[] = Array.from(roomOrdersMap.entries()).map(([roomNumber, orders]) => {
          const totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
          const lastOrderDate = new Date(Math.max(...orders.map(order => order.timestamp.getTime())));
          const isPaid = savedBillStatus[roomNumber] || false;

          return {
            roomNumber,
            orders: orders.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
            totalAmount,
            isPaid,
            lastOrderDate
          };
        });

        // Sort by last order date (most recent first)
        bills.sort((a, b) => b.lastOrderDate.getTime() - a.lastOrderDate.getTime());
        
        setRoomBills(bills);
      }
      setIsLoading(false);
    };

    loadRoomBills();

    // Set up real-time updates
    const interval = setInterval(loadRoomBills, 1000);
    return () => clearInterval(interval);
  }, []);

  const markBillAsPaid = (roomNumber: string) => {
    const updatedBills = roomBills.map(bill => 
      bill.roomNumber === roomNumber ? { ...bill, isPaid: true } : bill
    );
    setRoomBills(updatedBills);

    // Save bill payment status
    const billStatus = updatedBills.reduce((acc, bill) => {
      acc[bill.roomNumber] = bill.isPaid;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('hotelRoomBills', JSON.stringify(billStatus));

    // Update selected room if it's the one being modified
    if (selectedRoom && selectedRoom.roomNumber === roomNumber) {
      setSelectedRoom({ ...selectedRoom, isPaid: true });
    }
  };

  const markBillAsUnpaid = (roomNumber: string) => {
    const updatedBills = roomBills.map(bill => 
      bill.roomNumber === roomNumber ? { ...bill, isPaid: false } : bill
    );
    setRoomBills(updatedBills);

    // Save bill payment status
    const billStatus = updatedBills.reduce((acc, bill) => {
      acc[bill.roomNumber] = bill.isPaid;
      return acc;
    }, {} as Record<string, boolean>);
    
    localStorage.setItem('hotelRoomBills', JSON.stringify(billStatus));

    // Update selected room if it's the one being modified
    if (selectedRoom && selectedRoom.roomNumber === roomNumber) {
      setSelectedRoom({ ...selectedRoom, isPaid: false });
    }
  };

  const filteredBills = roomBills.filter(bill => {
    const matchesSearch = bill.roomNumber.includes(searchTerm) ||
                         bill.orders.some(order => 
                           order.customerDetails.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           order.customerDetails.mobile.includes(searchTerm)
                         );
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'paid' && bill.isPaid) ||
                         (statusFilter === 'unpaid' && !bill.isPaid);
    
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

  const getTotalStats = () => {
    const totalRooms = roomBills.length;
    const paidRooms = roomBills.filter(bill => bill.isPaid).length;
    const unpaidRooms = roomBills.filter(bill => !bill.isPaid).length;
    const totalRevenue = roomBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
    const paidRevenue = roomBills.filter(bill => bill.isPaid).reduce((sum, bill) => sum + bill.totalAmount, 0);
    const unpaidRevenue = roomBills.filter(bill => !bill.isPaid).reduce((sum, bill) => sum + bill.totalAmount, 0);

    return {
      totalRooms,
      paidRooms,
      unpaidRooms,
      totalRevenue,
      paidRevenue,
      unpaidRevenue
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
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
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <CreditCard className="h-8 w-8 text-green-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Room Billing
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage room-wise bills and payments
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Rooms</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalRooms}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Bills</p>
                  <p className="text-3xl font-bold text-green-600">{stats.paidRooms}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unpaid Bills</p>
                  <p className="text-3xl font-bold text-red-600">{stats.unpaidRooms}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600">₹{stats.paidRevenue}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                  <p className="text-2xl font-bold text-red-600">₹{stats.unpaidRevenue}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <Clock className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
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
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'unpaid')}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Bills</option>
                  <option value="paid">Paid Bills</option>
                  <option value="unpaid">Unpaid Bills</option>
                </select>
              </div>
            </div>
          </div>

          {/* Room Bills List */}
          {filteredBills.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Bills Found</h3>
              <p className="text-gray-600">No room bills match your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBills.map((bill) => (
                <div
                  key={bill.roomNumber}
                  className={`bg-white rounded-2xl shadow-lg border overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 ${
                    !bill.isPaid ? 'border-red-200 ring-2 ring-red-100' : 'border-green-200 ring-2 ring-green-100'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                          <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                          Room {bill.roomNumber}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Last order: {formatDate(bill.lastOrderDate)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${
                        bill.isPaid 
                          ? 'bg-green-100 text-green-800 border-green-200' 
                          : 'bg-red-100 text-red-800 border-red-200'
                      }`}>
                        {bill.isPaid ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        <span>{bill.isPaid ? 'PAID' : 'UNPAID'}</span>
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Orders</span>
                        <span className="font-semibold text-gray-900">{bill.orders.length}</span>
                      </div>
                      
                      {/* Show customer info from latest order */}
                      {bill.orders.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <User className="h-4 w-4 text-gray-600" />
                            <span className="font-semibold text-gray-900">{bill.orders[0].customerDetails.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-600" />
                            <span className="text-gray-700">{bill.orders[0].customerDetails.mobile}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mb-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl">
                      <span className="font-bold text-gray-900">Total Bill</span>
                      <span className="text-xl font-bold text-amber-600">₹{bill.totalAmount}</span>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedRoom(bill)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Package className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      
                      {!bill.isPaid ? (
                        <button
                          onClick={() => markBillAsPaid(bill.roomNumber)}
                          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-2 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markBillAsUnpaid(bill.roomNumber)}
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
                  Room {selectedRoom.roomNumber} - Bill Details
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
                <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-6 rounded-xl border border-amber-200">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-gray-900">Bill Summary</h4>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center space-x-2 ${
                      selectedRoom.isPaid 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : 'bg-red-100 text-red-800 border-red-200'
                    }`}>
                      {selectedRoom.isPaid ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                      <span>{selectedRoom.isPaid ? 'PAID' : 'UNPAID'}</span>
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-gray-600">Total Orders:</span>
                      <p className="font-semibold text-lg">{selectedRoom.orders.length}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Last Order:</span>
                      <p className="font-semibold text-lg">{formatDate(selectedRoom.lastOrderDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Amount:</span>
                    <span className="text-3xl font-bold text-amber-600">₹{selectedRoom.totalAmount}</span>
                  </div>
                </div>

                {/* Customer Information */}
                {selectedRoom.orders.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3">Customer Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">{selectedRoom.orders[0].customerDetails.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-600" />
                        <span>{selectedRoom.orders[0].customerDetails.mobile}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-600" />
                        <span>Room {selectedRoom.orders[0].customerDetails.roomNumber}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders List */}
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-900 mb-3">Order History</h4>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedRoom.orders.map((order) => (
                      <div key={order.id} className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h5 className="font-semibold text-gray-900">Order #{order.id}</h5>
                            <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                          </div>
                          <span className="text-lg font-bold text-amber-600">₹{order.total}</span>
                        </div>
                        
                        <div className="space-y-1">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
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
                  {!selectedRoom.isPaid ? (
                    <button
                      onClick={() => markBillAsPaid(selectedRoom.roomNumber)}
                      className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span>Mark as Paid</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => markBillAsUnpaid(selectedRoom.roomNumber)}
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