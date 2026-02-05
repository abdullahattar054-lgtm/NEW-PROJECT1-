import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderNumber: {
            type: String,
            unique: true,
        },
        items: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                },
                name: String,
                image: String,
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                },
                color: String,
            },
        ],
        shippingAddress: {
            name: {
                type: String,
                required: true,
            },
            phone: {
                type: String,
                required: true,
            },
            street: {
                type: String,
                required: true,
            },
            city: {
                type: String,
                required: true,
            },
            state: {
                type: String,
                required: true,
            },
            zipCode: {
                type: String,
                required: true,
            },
            country: {
                type: String,
                required: true,
            },
        },
        paymentMethod: {
            type: String,
            required: true,
            enum: ['card', 'paypal', 'cod'],
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed'],
            default: 'pending',
        },
        orderStatus: {
            type: String,
            enum: ['processing', 'shipped', 'delivered', 'cancelled'],
            default: 'processing',
        },
        subtotal: {
            type: Number,
            required: true,
            default: 0,
        },
        shippingCost: {
            type: Number,
            default: 0,
        },
        tax: {
            type: Number,
            default: 0,
        },
        discount: {
            type: Number,
            default: 0,
        },
        totalAmount: {
            type: Number,
            required: true,
        },
        paymentResult: {
            id: String,
            status: String,
            update_time: String,
        },
        deliveredAt: Date,
    },
    {
        timestamps: true,
    }
);

// Generate order number before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.orderNumber = `TP-${timestamp}-${random}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
