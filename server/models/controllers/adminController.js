const User = require('../User');
const Product = require('../Product');
const Category = require('../Category');
const Order = require('../Order');
const Shipping = require('../Shipping');
const Review = require('../Review');
const sendEmail = require('../mails/sendEmail');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

const VALID_ORDER_STATUSES = [
    'Pending',
    'Processing',
    'Confirmed',
    'Shipped',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Returned'
];

const VALID_SHIPPING_STATUSES = [
    'Pending',
    'Picked Up',
    'Shipped',
    'In Transit',
    'Out for Delivery',
    'Delivered',
    'Failed',
    'Cancelled',
    'Returned'
];

const ACTIVE_ORDER_STATUSES = ['Processing', 'Confirmed', 'Shipped', 'In Transit', 'Out for Delivery'];

const ORDER_TO_SHIPPING_STATUS_MAP = {
    Processing: 'Pending',
    Confirmed: 'Picked Up',
    Shipped: 'Shipped',
    'In Transit': 'In Transit',
    'Out for Delivery': 'Out for Delivery',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Returned: 'Returned'
};

const SHIPPING_TO_ORDER_STATUS_MAP = {
    Shipped: 'Shipped',
    'In Transit': 'In Transit',
    'Out for Delivery': 'Out for Delivery',
    Delivered: 'Delivered',
    Cancelled: 'Cancelled',
    Returned: 'Returned'
};

const normalizeFiles = (files) => (Array.isArray(files) ? files : [files]);

const parseBooleanValue = (value, defaultValue = true) => {
    if (value === undefined || value === null || value === '') return defaultValue;
    if (typeof value === 'boolean') return value;
    return String(value).toLowerCase() === 'true';
};

const parseProductVariants = (rawVariants) => {
    if (rawVariants === undefined || rawVariants === null || rawVariants === '') {
        return { hasVariantsField: false, variants: [] };
    }

    let parsed = rawVariants;
    if (typeof rawVariants === 'string') {
        try {
            parsed = JSON.parse(rawVariants);
        } catch (error) {
            return { hasVariantsField: true, variants: [] };
        }
    }

    if (!Array.isArray(parsed)) {
        return { hasVariantsField: true, variants: [] };
    }

    const variants = parsed
        .map((variant) => {
            const rawPrice = variant?.price;
            const rawStock = variant?.stock;
            const rawComparePrice = variant?.comparePrice;

            const parsedPrice = rawPrice === '' || rawPrice === undefined || rawPrice === null ? NaN : Number(rawPrice);
            const parsedStock = rawStock === '' || rawStock === undefined || rawStock === null ? NaN : Number(rawStock);
            const parsedComparePrice = rawComparePrice === '' || rawComparePrice === undefined || rawComparePrice === null
                ? 0
                : Number(rawComparePrice);

            return {
                size: String(variant?.size || '').trim(),
                sku: String(variant?.sku || '').trim().toUpperCase(),
                price: parsedPrice,
                comparePrice: Number.isFinite(parsedComparePrice) ? parsedComparePrice : 0,
                stock: parsedStock,
                isActive: parseBooleanValue(variant?.isActive, true)
            };
        })
        .filter((variant) => (
            variant.size &&
            variant.sku &&
            Number.isFinite(variant.price) &&
            variant.price >= 0 &&
            Number.isFinite(variant.stock) &&
            variant.stock >= 0
        ));

    return { hasVariantsField: true, variants };
};

const applyVariantDerivedValues = (payload) => {
    if (!Array.isArray(payload.variants) || payload.variants.length === 0) {
        return payload;
    }

    const activeVariants = payload.variants.filter((variant) => variant.isActive !== false);
    const variantsForPricing = activeVariants.length > 0 ? activeVariants : payload.variants;

    payload.price = Math.min(...variantsForPricing.map((variant) => Number(variant.price)));
    payload.stock = variantsForPricing.reduce((sum, variant) => sum + Number(variant.stock || 0), 0);

    const comparePriceValues = variantsForPricing
        .map((variant) => Number(variant.comparePrice || 0))
        .filter((value) => Number.isFinite(value) && value > 0);
    payload.discountPrice = comparePriceValues.length > 0 ? Math.max(...comparePriceValues) : 0;

    return payload;
};

const uploadImagesFromRequest = async (req, folder = 'products') => {
    if (!req.files || !req.files.images) {
        return null;
    }

    const files = normalizeFiles(req.files.images);
    const uploads = [];

    for (const file of files) {
        const result = await uploadToCloudinary(file, folder);
        uploads.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    }

    return uploads;
};

const attachShippingToOrders = async (orders) => {
    if (!orders || orders.length === 0) {
        return [];
    }

    const orderIds = orders.map((order) => order._id);
    const shippingRecords = await Shipping.find({ order: { $in: orderIds } })
        .select('order trackingNumber carrier status estimatedDelivery actualDelivery shippedAt trackingHistory updatedAt');

    const shippingByOrderId = shippingRecords.reduce((acc, shipping) => {
        acc[shipping.order.toString()] = shipping.toObject();
        return acc;
    }, {});

    return orders.map((order) => {
        const orderObject = typeof order.toObject === 'function' ? order.toObject() : order;
        return {
            ...orderObject,
            shipping: shippingByOrderId[orderObject._id.toString()] || null
        };
    });
};

// ================== IMAGE UPLOAD ==================

// @desc    Upload images to Cloudinary
// @route   POST /api/admin/upload-images
// @access  Private/Admin
exports.uploadImages = async (req, res) => {
    try {
        console.log('=== UPLOAD IMAGES DEBUG ===');
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        
        if (!req.files || !req.files.images) {
            console.log('No files found in request');
            return res.status(400).json({
                success: false,
                message: 'Please select at least one file to upload'
            });
        }

        const folder = req.body.folder || 'products';
        const files = normalizeFiles(req.files.images);
        console.log('Files to upload:', files.length);
        console.log('First file:', files[0] ? { name: files[0].name, tempFilePath: files[0].tempFilePath, size: files[0].size } : 'none');
        
        const uploads = [];

        // Upload all images in parallel
        for (const file of files) {
            console.log('Uploading file:', file.name);
            try {
                const result = await uploadToCloudinary(file, folder);
                console.log('Upload result:', result.public_id, result.secure_url);
                uploads.push({
                    public_id: result.public_id,
                    url: result.secure_url,
                    resourceType: result.resource_type || 'image',
                    format: result.format || ''
                });
            } catch (uploadError) {
                console.error('Single file upload error:', uploadError);
                throw uploadError;
            }
        }

        res.status(200).json({
            success: true,
            message: `${uploads.length} file(s) uploaded successfully`,
            data: uploads
        });
    } catch (error) {
        console.error('IMAGE UPLOAD ERROR:', error);
        console.error('Error stack:', error.stack);

        const uploadErrorMessage =
            error?.error?.message ||
            error?.message ||
            'Error uploading files';

        res.status(500).json({
            success: false,
            message: uploadErrorMessage,
            error: uploadErrorMessage
        });
    }
};

// ================== DASHBOARD ==================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // Revenue
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: { $nin: ['Cancelled', 'Returned'] } } },
            { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueData[0]?.totalRevenue || 0;

        // Recent orders
        const recentOrders = await Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(5);

        // Order status breakdown
        const orderStatusBreakdown = await Order.aggregate([
            { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
        ]);

        // Low stock products
        const lowStockProducts = await Product.find({ stock: { $lte: 10 } })
            .select('name stock')
            .limit(10);

        // Monthly sales (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const monthlySales = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    orderStatus: { $nin: ['Cancelled', 'Returned'] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    sales: { $sum: '$totalPrice' },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue,
                recentOrders,
                orderStatusBreakdown,
                lowStockProducts,
                monthlySales
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard stats',
            error: error.message
        });
    }
};

// ================== USER MANAGEMENT ==================

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        if (req.query.role) filter.role = req.query.role;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { email: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(filter);
        const users = await User.find(filter)
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role: req.body.role },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'User role updated',
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating user role',
            error: error.message
        });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await user.deleteOne();

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
};

// ================== PRODUCT MANAGEMENT ==================

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const uploadedImages = await uploadImagesFromRequest(req);
        if (uploadedImages && uploadedImages.length > 0) {
            req.body.images = uploadedImages;
        }

        if (!req.body.images || req.body.images.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please upload at least one product image'
            });
        }

        const { hasVariantsField, variants } = parseProductVariants(req.body.variants);
        if (hasVariantsField) {
            req.body.variants = variants;
            applyVariantDerivedValues(req.body);
        }

        if (req.body.price !== undefined) req.body.price = Number(req.body.price);
        if (req.body.discountPrice !== undefined) req.body.discountPrice = Number(req.body.discountPrice || 0);
        if (req.body.stock !== undefined) req.body.stock = Number(req.body.stock);

        req.body.createdBy = req.user.id;
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating product',
            error: error.message
        });
    }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const uploadedImages = await uploadImagesFromRequest(req);
        if (uploadedImages && uploadedImages.length > 0) {
            req.body.images = uploadedImages;
        }

        const { hasVariantsField, variants } = parseProductVariants(req.body.variants);
        if (hasVariantsField) {
            req.body.variants = variants;
            applyVariantDerivedValues(req.body);
        }

        if (req.body.price !== undefined) req.body.price = Number(req.body.price);
        if (req.body.discountPrice !== undefined) req.body.discountPrice = Number(req.body.discountPrice || 0);
        if (req.body.stock !== undefined) req.body.stock = Number(req.body.stock);

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await product.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting product',
            error: error.message
        });
    }
};

// @desc    Update product stock (Inventory)
// @route   PUT /api/admin/products/:id/stock
// @access  Private/Admin
exports.updateStock = async (req, res) => {
    try {
        const { stock } = req.body;

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully',
            data: { name: product.name, stock: product.stock }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating stock',
            error: error.message
        });
    }
};

// @desc    Get all products (Admin)
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAdminProducts = async (req, res) => {
    try {
        const shouldReturnAll = String(req.query.all || '').toLowerCase() === 'true';
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        if (req.query.category) filter.category = req.query.category;
        if (req.query.search) {
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } }
            ];
        }
        if (req.query.isActive !== undefined) {
            filter.isActive = req.query.isActive === 'true';
        }

        const total = await Product.countDocuments(filter);
        let query = Product.find(filter)
            .populate('category', 'name')
            .sort('-createdAt');

        if (!shouldReturnAll) {
            query = query.skip(skip).limit(limit);
        }

        const products = await query;

        res.status(200).json({
            success: true,
            count: products.length,
            total,
            totalPages: shouldReturnAll ? 1 : Math.ceil(total / limit),
            currentPage: shouldReturnAll ? 1 : page,
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

// ================== CATEGORY MANAGEMENT ==================

// @desc    Get all categories (including inactive) for admin
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getAdminCategories = async (req, res) => {
    try {
        const categories = await Category.find({})
            .populate('parentCategory', 'name')
            .sort('order');

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        console.error('Get admin categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching categories',
            error: error.message
        });
    }
};

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        console.log('=== CREATE CATEGORY DEBUG ===');
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        
        const { name, description, parentCategory, isActive, order } = req.body;

        if (!name || !String(name).trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        // Check if category name already exists
        const existingCategory = await Category.findOne({ name: { $regex: new RegExp(`^${String(name).trim()}$`, 'i') } });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'Category with this name already exists'
            });
        }

        // Handle image upload if provided
        let imageData = null;
        if (req.files && req.files.image) {
            const result = await uploadToCloudinary(req.files.image, 'categories');
            imageData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const categoryData = {
            name: String(name).trim(),
            description,
            parentCategory: parentCategory || null,
            isActive: isActive !== undefined ? String(isActive).toLowerCase() === 'true' : true,
            order: Number(order || 0)
        };

        if (imageData) {
            categoryData.image = imageData;
        }

        const category = await Category.create(categoryData);

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        console.error('Create category error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((val) => val.message).join(', ')
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category data provided'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error creating category',
            error: error.message
        });
    }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
    try {
        console.log('=== UPDATE CATEGORY DEBUG ===');
        console.log('req.files:', req.files);
        console.log('req.body:', req.body);
        
        const { name, description, parentCategory, isActive, order } = req.body;

        let category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if new name conflicts with existing category
        if (name && String(name).trim() !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: { $regex: new RegExp(`^${String(name).trim()}$`, 'i') },
                _id: { $ne: req.params.id }
            });
            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: 'Category with this name already exists'
                });
            }
        }

        // Handle image upload if provided
        if (req.files && req.files.image) {
            // Delete old image from Cloudinary if exists
            if (category.image && category.image.public_id) {
                await deleteFromCloudinary(category.image.public_id);
            }
            
            const result = await uploadToCloudinary(req.files.image, 'categories');
            category.image = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        // Update fields
        if (name) category.name = String(name).trim();
        if (description !== undefined) category.description = description;
        if (parentCategory !== undefined) category.parentCategory = parentCategory || null;
        if (isActive !== undefined) category.isActive = String(isActive).toLowerCase() === 'true';
        if (order !== undefined) category.order = Number(order || 0);

        await category.save();

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        console.error('Update category error:', error);

        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: Object.values(error.errors).map((val) => val.message).join(', ')
            });
        }

        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid category data provided'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error updating category',
            error: error.message
        });
    }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        // Check if products exist in this category
        const productsCount = await Product.countDocuments({ category: req.params.id });
        if (productsCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${productsCount} products are using this category.`
            });
        }

        // Check if subcategories exist
        const subcategoriesCount = await Category.countDocuments({ parentCategory: req.params.id });
        if (subcategoriesCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. ${subcategoriesCount} subcategories exist under this category.`
            });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Delete image from Cloudinary if exists
        if (category.image && category.image.public_id) {
            await deleteFromCloudinary(category.image.public_id);
        }

        await Category.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting category',
            error: error.message
        });
    }
};

// ================== ORDER MANAGEMENT ==================

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        if (req.query.status) filter.orderStatus = req.query.status;
        if (req.query.orderId) filter.orderId = { $regex: req.query.orderId, $options: 'i' };

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        const ordersWithShipping = await attachShippingToOrders(orders);

        res.status(200).json({
            success: true,
            count: ordersWithShipping.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: ordersWithShipping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders',
            error: error.message
        });
    }
};

// @desc    Get active shipments (Admin)
// @route   GET /api/admin/orders/active-shipments
// @access  Private/Admin
exports.getActiveShipments = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const filter = {
            orderStatus: { $in: ACTIVE_ORDER_STATUSES }
        };

        if (req.query.orderId) {
            filter.orderId = { $regex: req.query.orderId, $options: 'i' };
        }

        const total = await Order.countDocuments(filter);
        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .populate('orderItems.product', 'name images')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit);

        let shipments = await attachShippingToOrders(orders);

        if (req.query.shippingStatus) {
            shipments = shipments.filter((order) => order.shipping?.status === req.query.shippingStatus);
        }

        res.status(200).json({
            success: true,
            count: shipments.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: shipments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching active shipments',
            error: error.message
        });
    }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        if (!VALID_ORDER_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid order status'
            });
        }

        const order = await Order.findById(req.params.id).populate('user', 'name email');

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.orderStatus = status;
        order.statusHistory.push({
            status,
            note: note || `Status updated to ${status}`,
            date: Date.now()
        });

        if (status === 'Delivered') {
            order.deliveredAt = Date.now();
            order.paymentInfo.status = 'Completed';
            order.paymentInfo.paidAt = Date.now();
        }

        if (status === 'Cancelled') {
            order.cancelledAt = Date.now();
            order.cancelReason = note || 'Cancelled by admin';
        }

        await order.save();

        // Update shipping status
        const shipping = await Shipping.findOne({ order: order._id });
        if (shipping) {
            const shippingStatus = ORDER_TO_SHIPPING_STATUS_MAP[status];

            if (shippingStatus) {
                if (!shipping.shippedAt && ['Shipped', 'In Transit', 'Out for Delivery'].includes(shippingStatus)) {
                    shipping.shippedAt = Date.now();
                }

                if (shippingStatus === 'Delivered') {
                    shipping.actualDelivery = Date.now();
                }

                await shipping.addTrackingUpdate(shippingStatus, '', note || `Order ${status.toLowerCase()}`);
            }
        }

        // Send status update email
        try {
            const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
            await sendEmail({
                email: order.user.email,
                subject: `Order ${status} - ${order.orderId}`,
                template: 'orderStatusUpdate',
                data: {
                    name: order.user.name,
                    orderId: order.orderId,
                    orderDocId: order._id.toString(),
                    frontendUrl,
                    status,
                    note
                }
            });
        } catch (emailError) {
            console.error('Status update email failed:', emailError);
        }

        res.status(200).json({
            success: true,
            message: 'Order status updated',
            data: {
                ...order.toObject(),
                shipping: shipping ? shipping.toObject() : null
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating order status',
            error: error.message
        });
    }
};

// ================== SHIPPING MANAGEMENT ==================

// @desc    Update shipping details
// @route   PUT /api/admin/shipping/:orderId
// @access  Private/Admin
exports.updateShipping = async (req, res) => {
    try {
        const { carrier, estimatedDelivery, trackingNumber } = req.body;

        let shipping = await Shipping.findOne({ order: req.params.orderId });

        if (!shipping) {
            return res.status(404).json({
                success: false,
                message: 'Shipping record not found'
            });
        }

        if (carrier) shipping.carrier = carrier;
        if (estimatedDelivery) shipping.estimatedDelivery = estimatedDelivery;
        if (trackingNumber) shipping.trackingNumber = trackingNumber;

        await shipping.save();

        // Send shipping update email
        const order = await Order.findById(req.params.orderId).populate('user', 'name email');
        if (order) {
            try {
                const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'http://localhost:5173';
                await sendEmail({
                    email: order.user.email,
                    subject: `Shipping Update - ${order.orderId}`,
                    template: 'shippingUpdate',
                    data: {
                        name: order.user.name,
                        orderId: order.orderId,
                        orderDocId: order._id.toString(),
                        frontendUrl,
                        trackingNumber: shipping.trackingNumber,
                        carrier: shipping.carrier,
                        estimatedDelivery: shipping.estimatedDelivery
                    }
                });
            } catch (emailError) {
                console.error('Shipping update email failed:', emailError);
            }
        }

        res.status(200).json({
            success: true,
            message: 'Shipping details updated',
            data: shipping
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating shipping',
            error: error.message
        });
    }
};

// @desc    Add tracking update
// @route   POST /api/admin/shipping/:orderId/tracking
// @access  Private/Admin
exports.addTrackingUpdate = async (req, res) => {
    try {
        const { status, location, description } = req.body;

        if (!VALID_SHIPPING_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid shipping status'
            });
        }

        const shipping = await Shipping.findOne({ order: req.params.orderId });

        if (!shipping) {
            return res.status(404).json({
                success: false,
                message: 'Shipping record not found'
            });
        }

        if (!shipping.shippedAt && ['Shipped', 'In Transit', 'Out for Delivery'].includes(status)) {
            shipping.shippedAt = Date.now();
        }
        if (status === 'Delivered') {
            shipping.actualDelivery = Date.now();
        }

        await shipping.addTrackingUpdate(status, location, description);

        const mappedOrderStatus = SHIPPING_TO_ORDER_STATUS_MAP[status];
        let order = null;

        if (mappedOrderStatus) {
            order = await Order.findById(req.params.orderId);
            if (order && order.orderStatus !== mappedOrderStatus) {
                order.orderStatus = mappedOrderStatus;
                order.statusHistory.push({
                    status: mappedOrderStatus,
                    note: description || `Shipping updated to ${status}`,
                    date: Date.now()
                });

                if (mappedOrderStatus === 'Delivered') {
                    order.deliveredAt = Date.now();
                    order.paymentInfo.status = 'Completed';
                    order.paymentInfo.paidAt = Date.now();
                }

                if (mappedOrderStatus === 'Cancelled') {
                    order.cancelledAt = Date.now();
                    order.cancelReason = description || 'Shipment cancelled';
                }

                await order.save();
            }
        }

        res.status(200).json({
            success: true,
            message: 'Tracking update added',
            data: {
                shipping,
                orderStatus: order?.orderStatus
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding tracking update',
            error: error.message
        });
    }
};

// ================== REVIEW MANAGEMENT ==================

// @desc    Get all reviews (Admin)
// @route   GET /api/admin/reviews
// @access  Private/Admin
exports.getAllReviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        let filter = {};
        if (req.query.isApproved !== undefined) {
            filter.isApproved = req.query.isApproved === 'true';
        }

        const total = await Review.countDocuments(filter);
        const reviews = await Review.find(filter)
            .populate('user', 'name email')
            .populate('product', 'name')
            .skip(skip)
            .limit(limit)
            .sort('-createdAt');

        res.status(200).json({
            success: true,
            count: reviews.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: reviews
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching reviews',
            error: error.message
        });
    }
};

// @desc    Approve/Reject review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
exports.approveReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { isApproved: req.body.isApproved },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        // Recalculate product rating
        await Review.calculateAverageRating(review.product);

        res.status(200).json({
            success: true,
            message: `Review ${req.body.isApproved ? 'approved' : 'rejected'}`,
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating review',
            error: error.message
        });
    }
};

// @desc    Respond to review
// @route   PUT /api/admin/reviews/:id/respond
// @access  Private/Admin
exports.respondToReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            {
                adminResponse: {
                    message: req.body.message,
                    respondedAt: Date.now()
                }
            },
            { new: true }
        );

        if (!review) {
            return res.status(404).json({
                success: false,
                message: 'Review not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Response added to review',
            data: review
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error responding to review',
            error: error.message
        });
    }
};
