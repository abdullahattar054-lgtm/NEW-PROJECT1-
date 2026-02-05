import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

// @desc    Get user wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            select: 'name price originalPrice discount images brand category ratings stock',
        });

        res.json({
            success: true,
            count: user.wishlist.length,
            data: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/v1/wishlist/add
// @access  Private
export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Validate productId is provided
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format',
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const user = await User.findById(req.user.id);

        // Check if product is already in wishlist
        if (user.wishlist.includes(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Product is already in your wishlist',
            });
        }

        // Add product to wishlist
        user.wishlist.push(productId);
        await user.save();

        // Populate wishlist for response
        await user.populate({
            path: 'wishlist',
            select: 'name price originalPrice discount images brand category ratings stock',
        });

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            count: user.wishlist.length,
            data: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/v1/wishlist/remove/:productId
// @access  Private
export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format',
            });
        }

        const user = await User.findById(req.user.id);

        // Check if product is in wishlist
        const productIndex = user.wishlist.indexOf(productId);
        if (productIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in wishlist',
            });
        }

        // Remove product from wishlist
        user.wishlist.splice(productIndex, 1);
        await user.save();

        // Populate wishlist for response
        await user.populate({
            path: 'wishlist',
            select: 'name price originalPrice discount images brand category ratings stock',
        });

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            count: user.wishlist.length,
            data: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Clear entire wishlist
// @route   DELETE /api/v1/wishlist/clear
// @access  Private
export const clearWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        user.wishlist = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared',
            count: 0,
            data: [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Check if product is in wishlist
// @route   GET /api/v1/wishlist/check/:productId
// @access  Private
export const checkWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format',
            });
        }

        const user = await User.findById(req.user.id);
        const isInWishlist = user.wishlist.includes(productId);

        res.status(200).json({
            success: true,
            data: { isInWishlist },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Toggle product in wishlist (add if not present, remove if present)
// @route   POST /api/v1/wishlist/toggle
// @access  Private
export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Validate productId is provided
        if (!productId) {
            return res.status(400).json({
                success: false,
                message: 'Product ID is required',
            });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID format',
            });
        }

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        const user = await User.findById(req.user.id);
        const productIndex = user.wishlist.indexOf(productId);
        let action;

        if (productIndex === -1) {
            // Product not in wishlist, add it
            user.wishlist.push(productId);
            action = 'added';
        } else {
            // Product in wishlist, remove it
            user.wishlist.splice(productIndex, 1);
            action = 'removed';
        }

        await user.save();

        // Populate wishlist for response
        await user.populate({
            path: 'wishlist',
            select: 'name price originalPrice discount images brand category ratings stock',
        });

        res.status(200).json({
            success: true,
            message: `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`,
            action,
            count: user.wishlist.length,
            data: user.wishlist,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
