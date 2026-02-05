import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Add review to product
// @route   POST /api/v1/products/:id/reviews
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { rating, title, comment } = req.body;
        const productId = req.params.id;

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Check if user already reviewed this product
        const existingReview = await Review.findOne({
            product: productId,
            user: req.user.id,
        });

        if (existingReview) {
            return res.status(400).json({
                success: false,
                message: 'You have already reviewed this product',
            });
        }

        const review = await Review.create({
            product: productId,
            user: req.user.id,
            rating,
            title,
            comment,
        });

        // Add review to product
        product.reviews.push(review._id);
        await product.save();

        res.status(201).json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get product reviews
// @route   GET /api/v1/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            data: reviews,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
export const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Make sure user owns this review
        if (review.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this review',
            });
        }

        const { rating, title, comment } = req.body;

        // Validate rating if provided
        if (rating !== undefined) {
            if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
                return res.status(400).json({
                    success: false,
                    message: 'Rating must be an integer between 1 and 5',
                });
            }
            review.rating = rating;
        }

        if (title) review.title = title.trim();
        if (comment) review.comment = comment.trim();

        await review.save();

        res.json({
            success: true,
            data: review,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found',
            });
        }

        // Make sure user owns this review or is admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this review',
            });
        }

        await review.deleteOne();

        res.json({
            success: true,
            message: 'Review deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
