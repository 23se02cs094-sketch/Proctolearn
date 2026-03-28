const express = require('express');
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkWishlist,
    clearWishlist,
    moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.get('/check/:productId', checkWishlist);
router.delete('/', clearWishlist);
router.post('/move-to-cart/:productId', moveToCart);

module.exports = router;
