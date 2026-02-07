import User from '../models/User.js';
import Product from '../models/Product.js';
import { sampleProducts } from './sampleProducts.js';
import connectDB from '../config/db.js';
import mongoose from 'mongoose';

export const seedDatabase = async () => {
    try {
        await connectDB();

        // Wait for connection to be ready
        let retries = 10;
        while (mongoose.connection.readyState !== 1 && retries > 0) {
            console.log(`[Seeder] Waiting for DB... ${retries}`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retries--;
        }

        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection failed');
        }

        // ONLY clear and seed products to avoid potential user conflict errors
        await Product.deleteMany();
        console.log('🗑️  Cleared existing products');

        await Product.insertMany(sampleProducts);
        console.log('✅ Created products with variants');

        return { success: true, message: 'Products restored with color variants successfully!' };
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    }
};

// Only run immediately if this file is run directly
if (process.argv[1]?.includes('seeder.js')) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}
