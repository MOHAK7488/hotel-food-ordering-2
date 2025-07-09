import React, { useState, useEffect } from 'react';
import { ChefHat, Phone, Shield, User, Clock, Star, MapPin, Plus, Minus, ShoppingCart, X, CreditCard, Utensils, Bed, Wifi, Car, Dumbbell, ExternalLink, Search } from 'lucide-react';
import ManagerLogin from './components/ManagerLogin';
import RestaurantManager from './components/RestaurantManager';
import OrderHistory from './components/OrderHistory';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  veg: boolean;
  image: string;
  popular?: boolean;
  spicy?: boolean;
  disabled?: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface CustomerDetails {
  name: string;
  mobile: string;
  roomNumber: string;
}

function App() {
  const [currentView, setCurrentView] = useState<'home' | 'manager-login' | 'manager-dashboard' | 'order-history' | 'food-ordering'>('home');
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    roomNumber: ''
  });
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load menu items from localStorage
  useEffect(() => {
    const savedMenu = localStorage.getItem('hotelMenuItems');
    if (savedMenu) {
      const parsedMenu = JSON.parse(savedMenu);
      setMenuItems(parsedMenu);
    } else {
      // Initialize with default menu items if none exist
      const defaultMenuItems: MenuItem[] = [
        {
          id: 1,
          name: "Paneer Tikka",
          price: 280,
          description: "Marinated cottage cheese cubes grilled to perfection with aromatic spices",
          category: "Starters",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true
        },
        {
          id: 2,
          name: "Chicken Tikka",
          price: 320,
          description: "Tender chicken pieces marinated in yogurt and spices, grilled in tandoor",
          category: "Starters",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true,
          spicy: true
        },
        {
          id: 3,
          name: "Vegetable Spring Rolls",
          price: 220,
          description: "Crispy rolls filled with fresh vegetables and served with sweet chili sauce",
          category: "Starters",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 4,
          name: "Fish Amritsari",
          price: 380,
          description: "Crispy fried fish marinated with traditional Punjabi spices",
          category: "Starters",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          spicy: true
        },
        {
          id: 5,
          name: "Butter Chicken",
          price: 420,
          description: "Creamy tomato-based curry with tender chicken pieces and aromatic spices",
          category: "Main Course",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true
        },
        {
          id: 6,
          name: "Dal Makhani",
          price: 280,
          description: "Rich and creamy black lentils slow-cooked with butter and cream",
          category: "Main Course",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true
        },
        {
          id: 7,
          name: "Biryani (Chicken)",
          price: 380,
          description: "Fragrant basmati rice cooked with tender chicken and aromatic spices",
          category: "Main Course",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true,
          spicy: true
        },
        {
          id: 8,
          name: "Palak Paneer",
          price: 320,
          description: "Fresh cottage cheese cubes in a creamy spinach gravy",
          category: "Main Course",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 9,
          name: "Mutton Rogan Josh",
          price: 480,
          description: "Tender mutton cooked in aromatic Kashmiri spices and yogurt",
          category: "Main Course",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          spicy: true
        },
        {
          id: 10,
          name: "Butter Naan",
          price: 80,
          description: "Soft and fluffy bread brushed with butter, baked in tandoor",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 11,
          name: "Garlic Naan",
          price: 90,
          description: "Naan bread topped with fresh garlic and herbs",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 12,
          name: "Tandoori Roti",
          price: 60,
          description: "Whole wheat bread baked in traditional tandoor",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 13,
          name: "Masala Chai",
          price: 60,
          description: "Traditional Indian tea brewed with aromatic spices",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 14,
          name: "Fresh Lime Soda",
          price: 80,
          description: "Refreshing lime juice with soda and mint",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 15,
          name: "Mango Lassi",
          price: 120,
          description: "Creamy yogurt drink blended with fresh mango",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 16,
          name: "Gulab Jamun",
          price: 140,
          description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
          category: "Desserts",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        },
        {
          id: 17,
          name: "Kulfi",
          price: 100,
          description: "Traditional Indian ice cream flavored with cardamom and pistachios",
          category: "Desserts",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400"
        }
      ];
      setMenuItems(defaultMenuItems);
      localStorage.setItem('hotelMenuItems', JSON.stringify(defaultMenuItems));
    }
  }, []);

  // Listen for menu updates from MenuManager
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMenu = localStorage.getItem('hotelMenuItems');
      if (savedMenu) {
        const parsedMenu = JSON.parse(savedMenu);
        setMenuItems(parsedMenu);
      }
    };

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also check for updates every second (for same-tab updates)
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Check manager authentication on app load
  useEffect(() => {
    const managerAuth = localStorage.getItem('managerAuthenticated');
    const loginTime = localStorage.getItem('managerLoginTime');
    
    if (managerAuth === 'true' && loginTime) {
      const currentTime = new Date().getTime();
      const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours
      const elapsedTime = currentTime - parseInt(loginTime);
      
      if (elapsedTime < sessionDuration) {
        setIsManagerAuthenticated(true);
      } else {
        localStorage.removeItem('managerAuthenticated');
        localStorage.removeItem('managerLoginTime');
      }
    }
  }, []);

  // Filter out disabled items for customers
  const availableMenuItems = menuItems.filter(item => !item.disabled);
  const categories = ['All', ...Array.from(new Set(availableMenuItems.map(item => item.category)))];

  // Apply filters: category, search term
  const filteredItems = availableMenuItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

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

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(cartItem =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prevCart.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0 || !customerDetails.name || !customerDetails.mobile || !customerDetails.roomNumber) return;

    const order = {
      id: Date.now().toString(),
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        veg: item.veg
      })),
      customerDetails: customerDetails,
      total: getCartTotal(),
      timestamp: new Date(),
      status: 'new',
      paymentMethod: 'Pay at checkout on reception using UPI, cash or card'
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('hotelOrders') || '[]');
    existingOrders.push(order);
    localStorage.setItem('hotelOrders', JSON.stringify(existingOrders));

    // Clear cart and close checkout
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setCustomerDetails({ name: '', mobile: '', roomNumber: '' });

    alert('Order placed successfully! You will receive updates on your order status.');
  };

  const handleManagerLogin = () => {
    setIsManagerAuthenticated(true);
    setCurrentView('manager-dashboard');
  };

  const handleManagerLogout = () => {
    setIsManagerAuthenticated(false);
    setCurrentView('home');
  };

  const handleBookRoom = () => {
    window.open('https://www.hoteltheparkresidency.com/', '_blank');
  };

  // Home Page
  if (currentView === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                    The Park Residency
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Premium Room Service Experience</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentView('food-ordering')}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Order Food</span>
                  <span className="sm:hidden">Order</span>
                </button>
                <button
                  onClick={handleBookRoom}
                  className="bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Book Room</span>
                  <span className="sm:hidden">Book</span>
                  <ExternalLink className="h-2 w-2 sm:h-3 sm:w-3" />
                </button>
                <button
                  onClick={() => setCurrentView('order-history')}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden lg:inline">Order History</span>
                  <span className="lg:hidden">History</span>
                </button>
                <button
                  onClick={() => setCurrentView('manager-login')}
                  className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-3 py-2 sm:px-6 sm:py-2 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Manager</span>
                  <span className="sm:hidden">Admin</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-12 sm:py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-red-600/10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-4 sm:mb-6 animate-fade-in">
                Exquisite Dining
              </h2>
              <p className="text-base sm:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed animate-fade-in px-4">
                Experience the finest Indian cuisine delivered directly to your room. Our master chefs craft each dish with authentic spices and premium ingredients, ensuring an unforgettable culinary journey.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-8 sm:mb-12 animate-fade-in">
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">24/7 Room Service</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">5-Star Quality</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="font-semibold text-gray-800 text-sm sm:text-base">Room Delivery</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 sm:py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Choose Our Room Service?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto px-4">
                We combine traditional Indian flavors with modern convenience to deliver an exceptional dining experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Expert Chefs</h4>
                <p className="text-gray-600 text-sm sm:text-base">Our master chefs bring decades of experience in authentic Indian cuisine.</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Quick Delivery</h4>
                <p className="text-gray-600 text-sm sm:text-base">Fresh, hot meals delivered to your room within 30-45 minutes.</p>
              </div>
              
              <div className="text-center p-4 sm:p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Premium Quality</h4>
                <p className="text-gray-600 text-sm sm:text-base">Only the finest ingredients and traditional cooking methods.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Hotel Amenities */}
        <section className="py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Hotel Amenities</h3>
              <p className="text-gray-600 max-w-2xl mx-auto px-4">
                Enjoy world-class facilities and services during your stay at The Park Residency.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Wifi className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-800">Free WiFi</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Car className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-800">Parking</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-800">Fitness Center</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <Bed className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-800">Luxury Rooms</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 sm:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-amber-500" />
                  <h4 className="text-lg sm:text-xl font-bold">The Park Residency</h4>
                </div>
                <p className="text-gray-400 text-sm sm:text-base">
                  Experience luxury and comfort with our premium room service and world-class amenities.
                </p>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-semibold mb-4">Contact Info</h5>
                <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                  <p>📍 11/8/1, Tilak Nagar, Khurbura Mohalla, Dehradun, Uttarakhand 248001</p>
                  <p>📞 +91-9837049353</p>
                  <p>✉️ theparkresidencyddn@gmail.com</p>
                </div>
              </div>
              <div>
                <h5 className="text-base sm:text-lg font-semibold mb-4">Service Hours</h5>
                <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                  <p>🍽️ Room Service: 8:00 AM - 11:00 PM</p>
                  <p>💪 Gym: 5:00 AM - 11:00 PM</p>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-gray-400">
              <p className="text-sm sm:text-base">&copy; 2025 The Park Residency. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Manager Login
  if (currentView === 'manager-login') {
    return (
      <ManagerLogin 
        onLogin={handleManagerLogin}
        onBack={() => setCurrentView('home')}
      />
    );
  }

  // Manager Dashboard
  if (currentView === 'manager-dashboard' && isManagerAuthenticated) {
    return <RestaurantManager onLogout={handleManagerLogout} />;
  }

  // Order History
  if (currentView === 'order-history') {
    return (
      <OrderHistory 
        onBack={() => setCurrentView('home')}
      />
    );
  }

  // Food Ordering Page (Main ordering interface)
  if (currentView === 'food-ordering') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-50 border-b border-orange-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                    The Park Residency
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Room Service Menu</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setCurrentView('home')}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">Back to Home</span>
                  <span className="sm:hidden">Home</span>
                </button>
                <button
                  onClick={() => setShowCart(true)}
                  className="relative bg-gradient-to-r from-green-600 to-green-700 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                >
                  <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Cart</span>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center text-xs animate-bounce">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Search and Category Filter */}
        <section className="py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Search Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="relative max-w-2xl mx-auto">
                <Search className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search for dishes, ingredients, or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base bg-white/90 backdrop-blur-sm shadow-lg"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {searchTerm && (
                <div className="text-center mt-4">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {filteredItems.length} dish{filteredItems.length !== 1 ? 'es' : ''} found for "{searchTerm}"
                  </p>
                </div>
              )}
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mb-6 sm:mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setSearchTerm(''); // Clear search when selecting category
                  }}
                  className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:-translate-y-1 text-xs sm:text-sm ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results Info */}
            {(searchTerm || selectedCategory !== 'All') && (
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm sm:text-base">
                  Showing {filteredItems.length} dish{filteredItems.length !== 1 ? 'es' : ''}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                </p>
              </div>
            )}

            {/* Menu Items */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No dishes found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm 
                    ? `No dishes match "${searchTerm}". Try searching for something else.`
                    : 'No dishes available in this category.'
                  }
                </p>
                {(searchTerm || selectedCategory !== 'All') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('All');
                    }}
                    className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    View All Dishes
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-36 sm:h-48 object-cover"
                      />
                      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 flex flex-wrap gap-1 sm:gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          item.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.veg ? '🌱 VEG' : '🍖 NON-VEG'}
                        </span>
                        {item.popular && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                            ⭐ POPULAR
                          </span>
                        )}
                        {item.spicy && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                            🌶️ SPICY
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">{item.description}</p>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xl sm:text-2xl font-bold text-amber-600">₹{item.price}</span>
                        
                        {cart.find(cartItem => cartItem.id === item.id) ? (
                          <div className="flex items-center space-x-2 sm:space-x-3 bg-green-50 rounded-xl px-2 sm:px-3 py-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="font-bold text-green-800 min-w-[20px] text-center text-sm sm:text-base">
                              {cart.find(cartItem => cartItem.id === item.id)?.quantity}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className="bg-gradient-to-r from-amber-600 to-red-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-xl hover:from-amber-700 hover:to-red-700 transition-all duration-300 flex items-center space-x-1 sm:space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm"
                          >
                            <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            <span>Add</span>
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

        {/* Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-auto shadow-2xl">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                    Your Cart ({getCartItemCount()} items)
                  </h3>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg">Your cart is empty</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-2">Add some delicious items to get started!</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 sm:p-4 rounded-xl">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{item.name}</h4>
                            <p className="text-amber-600 font-bold text-sm sm:text-base">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                            >
                              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="font-bold text-gray-800 min-w-[20px] text-center text-sm sm:text-base">{item.quantity}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors duration-300"
                            >
                              <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <span className="font-bold text-gray-900 ml-2 sm:ml-4 min-w-[60px] sm:min-w-[80px] text-right text-sm sm:text-base">
                              ₹{item.price * item.quantity}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 mb-4 sm:mb-6">
                      <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span>Total:</span>
                        <span className="text-amber-600">₹{getCartTotal()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowCheckout(true);
                      }}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
                    >
                      Proceed to Checkout
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Checkout Modal */}
        {showCheckout && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
              <div className="p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                    Checkout
                  </h3>
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handlePlaceOrder(); }} className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium text-sm sm:text-base">
                        +91
                      </span>
                      <input
                        type="tel"
                        value={customerDetails.mobile}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          if (value.length <= 10) {
                            setCustomerDetails(prev => ({ ...prev, mobile: value }));
                          }
                        }}
                        className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                        placeholder="Enter 10-digit mobile number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      value={customerDetails.roomNumber}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, roomNumber: e.target.value }))}
                      className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="e.g., 101, 205, 312"
                      required
                    />
                  </div>

                  <div className="bg-gray-50 p-3 sm:p-4 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">Order Summary</h4>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between text-xs sm:text-sm">
                          <span>{item.name} x{item.quantity}</span>
                          <span className="font-semibold">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t mt-3 pt-3 flex justify-between font-bold text-sm sm:text-base">
                      <span>Total:</span>
                      <span className="text-amber-600">₹{getCartTotal()}</span>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 sm:p-4 rounded-xl">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 text-sm sm:text-base">Payment Method</span>
                    </div>
                    <p className="text-blue-800 text-xs sm:text-sm font-medium">Pay at checkout on reception using UPI, cash or card</p>
                  </div>

                  <button
                    type="submit"
                    disabled={!customerDetails.name || !customerDetails.mobile || !customerDetails.roomNumber}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none text-sm sm:text-base"
                  >
                    Place Order (₹{getCartTotal()})
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default App;