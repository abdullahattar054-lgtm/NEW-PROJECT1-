import dotenv from 'dotenv';
// Load env vars at the absolute top
dotenv.config();

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { errorHandler } from './middleware/errorMiddleware.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

// Load env vars
dotenv.config();

// Create app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Connect DB
connectDB();

// DB Middleware to ensure connection before processing
const dbMiddleware = async (req, res, next) => {
    // Skip DB check for OPTIONS (CORS preflight) and non-API routes
    if (req.method === 'OPTIONS' || !req.originalUrl.startsWith('/api') || req.originalUrl === '/api/health') {
        return next();
    }

    try {
        await connectDB();
        if (mongoose.connection.readyState !== 1) {
            return res.status(503).json({
                success: false,
                message: 'Database not ready. Please try again in 2 seconds.'
            });
        }
    } catch (err) {
        console.error('DB Middleware Error:', err);
    }
    next();
};

import mongoose from 'mongoose';
app.use(dbMiddleware);

// CORS - CRITICAL FIX
const allowedOrigins = [
    'https://tech-pk-first.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            if (
                allowedOrigins.indexOf(origin) !== -1 ||
                origin.includes('vercel.app') ||
                origin.includes('localhost')
            ) {
                return callback(null, true);
            } else {
                console.log('❌ CORS blocked:', origin);
                return callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    })
);

app.options('*', cors());

// Security
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        contentSecurityPolicy: false,
    })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Sanitize
// app.use(mongoSanitize());
// app.use(xss());

// Rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
});
// app.use('/api', limiter);

// Logging
app.use((req, res, next) => {
    console.log(`📡 [${req.method}] ${req.originalUrl}`);
    next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/wishlist', wishlistRoutes);

// Root
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'TECH.PK API Running',
        version: '1.0.0',
    });
});

// Health
app.get('/api/health', async (req, res) => {
    res.json({
        status: 'ok',
        db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        readyState: mongoose.connection.readyState,
        timestamp: new Date().toISOString()
    });
});

// 404
app.use('/api/*', (req, res) => {
    res.status(404).json({ success: false, message: `Not found: ${req.originalUrl}` });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server on port ${PORT}`);
    });
}

export default app;