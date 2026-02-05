# TECH.PK Backend API

Premium Electronics E-Commerce Platform - Backend API

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Product Management**: Full CRUD operations for products with filtering, search, and pagination
- **Shopping Cart**: Real-time cart management with stock validation
- **Order Processing**: Complete order flow from cart to delivery tracking
- **Review System**: Product reviews with automatic rating calculations
- **Admin Panel**: Dashboard statistics and management tools
- **Security**: Password hashing, input validation, error handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd tech-pk-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/techpk
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRE=30d
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   mongod
   ```

5. **Seed the database** (Optional but recommended)
   ```bash
   npm run seed
   ```
   
   This will create:
   - Admin user: `admin@tech.pk` / `Admin@123`
   - Test user: `user@tech.pk` / `User@123`
   - 15 sample products (5 headphones, 5 earbuds, 5 smartwatches)

6. **Start the server**
   
   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api/v1
```

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| GET | `/auth/me` | Get current user | Private |
| PUT | `/auth/update-profile` | Update user profile | Private |
| PUT | `/auth/update-password` | Change password | Private |
| POST | `/auth/address` | Add shipping address | Private |

### Product Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | Get all products (with filters) | Public |
| GET | `/products/:id` | Get single product | Public |
| GET | `/products/category/:category` | Get products by category | Public |
| POST | `/products` | Create product | Admin |
| PUT | `/products/:id` | Update product | Admin |
| DELETE | `/products/:id` | Delete product | Admin |

### Cart Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/cart` | Get user cart | Private |
| POST | `/cart/add` | Add item to cart | Private |
| PUT | `/cart/update/:itemId` | Update cart item | Private |
| DELETE | `/cart/remove/:itemId` | Remove item from cart | Private |
| DELETE | `/cart/clear` | Clear cart | Private |

### Order Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/orders` | Create new order | Private |
| GET | `/orders` | Get user orders | Private |
| GET | `/orders/:id` | Get single order | Private |
| PUT | `/orders/:id/status` | Update order status | Admin |
| GET | `/orders/admin/all` | Get all orders | Admin |

### Review Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/reviews/products/:id/reviews` | Add review | Private |
| GET | `/reviews/products/:id/reviews` | Get product reviews | Public |
| PUT | `/reviews/:id` | Update review | Private |
| DELETE | `/reviews/:id` | Delete review | Private/Admin |

### Admin Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/admin/stats` | Get dashboard statistics | Admin |
| GET | `/admin/users` | Get all users | Admin |
| PUT | `/admin/users/:id` | Update user role | Admin |
| DELETE | `/admin/users/:id` | Delete user | Admin |

## 🔐 Authentication

All protected routes require a JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📦 Project Structure

```
tech-pk-backend/
├── config/
│   └── db.js                 # MongoDB connection
├── models/
│   ├── User.js              # User model
│   ├── Product.js           # Product model
│   ├── Cart.js              # Cart model
│   ├── Order.js             # Order model
│   └── Review.js            # Review model
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── productController.js # Product CRUD
│   ├── cartController.js    # Cart management
│   ├── orderController.js   # Order processing
│   ├── reviewController.js  # Review management
│   └── adminController.js   # Admin operations
├── routes/
│   ├── authRoutes.js        # Auth endpoints
│   ├── productRoutes.js     # Product endpoints
│   ├── cartRoutes.js        # Cart endpoints
│   ├── orderRoutes.js       # Order endpoints
│   ├── reviewRoutes.js      # Review endpoints
│   └── adminRoutes.js       # Admin endpoints
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   ├── adminMiddleware.js   # Admin authorization
│   ├── errorMiddleware.js   # Error handling
│   └── validationMiddleware.js # Input validation
├── utils/
│   └── generateToken.js     # JWT token generation
├── data/
│   ├── sampleProducts.js    # Sample data
│   └── seeder.js            # Database seeder
├── server.js                # Main entry point
├── package.json
└── .env.example
```

## 🧪 Testing

Test the API using:
- **Postman**: Import the endpoints and test manually
- **cURL**: Command-line testing
- **Frontend Application**: Connect the React frontend

Example login request:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@tech.pk","password":"User@123"}'
```

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with sample data

## 📝 License

MIT

## 👨‍💻 Author

TECH.PK Team
