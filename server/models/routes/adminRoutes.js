const express = require('express');
const router = express.Router();
const {
    // Dashboard
    getDashboardStats,
    // Image Upload
    uploadImages,
    // User Management
    getAllUsers,
    updateUserRole,
    deleteUser,
    // Product Management
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    getAdminProducts,
    // Category Management
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    // Order Management
    getAllOrders,
    getActiveShipments,
    updateOrderStatus,
    // Shipping Management
    updateShipping,
    addTrackingUpdate,
    // Review Management
    getAllReviews,
    approveReview,
    respondToReview
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(protect);
router.use(admin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Image Upload
router.post('/upload-images', uploadImages);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Product Management
router.get('/products', getAdminProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.put('/products/:id/stock', updateStock);

// Category Management
router.get('/categories', getAdminCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Order Management
router.get('/orders', getAllOrders);
router.get('/orders/active-shipments', getActiveShipments);
router.put('/orders/:id/status', updateOrderStatus);

// Shipping Management
router.put('/shipping/:orderId', updateShipping);
router.post('/shipping/:orderId/tracking', addTrackingUpdate);

// Review Management
router.get('/reviews', getAllReviews);
router.put('/reviews/:id/approve', approveReview);
router.put('/reviews/:id/respond', respondToReview);

module.exports = router;
