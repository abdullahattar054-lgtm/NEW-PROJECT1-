import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please provide a product name'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Please provide a product description'],
        },
        category: {
            type: String,
            required: [true, 'Please provide a category'],
            enum: ['Headphones', 'Earbuds', 'Smartwatches'],
        },
        price: {
            type: Number,
            required: [true, 'Please provide a price'],
            min: 0,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },
        brand: {
            type: String,
            required: [true, 'Please provide a brand'],
        },
        images: [
            {
                type: String,
            },
        ],
        colors: [
            {
                name: String,
                value: String,
                images: [
                    {
                        type: String,
                    },
                ],
            },
        ],
        stock: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        specifications: {
            type: Map,
            of: String,
            default: {},
        },
        ratings: {
            average: {
                type: Number,
                default: 0,
                min: 0,
                max: 5,
            },
            count: {
                type: Number,
                default: 0,
            },
        },
        reviews: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Review',
            },
        ],
        featured: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    {
        timestamps: true,
    }
);

// Index for search
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

const Product = mongoose.model('Product', productSchema);

export default Product;
