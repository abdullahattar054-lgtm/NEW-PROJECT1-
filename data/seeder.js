import dotenv from 'dotenv';
dotenv.config();
import User from '../models/User.js';
import Product from '../models/Product.js';
import { sampleProducts } from './sampleProducts.js';
import connectDB from '../config/db.js';

export const seedDatabase = async () => {
    try {
        await connectDB();

        // Wait for connection to be ready if it's still connecting
        let retries = 5;
        while (mongoose.connection.readyState !== 1 && retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            retries--;
        }

        if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection failed to reach ready state');
        }

        // Clear existing data
        await User.deleteMany();
        await Product.deleteMany();

        console.log('🗑️  Cleared existing data');

        // Create admin user
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@tech.pk',
            password: 'Admin@123',
            role: 'admin',
        });

        // Create regular user
        const user = await User.create({
            name: 'Test User',
            email: 'user@tech.pk',
            password: 'User@123',
            role: 'user',
        });

        console.log('✅ Created users');

        // Create products
        await Product.insertMany(sampleProducts);

        console.log('✅ Created products with variants');

        return { success: true, message: 'Database seeded successfully!' };
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
