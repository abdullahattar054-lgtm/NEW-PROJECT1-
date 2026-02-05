import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

// @desc    Get user cart
// @route   GET /api/v1/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/v1/cart/add
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, color } = req.body;

        // Validate quantity
        if (!quantity || quantity < 1 || !Number.isInteger(quantity)) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a positive integer',
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock',
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = await Cart.create({ user: req.user.id, items: [] });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId && item.color === color
        );

        if (existingItemIndex > -1) {
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            // Check total quantity against stock
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add ${quantity}. Only ${product.stock - cart.items[existingItemIndex].quantity} items available`,
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            cart.items.push({
                product: productId,
                quantity,
                price: product.price,
                color,
            });
        }

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update cart item
// @route   PUT /api/v1/cart/update/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        const item = cart.items.id(req.params.itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart',
            });
        }

        item.quantity = quantity;
        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/v1/cart/remove/:itemId
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);

        await cart.save();
        await cart.populate('items.product');

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/v1/cart/clear
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found',
            });
        }

        cart.items = [];
        await cart.save();

        res.json({
            success: true,
            data: cart,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
