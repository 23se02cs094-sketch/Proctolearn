const Product = require('../Product');
const Category = require('../Category');
const User = require('../User');
const mongoose = require('mongoose');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getAdminIds = async () => {
    const adminUsers = await User.find({ role: 'admin' }).select('_id');
    return adminUsers.map((admin) => admin._id);
};

// @desc    Get all products with filtering, sorting, pagination
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const queryObj = { ...req.query };
        const excludeFields = ['page', 'sort', 'limit', 'fields', 'search', 'category', 'minPrice', 'maxPrice'];
        excludeFields.forEach(el => delete queryObj[el]);

        // Build filter query
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        let filter = JSON.parse(queryStr);

        // Add isActive filter
        filter.isActive = true;
        filter.createdBy = { $in: adminIds };

        // Search functionality
        if (req.query.search) {
            const normalizedSearch = String(req.query.search).trim();
            if (normalizedSearch) {
                const searchRegex = new RegExp(escapeRegex(normalizedSearch), 'i');
                filter.$or = [
                    { name: searchRegex },
                    { description: searchRegex },
                    { tags: searchRegex }
                ];
            }
        }

        // Category filter
        if (req.query.category && mongoose.Types.ObjectId.isValid(req.query.category)) {
            filter.category = req.query.category;
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
        }

        // Build query
        let query = Product.find(filter).populate('category', 'name');

        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        } else {
            query = query.sort('-createdAt');
        }

        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }

        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;
        const total = await Product.countDocuments(filter);

        query = query.skip(startIndex).limit(limit);

        const products = await query;

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const product = await Product.findById(req.params.id)
            .where('createdBy').in(adminIds)
            .populate('category', 'name description')
            .populate('createdBy', 'name');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: error.message
        });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const limit = parseInt(req.query.limit, 10) || 8;

        const products = await Product.find({
            isFeatured: true,
            isActive: true,
            createdBy: { $in: adminIds }
        })
            .populate('category', 'name')
            .limit(limit);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching featured products',
            error: error.message
        });
    }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 12;
        const startIndex = (page - 1) * limit;

        const filter = {
            category: req.params.categoryId,
            isActive: true,
            createdBy: { $in: adminIds }
        };

        const total = await Product.countDocuments(filter);
        const products = await Product.find(filter)
            .populate('category', 'name')
            .skip(startIndex)
            .limit(limit)
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: error.message
        });
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
exports.searchProducts = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a search query'
            });
        }

        const normalizedSearch = String(q).trim();
        const searchRegex = new RegExp(escapeRegex(normalizedSearch), 'i');

        const products = await Product.find({
            isActive: true,
            createdBy: { $in: adminIds },
            $or: [
                { name: searchRegex },
                { description: searchRegex },
                { tags: searchRegex }
            ]
        })
            .populate('category', 'name')
            .limit(20);

        res.status(200).json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error searching products',
            error: error.message
        });
    }
};

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = async (req, res) => {
    try {
        const adminIds = await getAdminIds();
        const product = await Product.findById(req.params.id)
            .where('createdBy').in(adminIds);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const relatedProducts = await Product.find({
            category: product.category,
            _id: { $ne: product._id },
            isActive: true,
            createdBy: { $in: adminIds }
        })
            .populate('category', 'name')
            .limit(4);

        res.status(200).json({
            success: true,
            count: relatedProducts.length,
            data: relatedProducts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching related products',
            error: error.message
        });
    }
};
