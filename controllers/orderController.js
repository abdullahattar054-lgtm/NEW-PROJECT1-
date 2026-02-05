import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Create new order
// @route   POST /api/v1/orders
// @access  Private
export const createOrder = async (req, res) => {
    try {
        const { shippingAddress, paymentMethod, paymentResult } = req.body;

        const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty',
            });
        }

        // Create order items from cart
        const orderItems = cart.items.map((item) => ({
            product: item.product._id,
            name: item.product.name,
            image: item.product.images[0],
            quantity: item.quantity,
            price: item.price,
            color: item.color,
        }));

        // Calculate prices
        const subtotal = cart.totalPrice;
        const shippingCost = subtotal > 100 ? 0 : 10;
        const tax = subtotal * 0.1; // 10% tax
        const totalAmount = subtotal + shippingCost + tax;

        // Create order
        const order = await Order.create({
            user: req.user.id,
            items: orderItems,
            shippingAddress,
            paymentMethod,
            paymentResult,
            subtotal,
            shippingCost,
            tax,
            totalAmount,
            paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        });

        // Update product stock with error handling
        try {
            const stockUpdates = cart.items.map(item =>
                Product.findByIdAndUpdate(item.product._id, {
                    $inc: { stock: -item.quantity },
                })
            );
            await Promise.all(stockUpdates);
        } catch (stockError) {
            // Rollback: Delete order if stock update fails
            await Order.findByIdAndDelete(order._id);
            return res.status(500).json({
                success: false,
                message: 'Stock update failed. Order cancelled.',
            });
        }

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get user orders
// @route   GET /api/v1/orders
// @access  Private
export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single order
// @route   GET /api/v1/orders/:id
// @access  Private
export const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        // Make sure user owns this order or is admin
        if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this order',
            });
        }

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update order status
// @route   PUT /api/v1/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
            });
        }

        if (orderStatus) order.orderStatus = orderStatus;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        if (orderStatus === 'delivered') {
            order.deliveredAt = Date.now();
        }

        await order.save();

        res.json({
            success: true,
            data: order,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get all orders (admin)
// @route   GET /api/v1/orders/admin/all
// @access  Private/Admin
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

        res.json({
            success: true,
            count: orders.length,
            totalRevenue,
            data: orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
