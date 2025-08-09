/*
  # Hotel Food Ordering System Database Schema

  1. New Tables
    - `menu_items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `price` (numeric)
      - `description` (text)
      - `category` (text)
      - `veg` (boolean)
      - `image` (text)
      - `popular` (boolean)
      - `spicy` (boolean)
      - `disabled` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `orders`
      - `id` (text, primary key)
      - `customer_name` (text)
      - `customer_mobile` (text)
      - `room_number` (text)
      - `total` (numeric)
      - `status` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `order_items`
      - `id` (uuid, primary key)
      - `order_id` (text, foreign key)
      - `menu_item_id` (uuid, foreign key)
      - `quantity` (integer)
      - `price` (numeric)
      - `created_at` (timestamp)
    
    - `room_bills`
      - `id` (uuid, primary key)
      - `bill_id` (text, unique)
      - `room_number` (text)
      - `customer_name` (text)
      - `customer_mobile` (text)
      - `total_amount` (numeric)
      - `is_paid` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access (since this is a hotel system)
*/

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  price numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  veg boolean DEFAULT true,
  image text NOT NULL,
  popular boolean DEFAULT false,
  spicy boolean DEFAULT false,
  disabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id text PRIMARY KEY,
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  room_number text NOT NULL,
  total numeric NOT NULL,
  status text DEFAULT 'new' CHECK (status IN ('new', 'preparing', 'ready', 'delivered')),
  payment_method text DEFAULT 'Pay at checkout on reception using UPI, cash or card',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id uuid NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  menu_item_name text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  price numeric NOT NULL,
  veg boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create room_bills table
CREATE TABLE IF NOT EXISTS room_bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id text UNIQUE NOT NULL,
  room_number text NOT NULL,
  customer_name text NOT NULL,
  customer_mobile text NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  is_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
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

CREATE POLICY "Allow public delete on orders"
  ON orders
  FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access on order_items"
  ON order_items
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert on order_items"
  ON order_items
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update on order_items"
  ON order_items
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete on order_items"
  ON order_items
  FOR DELETE
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

CREATE POLICY "Allow public delete on room_bills"
  ON room_bills
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_room_mobile ON orders(room_number, customer_mobile);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_disabled ON menu_items(disabled);
CREATE INDEX IF NOT EXISTS idx_room_bills_bill_id ON room_bills(bill_id);
CREATE INDEX IF NOT EXISTS idx_room_bills_room_mobile ON room_bills(room_number, customer_mobile);

-- Insert default menu items
INSERT INTO menu_items (name, price, description, category, veg, image, popular, spicy) VALUES
('Paneer Tikka', 280, 'Marinated cottage cheese cubes grilled to perfection with aromatic spices', 'Starters', true, 'https://t4.ftcdn.net/jpg/05/20/08/67/360_F_520086700_0fYFa0RIaZCcSpH0zDcVNjzHm2NKcih1.jpg', true, false),
('Chicken Tikka', 320, 'Tender chicken pieces marinated in yogurt and spices, grilled in tandoor', 'Starters', false, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3e_07ATCc94ypo04FWBOqbjFFfw3FijtpHA&s', true, true),
('Vegetable Spring Rolls', 220, 'Crispy rolls filled with fresh vegetables and served with sweet chili sauce', 'Starters', true, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjN8NkuHeKUXKy1Rjer7IxwH-DgpOrplIxtg&s', false, false),
('Fish Amritsari', 380, 'Crispy fried fish marinated with traditional Punjabi spices', 'Starters', false, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSceHCm-rW5hVzHIDIJ9t3SmJPwmc6-gtjQ3w&s', false, true),
('Butter Chicken', 420, 'Creamy tomato-based curry with tender chicken pieces and aromatic spices', 'Main Course', false, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbcwxfgt5uIr4MlF8PLy48NI1rvX37Q8gq5w&s', true, false),
('Dal Makhani', 280, 'Rich and creamy black lentils slow-cooked with butter and cream', 'Main Course', true, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0682ESG4X3hRMUEvcTCeob4kv2ZU7QVqBXw&s', true, false),
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
ON CONFLICT DO NOTHING;