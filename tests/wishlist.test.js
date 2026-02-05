import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

let mongoServer;
let authToken;
let testUser;
let testProduct;

beforeAll(async () => {
    // Disconnect from any existing connection
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Create in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

beforeEach(async () => {
    // Clear database before each test
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create test user
    testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Test@123',
    });

    // Create test product
    testProduct = await Product.create({
        name: 'Test Headphones',
        description: 'Premium wireless headphones',
        category: 'Headphones',
        price: 199,
        brand: 'TestBrand',
        stock: 50,
    });

    // Login to get auth token
    const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'test@example.com', password: 'Test@123' });
    
    authToken = loginRes.body.token;
});

describe('Wishlist API', () => {
    describe('GET /api/v1/wishlist', () => {
        it('should return empty wishlist for new user', async () => {
            const res = await request(app)
                .get('/api/v1/wishlist')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual([]);
            expect(res.body.count).toBe(0);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/v1/wishlist');

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('POST /api/v1/wishlist/add', () => {
        it('should add product to wishlist and return 200', async () => {
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Product added to wishlist');
            expect(res.body.count).toBe(1);
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].name).toBe('Test Headphones');
        });

        it('should return 400 if product already in wishlist', async () => {
            // Add product first
            await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            // Try to add again
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product is already in your wishlist');
        });

        it('should return 400 if productId is missing', async () => {
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product ID is required');
        });

        it('should return 400 for invalid productId format', async () => {
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: 'invalid-id' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Invalid product ID format');
        });

        it('should return 404 for non-existent product', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: fakeId.toString() });

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product not found');
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .post('/api/v1/wishlist/add')
                .send({ productId: testProduct._id.toString() });

            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });
    });

    describe('DELETE /api/v1/wishlist/remove/:productId', () => {
        it('should remove product from wishlist', async () => {
            // Add product first
            await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            // Remove product
            const res = await request(app)
                .delete(`/api/v1/wishlist/remove/${testProduct._id.toString()}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Product removed from wishlist');
            expect(res.body.count).toBe(0);
        });

        it('should return 404 if product not in wishlist', async () => {
            const res = await request(app)
                .delete(`/api/v1/wishlist/remove/${testProduct._id.toString()}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(404);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Product not found in wishlist');
        });
    });

    describe('POST /api/v1/wishlist/toggle', () => {
        it('should add product if not in wishlist', async () => {
            const res = await request(app)
                .post('/api/v1/wishlist/toggle')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.action).toBe('added');
            expect(res.body.count).toBe(1);
        });

        it('should remove product if already in wishlist', async () => {
            // Add product first
            await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            // Toggle (should remove)
            const res = await request(app)
                .post('/api/v1/wishlist/toggle')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.action).toBe('removed');
            expect(res.body.count).toBe(0);
        });
    });

    describe('GET /api/v1/wishlist/check/:productId', () => {
        it('should return false if product not in wishlist', async () => {
            const res = await request(app)
                .get(`/api/v1/wishlist/check/${testProduct._id.toString()}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isInWishlist).toBe(false);
        });

        it('should return true if product is in wishlist', async () => {
            // Add product first
            await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            const res = await request(app)
                .get(`/api/v1/wishlist/check/${testProduct._id.toString()}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.isInWishlist).toBe(true);
        });
    });

    describe('DELETE /api/v1/wishlist/clear', () => {
        it('should clear entire wishlist', async () => {
            // Add product first
            await request(app)
                .post('/api/v1/wishlist/add')
                .set('Authorization', `Bearer ${authToken}`)
                .send({ productId: testProduct._id.toString() });

            // Clear wishlist
            const res = await request(app)
                .delete('/api/v1/wishlist/clear')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe('Wishlist cleared');
            expect(res.body.count).toBe(0);
        });
    });
});
