# Hotel Food Ordering System

A comprehensive hotel room service ordering system built with React, TypeScript, and Supabase.

## Features

### 🍽️ Customer Features
- **Browse Menu**: View categorized menu with search functionality
- **Place Orders**: Add items to cart and place orders with room details
- **Order Tracking**: Real-time order status updates
- **Order History**: View past orders and payment status
- **Payment Tracking**: See total, paid, and remaining amounts

### 👨‍💼 Manager Features
- **Order Management**: View and update order status in real-time
- **Menu Management**: Add, edit, disable, and remove menu items
- **Room Billing**: Track customer bills by room and mobile number
- **Real-time Notifications**: Audio and visual alerts for new orders
- **Analytics Dashboard**: View daily statistics and revenue

### 🗄️ Database Features
- **PostgreSQL Database**: Powered by Supabase
- **Real-time Updates**: Live synchronization across all users
- **Secure Access**: Row Level Security (RLS) policies
- **Data Persistence**: All data stored in cloud database
- **Backup & Recovery**: Automatic database backups

## Database Setup

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project"
3. Sign up/Login with GitHub
4. Click "New Project"
5. Choose organization and enter project details:
   - **Name**: `hotel-food-ordering`
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your location
6. Click "Create new project"

### Step 2: Get Database Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

### Step 3: Configure Environment Variables
1. Create a `.env` file in your project root
2. Add your Supabase credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 4: Run Database Migration
1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New Query"
3. Copy the contents of `supabase/migrations/create_tables.sql`
4. Paste and click "Run"
5. This will create all necessary tables and insert sample menu data

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Local Development
1. **Clone the repository**
```bash
git clone <repository-url>
cd hotel-food-ordering
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Copy the example env file
cp .env.example .env

# Edit .env with your Supabase credentials
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173`

## Database Schema

### Tables

#### `menu_items`
- `id` - Primary key
- `name` - Dish name
- `price` - Price in rupees
- `description` - Dish description
- `category` - Food category (Starters, Main Course, etc.)
- `veg` - Vegetarian flag
- `image` - Image URL
- `popular` - Popular item flag
- `spicy` - Spicy item flag
- `disabled` - Disabled status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

#### `orders`
- `id` - Order ID (string)
- `items` - Order items (JSON)
- `customer_details` - Customer info (JSON)
- `total` - Total amount
- `timestamp` - Order timestamp
- `status` - Order status (new/preparing/ready/delivered)
- `payment_method` - Payment method
- `bill_paid` - Payment status

#### `room_bills`
- `id` - Bill ID (room-mobile combination)
- `room_number` - Room number
- `customer_name` - Customer name
- `customer_mobile` - Customer mobile
- `total_amount` - Total bill amount
- `is_paid` - Payment status
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## API Integration

The application uses custom React hooks for database operations:

### `useMenuItems()`
- Load menu items
- Add new items
- Update existing items
- Delete items
- Toggle item status

### `useOrders()`
- Load orders
- Create new orders
- Update order status
- Get orders by mobile number

### `useRoomBills()`
- Load room bills
- Create/update bills
- Update payment status

## Real-time Features

- **Live Order Updates**: Managers see new orders instantly
- **Menu Synchronization**: Menu changes reflect across all users
- **Status Updates**: Order status changes in real-time
- **Notification System**: Audio and visual alerts for managers

## Security

- **Row Level Security**: Database-level security policies
- **Environment Variables**: Sensitive data stored securely
- **Input Validation**: All user inputs validated
- **SQL Injection Protection**: Parameterized queries

## Manager Credentials

**Username**: `ashish`  
**Password**: `hotel@321`

## Deployment

### Netlify Deployment
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard
4. Enable continuous deployment from Git

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify Supabase connection in the database status indicator
3. Ensure environment variables are correctly set
4. Check Supabase dashboard for database issues

## License

This project is licensed under the MIT License.