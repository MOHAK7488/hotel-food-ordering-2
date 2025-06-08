import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Hotel, Utensils, Clock, MapPin, Phone, Mail, User, History, CreditCard, ExternalLink } from 'lucide-react';
import { supabase, DatabaseOrder } from './lib/supabase';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner';
  image: string;
  veg: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CustomerDetails {
  name: string;
  mobile: string;
  roomNumber: string;
}

interface Order {
  id: string;
  items: CartItem[];
  customerDetails: CustomerDetails;
  total: number;
  timestamp: Date;
  status: 'preparing' | 'on-the-way' | 'delivered';
  paymentMethod: string;
}

const menuItems: MenuItem[] = [
  // Breakfast
  {
    id: 1,
    name: "Masala Dosa",
    description: "Crispy South Indian crepe with spiced potato filling, served with sambar and chutney",
    price: 180,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 2,
    name: "Aloo Paratha",
    description: "Stuffed Indian flatbread with spiced potatoes, served with yogurt and pickle",
    price: 120,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560734/pexels-photo-5560734.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 3,
    name: "Poha",
    description: "Flattened rice with onions, mustard seeds, and curry leaves",
    price: 80,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 4,
    name: "Idli Sambar",
    description: "Steamed rice cakes served with lentil soup and coconut chutney",
    price: 100,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  
  // Lunch
  {
    id: 5,
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato and cream sauce, served with basmati rice",
    price: 320,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false
  },
  {
    id: 6,
    name: "Paneer Makhani",
    description: "Cottage cheese cubes in creamy tomato gravy with aromatic spices",
    price: 280,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 7,
    name: "Biryani (Chicken)",
    description: "Fragrant basmati rice layered with spiced chicken and aromatic herbs",
    price: 350,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false
  },
  {
    id: 8,
    name: "Dal Tadka",
    description: "Yellow lentils tempered with ghee, cumin, and fresh herbs",
    price: 180,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 9,
    name: "Rogan Josh",
    description: "Kashmiri lamb curry with aromatic spices and rich gravy",
    price: 420,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false
  },
  
  // Dinner
  {
    id: 10,
    name: "Tandoori Chicken",
    description: "Clay oven roasted chicken marinated in yogurt and spices",
    price: 380,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false
  },
  {
    id: 11,
    name: "Palak Paneer",
    description: "Cottage cheese in creamy spinach gravy with Indian spices",
    price: 260,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  },
  {
    id: 12,
    name: "Fish Curry",
    description: "Fresh fish cooked in coconut milk with South Indian spices",
    price: 340,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false
  },
  {
    id: 13,
    name: "Naan & Curry Combo",
    description: "Choice of curry with fresh naan bread and basmati rice",
    price: 220,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true
  }
];

function App() {
  const [activeCategory, setActiveCategory] = useState<'breakfast' | 'lunch' | 'dinner'>('breakfast');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    roomNumber: ''
  });
  const [showCart, setShowCart] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('hotelCart');
    const savedCustomerDetails = localStorage.getItem('hotelCustomerDetails');
    
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedCustomerDetails) {
      setCustomerDetails(JSON.parse(savedCustomerDetails));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('hotelCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('hotelCustomerDetails', JSON.stringify(customerDetails));
  }, [customerDetails]);

  // Load orders from database when mobile number is available
  useEffect(() => {
    if (customerDetails.mobile && customerDetails.mobile.length >= 10) {
      loadOrdersFromDatabase(customerDetails.mobile);
    }
  }, [customerDetails.mobile]);

  const loadOrdersFromDatabase = async (mobile: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_mobile', mobile)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading orders:', error);
        return;
      }

      if (data) {
        const formattedOrders: Order[] = data.map((dbOrder: DatabaseOrder) => ({
          id: dbOrder.id,
          items: dbOrder.items,
          customerDetails: {
            name: dbOrder.customer_name,
            mobile: dbOrder.customer_mobile,
            roomNumber: dbOrder.room_number
          },
          total: dbOrder.total,
          timestamp: new Date(dbOrder.created_at),
          status: dbOrder.status,
          paymentMethod: dbOrder.payment_method
        }));
        setOrders(formattedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveOrderToDatabase = async (order: Order) => {
    try {
      const { error } = await supabase
        .from('orders')
        .insert({
          id: order.id,
          customer_name: order.customerDetails.name,
          customer_mobile: order.customerDetails.mobile,
          room_number: order.customerDetails.roomNumber,
          items: order.items,
          total: order.total,
          status: order.status,
          payment_method: order.paymentMethod,
          created_at: order.timestamp.toISOString()
        });

      if (error) {
        console.error('Error saving order:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error saving order to database:', error);
      throw error;
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity === 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== id));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (customerDetails.name && customerDetails.mobile && customerDetails.roomNumber && cart.length > 0) {
      try {
        setLoading(true);
        const newOrder: Order = {
          id: Date.now().toString(),
          items: [...cart],
          customerDetails: { ...customerDetails },
          total: getTotalPrice(),
          timestamp: new Date(),
          status: 'preparing',
          paymentMethod: 'Pay at Checkout'
        };
        
        // Save to database
        await saveOrderToDatabase(newOrder);
        
        // Update local state
        setOrders(prevOrders => [newOrder, ...prevOrders]);
        setOrderPlaced(true);
        setCart([]);
        
        setTimeout(() => {
          setOrderPlaced(false);
          setShowCart(false);
        }, 3000);
      } catch (error) {
        console.error('Error placing order:', error);
        alert('Failed to place order. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'on-the-way': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Hotel className="h-8 w-8 text-amber-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">The Park Residency</h1>
                <p className="text-sm text-gray-600">Luxury & Comfort</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="https://www.hoteltheparkresidency.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Hotel className="h-4 w-4" />
                <span className="hidden sm:inline">Book Room</span>
                <span className="sm:hidden">Book</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowOrderHistory(true)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <History className="h-5 w-5" />
                <span>Orders</span>
                {orders.length > 0 && (
                  <span className="bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors flex items-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Room Service</h2>
          <p className="text-xl mb-8">Delicious Indian cuisine delivered to your room</p>
          <div className="flex items-center justify-center space-x-6 text-amber-300">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>24/7 Service</span>
            </div>
            <div className="flex items-center space-x-2">
              <Utensils className="h-5 w-5" />
              <span>Fresh & Hot</span>
            </div>
          </div>
          
          {/* Hotel Booking CTA in Hero */}
          <div className="mt-8">
            <a
              href="https://www.hoteltheparkresidency.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold"
            >
              <Hotel className="h-5 w-5" />
              <span>Book Room / Check Availability</span>
              <ExternalLink className="h-5 w-5" />
            </a>
            <p className="text-amber-200 mt-2 text-sm">
              Extend your stay or check room availability
            </p>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-8 bg-white sticky top-20 z-30 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-8">
            {['breakfast', 'lunch', 'dinner'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as any)}
                className={`px-6 py-3 rounded-full font-semibold transition-all ${
                  activeCategory === category
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Items */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.veg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-amber-600">₹{item.price}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Hotel className="h-8 w-8 text-amber-600" />
                <h3 className="text-xl font-bold">The Park Residency</h3>
              </div>
              <p className="text-gray-400">Experience luxury and comfort with our world-class hospitality and authentic Indian cuisine.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>11/8/1, Tilak Rd, Tilak Nagar, Khurbura Mohalla, Dehradun, Uttarakhand 248001</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>+91-9837049353</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>theparkresidencyddn@gmail.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Room Service Hours</h4>
              <div className="space-y-2 text-gray-400">
                <div>Breakfast: 6:00 AM - 11:00 AM</div>
                <div>Lunch: 12:00 PM - 4:00 PM</div>
                <div>Dinner: 6:00 PM - 11:00 PM</div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Your Order</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b">
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-amber-600 font-semibold">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Customer Details */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900">Customer Details</h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="h-4 w-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="h-4 w-4 inline mr-1" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={customerDetails.mobile}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your mobile number"
                      />
                      {customerDetails.mobile && customerDetails.mobile.length >= 10 && orders.length > 0 && (
                        <p className="text-sm text-green-600 mt-1">
                          Found {orders.length} previous order{orders.length !== 1 ? 's' : ''} for this number
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Hotel className="h-4 w-4 inline mr-1" />
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={customerDetails.roomNumber}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, roomNumber: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your room number"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Payment Method</span>
                      </div>
                      <p className="text-gray-600 mt-1">Pay at Checkout</p>
                      <p className="text-sm text-gray-500 mt-1">You can pay with cash, UPI or card at checkout.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total: ₹{getTotalPrice()}</span>
                  </div>
                  
                  <button
                    onClick={placeOrder}
                    disabled={!customerDetails.name || !customerDetails.mobile || !customerDetails.roomNumber || cart.length === 0 || loading}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </div>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order History Modal */}
      {showOrderHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Order History</h3>
                <button
                  onClick={() => setShowOrderHistory(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              {!customerDetails.mobile ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">Enter your mobile number in the cart to view your order history</p>
                  <button
                    onClick={() => {
                      setShowOrderHistory(false);
                      setShowCart(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go to Cart
                  </button>
                </div>
              ) : loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading your orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No orders found for {customerDetails.mobile}</p>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {orders.length} order{orders.length !== 1 ? 's' : ''} for {customerDetails.mobile}
                  </p>
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-semibold">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                          <p className="text-sm text-gray-600">Room: {order.customerDetails.roomNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">
                            Payment: {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span>{item.name} x{item.quantity}</span>
                            <span>₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order Confirmation */}
      {orderPlaced && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-8 text-center max-w-sm w-full">
            <div className="text-green-600 mb-4">
              <svg className="h-16 w-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-4">Your delicious meal will be delivered to room {customerDetails.roomNumber} within 30-45 minutes.</p>
            <p className="text-sm text-gray-500">Payment: Pay at Checkout</p>
            <p className="text-sm text-gray-500 mt-2">Thank you for choosing The Park Residency!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;