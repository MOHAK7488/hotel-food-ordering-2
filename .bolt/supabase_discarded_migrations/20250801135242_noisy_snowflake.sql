/*
  # Hotel Food Ordering System Database Schema

  1. New Tables
    - `menu_items` - Restaurant menu items with categories and pricing
    - `orders` - Customer orders with items and status tracking  
    - `room_bills` - Room-wise billing for customers

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a hotel system)
    - Add indexes for performance

  3. Features
    - Real-time subscriptions for live updates
    - JSON storage for order items and customer details
    - Automatic timestamps
    - Status tracking for orders
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  veg BOOLEAN NOT NULL DEFAULT true,
  image TEXT NOT NULL,
  popular BOOLEAN DEFAULT false,
  spicy BOOLEAN DEFAULT false,
  disabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  items JSONB NOT NULL,
  customer_details JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'delivered')),
  payment_method TEXT NOT NULL,
  bill_paid BOOLEAN DEFAULT false
);

-- Create room_bills table
CREATE TABLE IF NOT EXISTS room_bills (
  id TEXT PRIMARY KEY,
  room_number TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_bills ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (hotel system)
CREATE POLICY "Allow public read access on menu_items"
  ON menu_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on menu_items"
  ON menu_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on menu_items"
  ON menu_items
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on menu_items"
  ON menu_items
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on orders"
  ON orders
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on orders"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on orders"
  ON orders
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on room_bills"
  ON room_bills
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on room_bills"
  ON room_bills
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on room_bills"
  ON room_bills
  FOR UPDATE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_disabled ON menu_items(disabled);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_customer_mobile ON orders USING GIN ((customer_details->>'mobile'));
CREATE INDEX IF NOT EXISTS idx_room_bills_room_number ON room_bills(room_number);
CREATE INDEX IF NOT EXISTS idx_room_bills_customer_mobile ON room_bills(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_room_bills_is_paid ON room_bills(is_paid);

-- Insert default menu items
INSERT INTO menu_items (name, price, description, category, veg, image, popular, spicy) VALUES
('Paneer Tikka', 280, 'Marinated cottage cheese cubes grilled to perfection with aromatic spices', 'Starters', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', true, false),
('Chicken Tikka', 320, 'Tender chicken pieces marinated in yogurt and spices, grilled in tandoor', 'Starters', false, 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400', true, true),
('Vegetable Spring Rolls', 220, 'Crispy rolls filled with fresh vegetables and served with sweet chili sauce', 'Starters', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Fish Amritsari', 380, 'Crispy fried fish marinated with traditional Punjabi spices', 'Starters', false, 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400', false, true),
('Butter Chicken', 420, 'Creamy tomato-based curry with tender chicken pieces and aromatic spices', 'Main Course', false, 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400', true, false),
('Dal Makhani', 280, 'Rich and creamy black lentils slow-cooked with butter and cream', 'Main Course', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', true, false),
('Biryani (Chicken)', 380, 'Fragrant basmati rice cooked with tender chicken and aromatic spices', 'Main Course', false, 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400', true, true),
('Palak Paneer', 320, 'Fresh cottage cheese cubes in a creamy spinach gravy', 'Main Course', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Mutton Rogan Josh', 480, 'Tender mutton cooked in aromatic Kashmiri spices and yogurt', 'Main Course', false, 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=400', false, true),
('Butter Naan', 80, 'Soft and fluffy bread brushed with butter, baked in tandoor', 'Breads', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Garlic Naan', 90, 'Naan bread topped with fresh garlic and herbs', 'Breads', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Tandoori Roti', 60, 'Whole wheat bread baked in traditional tandoor', 'Breads', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Masala Chai', 60, 'Traditional Indian tea brewed with aromatic spices', 'Beverages', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Fresh Lime Soda', 80, 'Refreshing lime juice with soda and mint', 'Beverages', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Mango Lassi', 120, 'Creamy yogurt drink blended with fresh mango', 'Beverages', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Gulab Jamun', 140, 'Soft milk dumplings soaked in rose-flavored sugar syrup', 'Desserts', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false),
('Kulfi', 100, 'Traditional Indian ice cream flavored with cardamom and pistachios', 'Desserts', true, 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=400', false, false)
ON CONFLICT (id) DO NOTHING;