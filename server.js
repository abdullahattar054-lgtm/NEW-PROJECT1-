import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Set security headers
app.use(helmet());

// Body parser middleware
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize data
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Debug Logging Middleware
app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.originalUrl}`);
    next();
});

// CORS middleware
app.use(
    cors({
        origin: '*',
        credentials: false,
    })
);
app.options('*', cors());

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to TECH.PK API',
        version: '1.0.0',
    });
});

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`
      ╔═══════════════════════════════════════════════════════╗
      ║                                                       ║
      ║   🚀 TECH.PK API Server Running                      ║
      ║   📡 Port: ${PORT}                                    ║
      ║   🌍 Environment: ${process.env.NODE_ENV || 'development'}            ║
      ║                                                       ║
      ╚═══════════════════════════════════════════════════════╝
      `);
    });
}

export default app;
