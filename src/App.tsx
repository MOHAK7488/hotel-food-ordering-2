import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Hotel, Utensils, Clock, MapPin, Phone, Mail, User, History, CreditCard, ExternalLink, Coffee, Star, Heart, ChefHat, Sparkles, Settings } from 'lucide-react';
import RestaurantManager from './components/RestaurantManager';
import ManagerLogin from './components/ManagerLogin';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: 'breakfast' | 'lunch' | 'dinner' | 'beverages';
  image: string;
  veg: boolean;
  rating?: number;
  popular?: boolean;
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
    veg: true,
    rating: 4.8,
    popular: true
  },
  {
    id: 2,
    name: "Aloo Paratha",
    description: "Stuffed Indian flatbread with spiced potatoes, served with yogurt and pickle",
    price: 120,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560734/pexels-photo-5560734.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.6
  },
  {
    id: 3,
    name: "Poha",
    description: "Flattened rice with onions, mustard seeds, and curry leaves",
    price: 80,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.4
  },
  {
    id: 4,
    name: "Idli Sambar",
    description: "Steamed rice cakes served with lentil soup and coconut chutney",
    price: 100,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.7
  },
  {
    id: 5,
    name: "Chole Bhature",
    description: "Spicy chickpea curry with deep-fried bread, served with pickles and onions",
    price: 160,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.5,
    popular: true
  },
  {
    id: 6,
    name: "Upma",
    description: "Savory semolina porridge with vegetables and South Indian spices",
    price: 90,
    category: 'breakfast',
    image: 'https://images.pexels.com/photos/5560734/pexels-photo-5560734.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.2
  },
  
  // Lunch
  {
    id: 7,
    name: "Butter Chicken",
    description: "Tender chicken in rich tomato and cream sauce, served with basmati rice",
    price: 320,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.9,
    popular: true
  },
  {
    id: 8,
    name: "Paneer Makhani",
    description: "Cottage cheese cubes in creamy tomato gravy with aromatic spices",
    price: 280,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.7
  },
  {
    id: 9,
    name: "Chicken Biryani",
    description: "Fragrant basmati rice layered with spiced chicken and aromatic herbs",
    price: 350,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.8,
    popular: true
  },
  {
    id: 10,
    name: "Dal Tadka",
    description: "Yellow lentils tempered with ghee, cumin, and fresh herbs",
    price: 180,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.5
  },
  {
    id: 11,
    name: "Rogan Josh",
    description: "Kashmiri lamb curry with aromatic spices and rich gravy",
    price: 420,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.6
  },
  {
    id: 12,
    name: "Rajma Chawal",
    description: "Red kidney beans curry served with steamed basmati rice",
    price: 200,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.4
  },
  {
    id: 13,
    name: "Kadai Chicken",
    description: "Spicy chicken cooked with bell peppers and onions in kadai masala",
    price: 300,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.5
  },
  {
    id: 14,
    name: "Aloo Gobi",
    description: "Dry curry of potatoes and cauliflower with turmeric and spices",
    price: 160,
    category: 'lunch',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.3
  },
  
  // Dinner
  {
    id: 15,
    name: "Tandoori Chicken",
    description: "Clay oven roasted chicken marinated in yogurt and spices",
    price: 380,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.7,
    popular: true
  },
  {
    id: 16,
    name: "Palak Paneer",
    description: "Cottage cheese in creamy spinach gravy with Indian spices",
    price: 260,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.6
  },
  {
    id: 17,
    name: "Fish Curry",
    description: "Fresh fish cooked in coconut milk with South Indian spices",
    price: 340,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.5
  },
  {
    id: 18,
    name: "Naan & Curry Combo",
    description: "Choice of curry with fresh naan bread and basmati rice",
    price: 220,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.4
  },
  {
    id: 19,
    name: "Mutton Curry",
    description: "Tender mutton pieces cooked in rich onion and tomato gravy",
    price: 450,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.8
  },
  {
    id: 20,
    name: "Paneer Tikka",
    description: "Grilled cottage cheese cubes marinated in spices and yogurt",
    price: 240,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.5
  },
  {
    id: 21,
    name: "Chicken Tikka Masala",
    description: "Grilled chicken pieces in creamy tomato-based curry",
    price: 330,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: false,
    rating: 4.7
  },
  {
    id: 22,
    name: "Bhindi Masala",
    description: "Okra cooked with onions, tomatoes, and aromatic spices",
    price: 140,
    category: 'dinner',
    image: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.2
  },
  
  // Beverages
  {
    id: 23,
    name: "Masala Chai",
    description: "Traditional Indian spiced tea with cardamom, ginger, and cinnamon",
    price: 40,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1793037/pexels-photo-1793037.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.6,
    popular: true
  },
  {
    id: 24,
    name: "Filter Coffee",
    description: "South Indian style strong coffee with milk and sugar",
    price: 50,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.5
  },
  {
    id: 25,
    name: "Fresh Lime Soda",
    description: "Refreshing lime juice with soda water and mint",
    price: 60,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.3
  },
  {
    id: 26,
    name: "Mango Lassi",
    description: "Creamy yogurt drink blended with fresh mango pulp",
    price: 80,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.7,
    popular: true
  },
  {
    id: 27,
    name: "Virgin Mojito",
    description: "Refreshing mint and lime mocktail with soda water",
    price: 120,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.4
  },
  {
    id: 28,
    name: "Blue Lagoon Mocktail",
    description: "Blue curacao flavored refreshing drink with lemon and soda",
    price: 140,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.5
  },
  {
    id: 29,
    name: "Iced Tea",
    description: "Chilled black tea with lemon and mint",
    price: 70,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.2
  },
  {
    id: 30,
    name: "Fresh Orange Juice",
    description: "Freshly squeezed orange juice with pulp",
    price: 90,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.4
  },
  {
    id: 31,
    name: "Thandai",
    description: "Traditional Indian drink with milk, almonds, and aromatic spices",
    price: 100,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.3
  },
  {
    id: 32,
    name: "Coconut Water",
    description: "Fresh tender coconut water, naturally refreshing",
    price: 60,
    category: 'beverages',
    image: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=300',
    veg: true,
    rating: 4.1
  }
];

function App() {
  const [activeCategory, setActiveCategory] = useState<'breakfast' | 'lunch' | 'dinner' | 'beverages'>('breakfast');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    mobile: '',
    roomNumber: ''
  });
  const [showCart, setShowCart] = useState(false);
  const [showOrderHistory, setShowOrderHistory] = useState(false);
  const [showManagerLogin, setShowManagerLogin] = useState(false);
  const [showManager, setShowManager] = useState(false);
  const [isManagerAuthenticated, setIsManagerAuthenticated] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check manager authentication on component mount
  useEffect(() => {
    const checkManagerAuth = () => {
      const isAuthenticated = localStorage.getItem('managerAuthenticated');
      const loginTime = localStorage.getItem('managerLoginTime');
      
      if (isAuthenticated && loginTime) {
        const currentTime = new Date().getTime();
        const sessionDuration = 12 * 60 * 60 * 1000; // 12 hours in milliseconds
        const elapsedTime = currentTime - parseInt(loginTime);
        
        if (elapsedTime < sessionDuration) {
          setIsManagerAuthenticated(true);
        } else {
          // Session expired
          localStorage.removeItem('managerAuthenticated');
          localStorage.removeItem('managerLoginTime');
          setIsManagerAuthenticated(false);
        }
      }
    };

    checkManagerAuth();
  }, []);

  // Load data from localStorage and set up real-time updates
  useEffect(() => {
    const loadData = () => {
      const savedCart = localStorage.getItem('hotelCart');
      const savedOrders = localStorage.getItem('hotelOrders');
      const savedCustomerDetails = localStorage.getItem('hotelCustomerDetails');
      const savedFavorites = localStorage.getItem('hotelFavorites');
      
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      if (savedOrders) {
        setOrders(JSON.parse(savedOrders).map((order: any) => ({
          ...order,
          timestamp: new Date(order.timestamp)
        })));
      }
      if (savedCustomerDetails) {
        setCustomerDetails(JSON.parse(savedCustomerDetails));
      }
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    };

    // Load data initially
    loadData();

    // Set up interval to check for updates every second for real-time sync
    const interval = setInterval(loadData, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('hotelCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('hotelOrders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('hotelCustomerDetails', JSON.stringify(customerDetails));
  }, [customerDetails]);

  useEffect(() => {
    localStorage.setItem('hotelFavorites', JSON.stringify(favorites));
  }, [favorites]);

  const handleManagerLogin = () => {
    setIsManagerAuthenticated(true);
    setShowManagerLogin(false);
    setShowManager(true);
  };

  const handleManagerLogout = () => {
    setIsManagerAuthenticated(false);
    setShowManager(false);
    localStorage.removeItem('managerAuthenticated');
    localStorage.removeItem('managerLoginTime');
  };

  const handleManagerAccess = () => {
    if (isManagerAuthenticated) {
      setShowManager(true);
    } else {
      setShowManagerLogin(true);
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

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    if (customerDetails.name && customerDetails.mobile && customerDetails.roomNumber && cart.length > 0) {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newOrder: Order = {
        id: Date.now().toString(),
        items: [...cart],
        customerDetails: { ...customerDetails },
        total: getTotalPrice(),
        timestamp: new Date(),
        status: 'preparing',
        paymentMethod: 'Pay at Checkout'
      };
      
      setOrders(prevOrders => [newOrder, ...prevOrders]);
      setOrderPlaced(true);
      setCart([]);
      setIsLoading(false);
      
      setTimeout(() => {
        setOrderPlaced(false);
        setShowCart(false);
      }, 3000);
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'beverages': return <Coffee className="h-5 w-5" />;
      default: return <Utensils className="h-5 w-5" />;
    }
  };

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  // Show Manager Login if requested
  if (showManagerLogin) {
    return <ManagerLogin onLogin={handleManagerLogin} />;
  }

  // Show Restaurant Manager if authenticated and requested
  if (showManager && isManagerAuthenticated) {
    return <RestaurantManager onLogout={handleManagerLogout} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-xl sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Hotel className="h-8 w-8 text-amber-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  The Park Residency
                </h1>
                <p className="text-sm text-gray-600 flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-amber-500" />
                  Luxury & Comfort
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleManagerAccess}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-2 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Manager</span>
              </button>
              <a
                href="https://www.hoteltheparkresidency.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Hotel className="h-4 w-4" />
                <span className="hidden sm:inline">Book Room</span>
                <span className="sm:hidden">Book</span>
                <ExternalLink className="h-4 w-4" />
              </a>
              <button
                onClick={() => setShowOrderHistory(true)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <History className="h-5 w-5" />
                <span>Orders</span>
              </button>
              <button
                onClick={() => setShowCart(true)}
                className="relative bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 py-2 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs animate-bounce">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Room Service
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Delicious Indian cuisine delivered to your room
            </p>
            <div className="flex items-center justify-center space-x-8 text-amber-300 mb-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Utensils className="h-5 w-5" />
                <span>Fresh & Hot</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Coffee className="h-5 w-5" />
                <span>Beverages Available</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Clock className="h-5 w-5" />
                <span>30-45 mins</span>
              </div>
            </div>
            
            {/* Hotel Booking CTA in Hero */}
            <div className="mt-8">
              <a
                href="https://www.hoteltheparkresidency.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-8 py-4 rounded-2xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 text-lg font-semibold shadow-2xl hover:shadow-3xl transform hover:-translate-y-1"
              >
                <Hotel className="h-5 w-5" />
                <span>Book Room / Check Availability</span>
                <ExternalLink className="h-5 w-5" />
              </a>
              <p className="text-amber-200 mt-3 text-sm">
                Extend your stay or check room availability
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Categories */}
      <section className="py-8 bg-white/95 backdrop-blur-md sticky top-20 z-30 border-b border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-4 md:space-x-8 overflow-x-auto">
            {['breakfast', 'lunch', 'dinner', 'beverages'].map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category as any)}
                className={`flex items-center space-x-2 px-6 md:px-8 py-4 rounded-2xl font-semibold transition-all duration-300 whitespace-nowrap transform hover:-translate-y-1 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-lg'
                }`}
              >
                {getCategoryIcon(category)}
                <span>{category.charAt(0).toUpperCase() + category.slice(1)}</span>
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
              <div key={item.id} className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className="relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Popular Badge */}
                  {item.popular && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      <span>Popular</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-300 transform hover:scale-110"
                  >
                    <Heart 
                      className={`h-5 w-5 transition-colors duration-300 ${
                        favorites.includes(item.id) 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-400 hover:text-red-500'
                      }`} 
                    />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors duration-300">
                      {item.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.veg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {item.veg ? 'VEG' : 'NON-VEG'}
                    </span>
                  </div>
                  
                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center space-x-1 mb-3">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-semibold text-gray-700">{item.rating}</span>
                      <span className="text-xs text-gray-500">(50+ reviews)</span>
                    </div>
                  )}
                  
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 bg-clip-text text-transparent">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <Hotel className="h-8 w-8 text-amber-600" />
                <h3 className="text-xl font-bold">The Park Residency</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">Experience luxury and comfort with our world-class hospitality and authentic Indian cuisine.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-amber-600" />
                Contact Information
              </h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-4 w-4 mt-1 text-amber-600" />
                  <span>11/8/1, Tilak Rd, Tilak Nagar, Khurbura Mohalla, Dehradun, Uttarakhand 248001</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-amber-600" />
                  <span>+91-9837049353</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-amber-600" />
                  <span>theparkresidencyddn@gmail.com</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-amber-600" />
                Service Hours
              </h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Breakfast:</span>
                  <span>6:00 AM - 11:00 AM</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch:</span>
                  <span>12:00 PM - 4:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Dinner:</span>
                  <span>6:00 PM - 11:00 PM</span>
                </div>
                <div className="flex justify-between text-green-400">
                  <span>Beverages:</span>
                  <span>24/7 Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Your Order
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
              
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Your cart is empty</p>
                  <p className="text-gray-400 text-sm mt-2">Add some delicious items to get started!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.name}</h4>
                          <p className="text-amber-600 font-bold">₹{item.price}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Customer Details */}
                  <div className="space-y-4 mb-6">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <User className="h-5 w-5 mr-2 text-amber-600" />
                      Customer Details
                    </h4>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerDetails.name}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={customerDetails.mobile}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, mobile: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your mobile number"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Room Number
                      </label>
                      <input
                        type="text"
                        value={customerDetails.roomNumber}
                        onChange={(e) => setCustomerDetails(prev => ({ ...prev, roomNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                        placeholder="Enter your room number"
                      />
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <CreditCard className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">Payment Method</span>
                      </div>
                      <p className="text-gray-700 font-medium">Pay at Checkout</p>
                      <p className="text-sm text-gray-500 mt-1">You can pay with cash, UPI or Card at checkout.</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <span className="text-lg font-bold text-gray-900">Total:</span>
                    <span className="text-2xl font-bold text-amber-600">₹{getTotalPrice()}</span>
                  </div>
                  
                  <button
                    onClick={placeOrder}
                    disabled={!customerDetails.name || !customerDetails.mobile || !customerDetails.roomNumber || cart.length === 0 || isLoading}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Placing Order...</span>
                      </>
                    ) : (
                      <>
                        <ChefHat className="h-5 w-5" />
                        <span>Place Order</span>
                      </>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Order History
                </h3>
                <button
                  onClick={() => setShowOrderHistory(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  ✕
                </button>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No orders yet</p>
                  <p className="text-gray-400 text-sm mt-2">Your order history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="font-bold text-lg text-gray-900">Order #{order.id}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.timestamp)}</p>
                          <p className="text-sm text-gray-600">Room: {order.customerDetails.roomNumber}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(order.status)}`}>
                            {order.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <p className="text-sm text-gray-600 mt-2">
                            Payment: {order.paymentMethod}
                          </p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                            <span className="font-medium">{item.name} x{item.quantity}</span>
                            <span className="font-semibold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-amber-600">₹{order.total}</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl">
            <div className="text-green-600 mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Order Placed Successfully!</h3>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Your delicious meal will be delivered to room <span className="font-bold text-amber-600">{customerDetails.roomNumber}</span> within 30-45 minutes.
            </p>
            <div className="bg-gray-50 p-4 rounded-xl mb-4">
              <p className="text-sm text-gray-600">Payment: Pay at Checkout</p>
            </div>
            <p className="text-sm text-gray-500">Thank you for choosing The Park Residency!</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;