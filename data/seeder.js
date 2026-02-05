import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { sampleProducts } from './sampleProducts.js';
import connectDB from '../config/db.js';

dotenv.config();

const seedDatabase = async () => {
    try {
        await connectDB();

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
        console.log('   Admin: admin@tech.pk / Admin@123');
        console.log('   User: user@tech.pk / User@123');

        // Create products
        await Product.insertMany(sampleProducts);

        console.log('✅ Created 15 sample products');
        console.log('   - 5 Headphones');
        console.log('   - 5 Earbuds');
        console.log('   - 5 Smartwatches');

        console.log('\n🎉 Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
