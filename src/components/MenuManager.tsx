import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon,
  ChefHat,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowLeft
} from 'lucide-react';

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
  createdAt?: Date;
  updatedAt?: Date;
}

interface MenuManagerProps {
  onBack: () => void;
}

const MenuManager: React.FC<MenuManagerProps> = ({ onBack }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<MenuItem | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // Form state for adding/editing items
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Main Course',
    veg: true,
    image: '',
    popular: false,
    spicy: false
  });

  const categories = ['Starters', 'Main Course', 'Breads', 'Beverages', 'Desserts'];

  // Load menu items from localStorage
  useEffect(() => {
    const savedMenu = localStorage.getItem('hotelMenuItems');
    if (savedMenu) {
      const parsedMenu = JSON.parse(savedMenu).map((item: any) => ({
        ...item,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date()
      }));
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
          popular: true,
          createdAt: new Date(),
          updatedAt: new Date()
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
          spicy: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 3,
          name: "Vegetable Spring Rolls",
          price: 220,
          description: "Crispy rolls filled with fresh vegetables and served with sweet chili sauce",
          category: "Starters",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 4,
          name: "Fish Amritsari",
          price: 380,
          description: "Crispy fried fish marinated with traditional Punjabi spices",
          category: "Starters",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          spicy: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 5,
          name: "Butter Chicken",
          price: 420,
          description: "Creamy tomato-based curry with tender chicken pieces and aromatic spices",
          category: "Main Course",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 6,
          name: "Dal Makhani",
          price: 280,
          description: "Rich and creamy black lentils slow-cooked with butter and cream",
          category: "Main Course",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          popular: true,
          createdAt: new Date(),
          updatedAt: new Date()
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
          spicy: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 8,
          name: "Palak Paneer",
          price: 320,
          description: "Fresh cottage cheese cubes in a creamy spinach gravy",
          category: "Main Course",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 9,
          name: "Mutton Rogan Josh",
          price: 480,
          description: "Tender mutton cooked in aromatic Kashmiri spices and yogurt",
          category: "Main Course",
          veg: false,
          image: "https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400",
          spicy: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 10,
          name: "Butter Naan",
          price: 80,
          description: "Soft and fluffy bread brushed with butter, baked in tandoor",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 11,
          name: "Garlic Naan",
          price: 90,
          description: "Naan bread topped with fresh garlic and herbs",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 12,
          name: "Tandoori Roti",
          price: 60,
          description: "Whole wheat bread baked in traditional tandoor",
          category: "Breads",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 13,
          name: "Masala Chai",
          price: 60,
          description: "Traditional Indian tea brewed with aromatic spices",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 14,
          name: "Fresh Lime Soda",
          price: 80,
          description: "Refreshing lime juice with soda and mint",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 15,
          name: "Mango Lassi",
          price: 120,
          description: "Creamy yogurt drink blended with fresh mango",
          category: "Beverages",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 16,
          name: "Gulab Jamun",
          price: 140,
          description: "Soft milk dumplings soaked in rose-flavored sugar syrup",
          category: "Desserts",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 17,
          name: "Kulfi",
          price: 100,
          description: "Traditional Indian ice cream flavored with cardamom and pistachios",
          category: "Desserts",
          veg: true,
          image: "https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      setMenuItems(defaultMenuItems);
      localStorage.setItem('hotelMenuItems', JSON.stringify(defaultMenuItems));
    }
  }, []);

  // Filter items based on search, category, and status
  useEffect(() => {
    let filtered = menuItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Filter by status
    if (statusFilter === 'active') {
      filtered = filtered.filter(item => !item.disabled);
    } else if (statusFilter === 'disabled') {
      filtered = filtered.filter(item => item.disabled);
    }

    setFilteredItems(filtered);
  }, [menuItems, searchTerm, selectedCategory, statusFilter]);

  const saveMenuItems = (items: MenuItem[]) => {
    setMenuItems(items);
    localStorage.setItem('hotelMenuItems', JSON.stringify(items));
  };

  const handleAddItem = () => {
    if (!formData.name || !formData.price || !formData.description || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      description: formData.description,
      category: formData.category,
      veg: formData.veg,
      image: formData.image,
      popular: formData.popular,
      spicy: formData.spicy,
      disabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedItems = [...menuItems, newItem];
    saveMenuItems(updatedItems);
    setShowAddModal(false);
    resetForm();
  };

  const handleEditItem = () => {
    if (!editingItem || !formData.name || !formData.price || !formData.description || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }

    const updatedItems = menuItems.map(item =>
      item.id === editingItem.id
        ? {
            ...item,
            name: formData.name,
            price: parseFloat(formData.price),
            description: formData.description,
            category: formData.category,
            veg: formData.veg,
            image: formData.image,
            popular: formData.popular,
            spicy: formData.spicy,
            updatedAt: new Date()
          }
        : item
    );

    saveMenuItems(updatedItems);
    setEditingItem(null);
    resetForm();
  };

  const handleDeleteItem = (item: MenuItem) => {
    const updatedItems = menuItems.filter(menuItem => menuItem.id !== item.id);
    saveMenuItems(updatedItems);
    setShowDeleteConfirm(null);
  };

  const toggleItemStatus = (item: MenuItem) => {
    const updatedItems = menuItems.map(menuItem =>
      menuItem.id === item.id
        ? { ...menuItem, disabled: !menuItem.disabled, updatedAt: new Date() }
        : menuItem
    );
    saveMenuItems(updatedItems);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: 'Main Course',
      veg: true,
      image: '',
      popular: false,
      spicy: false
    });
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      description: item.description,
      category: item.category,
      veg: item.veg,
      image: item.image,
      popular: item.popular || false,
      spicy: item.spicy || false
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real application, you would upload this to a server
      // For now, we'll create a local URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({ ...prev, image: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getStats = () => {
    const totalItems = menuItems.length;
    const activeItems = menuItems.filter(item => !item.disabled).length;
    const disabledItems = menuItems.filter(item => item.disabled).length;
    const vegItems = menuItems.filter(item => item.veg && !item.disabled).length;
    const nonVegItems = menuItems.filter(item => !item.veg && !item.disabled).length;

    return { totalItems, activeItems, disabledItems, vegItems, nonVegItems };
  };

  const stats = getStats();

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
                  <ChefHat className="h-8 w-8 text-orange-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Menu Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Add, edit, and manage restaurant menu items
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5" />
              <span>Add New Dish</span>
            </button>
          </div>
        </div>
      </header>

      {/* Stats Dashboard */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ChefHat className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-3xl font-bold text-green-600">{stats.activeItems}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Disabled</p>
                  <p className="text-3xl font-bold text-red-600">{stats.disabledItems}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <EyeOff className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Veg Items</p>
                  <p className="text-3xl font-bold text-green-600">{stats.vegItems}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <span className="text-green-600 font-bold text-lg">🌱</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Non-Veg</p>
                  <p className="text-3xl font-bold text-red-600">{stats.nonVegItems}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-full">
                  <span className="text-red-600 font-bold text-lg">🍖</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search dishes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 w-full sm:w-80"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-5 w-5 text-gray-600" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  >
                    <option value="All">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'disabled')}
                  className="border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                >
                  <option value="all">All Items</option>
                  <option value="active">Active Items</option>
                  <option value="disabled">Disabled Items</option>
                </select>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="text-center py-16">
              <ChefHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Items Found</h3>
              <p className="text-gray-600">No menu items match your current filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border ${
                    item.disabled ? 'border-red-200 opacity-75' : 'border-gray-100'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className={`w-full h-48 object-cover ${item.disabled ? 'grayscale' : ''}`}
                    />
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
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
                    {item.disabled && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold">
                          DISABLED
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <p className="text-sm text-gray-500 mb-4">Category: {item.category}</p>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-2xl font-bold text-orange-600">₹{item.price}</span>
                      <button
                        onClick={() => toggleItemStatus(item)}
                        className={`p-2 rounded-full transition-all duration-300 ${
                          item.disabled 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-red-100 text-red-600 hover:bg-red-200'
                        }`}
                        title={item.disabled ? 'Enable item' : 'Disable item'}
                      >
                        {item.disabled ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Edit3 className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        onClick={() => setShowDeleteConfirm(item)}
                        className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-2 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add/Edit Modal */}
      {(showAddModal || editingItem) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  {editingItem ? 'Edit Dish' : 'Add New Dish'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); editingItem ? handleEditItem() : handleAddItem(); }} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dish Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter dish name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                    placeholder="Enter dish description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.veg ? 'veg' : 'non-veg'}
                      onChange={(e) => setFormData(prev => ({ ...prev, veg: e.target.value === 'veg' }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      required
                    >
                      <option value="veg">Vegetarian</option>
                      <option value="non-veg">Non-Vegetarian</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image *
                  </label>
                  <div className="space-y-4">
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                      placeholder="Enter image URL or upload below"
                    />
                    
                    <div className="text-center">
                      <span className="text-gray-500">OR</span>
                    </div>
                    
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-orange-500 transition-colors duration-300">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">Click to upload image</p>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                      </label>
                    </div>
                    
                    {formData.image && (
                      <div className="mt-4">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-xl"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="popular"
                      checked={formData.popular}
                      onChange={(e) => setFormData(prev => ({ ...prev, popular: e.target.checked }))}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="popular" className="ml-2 block text-sm text-gray-900">
                      Mark as Popular
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="spicy"
                      checked={formData.spicy}
                      onChange={(e) => setFormData(prev => ({ ...prev, spicy: e.target.checked }))}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="spicy" className="ml-2 block text-sm text-gray-900">
                      Mark as Spicy
                    </label>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingItem(null);
                      resetForm();
                    }}
                    className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-3 px-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-5 w-5" />
                    <span>{editingItem ? 'Update Dish' : 'Add Dish'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Delete Dish
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to permanently delete "{showDeleteConfirm.name}"? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-xl hover:bg-gray-700 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteItem(showDeleteConfirm)}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;