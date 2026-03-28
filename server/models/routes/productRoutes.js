const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    getFeaturedProducts,
    getProductsByCategory,
    searchProducts,
    getRelatedProducts
} = require('../controllers/productController');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/search', searchProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:id', getProduct);
router.get('/:id/related', getRelatedProducts);

module.exports = router;
