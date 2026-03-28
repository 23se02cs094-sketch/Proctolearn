const Cart = require('../Cart');
const Product = require('../Product');

const normalizeSku = (sku = '') => String(sku).trim().toUpperCase();

const getActiveProductVariants = (product) => {
    return (product.variants || []).filter((variant) => variant.isActive !== false);
};

const resolveVariant = (product, selectedVariantId = '', selectedSku = '', selectedSize = '') => {
    const activeVariants = getActiveProductVariants(product);
    if (activeVariants.length === 0) {
        return null;
    }

    if (selectedVariantId) {
        const byId = activeVariants.find(
            (variant) => String(variant._id) === String(selectedVariantId)
        );
        if (byId) return byId;
    }

    const normalizedSku = normalizeSku(selectedSku);

    if (selectedSize && normalizedSku) {
        const bySizeAndSku = activeVariants.find(
            (variant) =>
                String(variant.size).toLowerCase() === String(selectedSize).trim().toLowerCase() &&
                normalizeSku(variant.sku) === normalizedSku
        );
        if (bySizeAndSku) return bySizeAndSku;
    }

    if (selectedSize) {
        const bySize =
            activeVariants.find(
                (variant) => String(variant.size).toLowerCase() === String(selectedSize).trim().toLowerCase()
            ) || null;
        if (bySize) return bySize;
    }

    if (normalizedSku) {
        return activeVariants.find((variant) => normalizeSku(variant.sku) === normalizedSku) || null;
    }

    return null;
};

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price images stock');

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        res.status(200).json({
            success: true,
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching cart',
            error: error.message
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity = 1, selectedSize = '', selectedSku = '', selectedVariantId = '' } = req.body;

        // Find product
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const activeVariants = getActiveProductVariants(product);
        let selectedVariant = null;

        if (activeVariants.length > 0) {
            selectedVariant = resolveVariant(product, selectedVariantId, selectedSku, selectedSize);
            if (!selectedVariant) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select a valid product size/variant'
                });
            }

            if (selectedVariant.stock < quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${selectedVariant.size}`
                });
            }
        } else if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient stock'
            });
        }

        // Find or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = new Cart({
                user: req.user.id,
                items: []
            });
        }

        // Check if product already in cart
        const normalizedSelectedSku = normalizeSku(selectedVariant?.sku || selectedSku);
        const existingItemIndex = cart.items.findIndex(
            item =>
                item.product.toString() === productId &&
                (
                    (selectedVariant && item.variantId && String(item.variantId) === String(selectedVariant._id)) ||
                    (!selectedVariant && !item.variantId)
                )
        );

        const resolvedPrice = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);

        if (existingItemIndex > -1) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            if (selectedVariant && newQuantity > selectedVariant.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more than available stock for ${selectedVariant.size}`
                });
            }

            if (!selectedVariant && newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot add more than available stock'
                });
            }
            cart.items[existingItemIndex].quantity = newQuantity;
            cart.items[existingItemIndex].price = resolvedPrice;
            cart.items[existingItemIndex].selectedSize = selectedVariant?.size || '';
            cart.items[existingItemIndex].selectedSku = normalizedSelectedSku;
            cart.items[existingItemIndex].variantId = selectedVariant?._id || null;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                selectedSize: selectedVariant?.size || '',
                selectedSku: normalizedSelectedSku,
                variantId: selectedVariant?._id || null,
                price: resolvedPrice
            });
        }

        await cart.save();

        // Populate and return
        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            message: 'Item added to cart',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error adding to cart',
            error: error.message
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
    try {
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item._id.toString() === req.params.itemId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        // Check stock
        const product = await Product.findById(cart.items[itemIndex].product);
        const currentItem = cart.items[itemIndex];
        const selectedVariant = resolveVariant(
            product,
            currentItem.variantId,
            currentItem.selectedSku,
            currentItem.selectedSize
        );

        if (selectedVariant && quantity > selectedVariant.stock) {
            return res.status(400).json({
                success: false,
                message: `Requested quantity exceeds available stock for ${selectedVariant.size}`
            });
        }

        if (!selectedVariant && quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: 'Requested quantity exceeds available stock'
            });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = selectedVariant ? selectedVariant.price : (product.discountPrice || product.price);
        await cart.save();

        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            message: 'Cart updated',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error updating cart',
            error: error.message
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item._id.toString() !== req.params.itemId
        );

        await cart.save();

        cart = await Cart.findById(cart._id)
            .populate('items.product', 'name price images stock');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing from cart',
            error: error.message
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared',
            data: cart
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error clearing cart',
            error: error.message
        });
    }
};
