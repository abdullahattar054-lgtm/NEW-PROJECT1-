import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/v1/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const { category, minPrice, maxPrice, brand, search, sort, page = 1, limit = 12 } = req.query;

        // Build query
        let query = { status: 'active' };

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (brand) {
            query.brand = brand;
        }

        if (search) {
            query.$text = { $search: search };
        }

        // Sort
        let sortOption = {};
        if (sort === 'price-asc') sortOption.price = 1;
        else if (sort === 'price-desc') sortOption.price = -1;
        else if (sort === 'newest') sortOption.createdAt = -1;
        else if (sort === 'popular') sortOption['ratings.count'] = -1;
        else sortOption.createdAt = -1;

        // Pagination
        const skip = (page - 1) * limit;

        const products = await Product.find(query)
            .sort(sortOption)
            .limit(Number(limit))
            .skip(skip);

        const total = await Product.countDocuments(query);

        res.json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            pages: Math.ceil(total / limit),
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate({
            path: 'reviews',
            populate: { path: 'user', select: 'name avatar' },
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Create product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// @desc    Get products by category
// @route   GET /api/v1/products/category/:category
// @access  Public
export const getProductsByCategory = async (req, res) => {
    try {
        const products = await Product.find({
            category: req.params.category,
            status: 'active',
        });

        res.json({
            success: true,
            count: products.length,
            data: products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
