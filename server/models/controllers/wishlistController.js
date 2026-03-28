const Wishlist = require('../Wishlist');
const Product = require('../Product');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id })
            .populate('products.product', 'name price images stock isActive');

        if (!wishlist) {
            wishlist = await Wishlist.create({
                user: req.user.id,
                products: []
            });
        }

        // Filter out inactive products
        wishlist.products = wishlist.products.filter(
            item => item.product && item.product.isActive
        );

        res.status(200).json({
            success: true,
            count: wishlist.products.length,
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching wishlist',
            error: error.message
        });
    }
};

// @desc    Add product to wishlist
// @route   POST /api/wishlist/add
// @access  Private
exports.addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user.id,
                products: []
            });
        }

        // Check if product already in wishlist
        const exists = wishlist.products.some(
            item => item.product.toString() === productId
        );

        if (exists) {
            return res.status(400).json({
                success: false,
                message: 'Product already in wishlist'
            });
        }

        wishlist.products.push({ product: productId });
        await wishlist.save();

        wishlist = await Wishlist.findById(wishlist._id)
            .populate('products.product', 'name price images stock');

        res.status(200).json({
            success: true,
            message: 'Product added to wishlist',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to wishlist',
            error: error.message
        });
    }
};

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== req.params.productId
        );

        await wishlist.save();

        wishlist = await Wishlist.findById(wishlist._id)
            .populate('products.product', 'name price images stock');

        res.status(200).json({
            success: true,
            message: 'Product removed from wishlist',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing from wishlist',
            error: error.message
        });
    }
};

// @desc    Check if product is in wishlist
// @route   GET /api/wishlist/check/:productId
// @access  Private
exports.checkWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(200).json({
                success: true,
                inWishlist: false
            });
        }

        const inWishlist = wishlist.products.some(
            item => item.product.toString() === req.params.productId
        );

        res.status(200).json({
            success: true,
            inWishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error checking wishlist',
            error: error.message
        });
    }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist
// @access  Private
exports.clearWishlist = async (req, res) => {
    try {
        let wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            return res.status(404).json({
                success: false,
                message: 'Wishlist not found'
            });
        }

        wishlist.products = [];
        await wishlist.save();

        res.status(200).json({
            success: true,
            message: 'Wishlist cleared',
            data: wishlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing wishlist',
            error: error.message
        });
    }
};

// @desc    Move item from wishlist to cart
// @route   POST /api/wishlist/move-to-cart/:productId
// @access  Private
exports.moveToCart = async (req, res) => {
    try {
        const Cart = require('../Cart');
        const { productId } = req.params;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.stock < 1) {
            return res.status(400).json({
                success: false,
                message: 'Product is out of stock'
            });
        }

        // Remove from wishlist
        let wishlist = await Wishlist.findOne({ user: req.user.id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                item => item.product.toString() !== productId
            );
            await wishlist.save();
        }

        // Add to cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += 1;
        } else {
            cart.items.push({
                product: productId,
                quantity: 1,
                price: product.discountPrice || product.price
            });
        }

        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Product moved to cart'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error moving to cart',
            error: error.message
        });
    }
};
