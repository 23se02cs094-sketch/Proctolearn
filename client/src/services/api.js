// API Base URL
const BASE_URL =
    import.meta.env.VITE_API_BASE_URL ||
    "https://proctolearn-ten.vercel.app/api";

// ==================== AUTH ENDPOINTS ====================
export const authEndpoints = {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    LOGOUT: `${BASE_URL}/auth/logout`,
    GET_ME: `${BASE_URL}/auth/me`,
    VERIFY_EMAIL: `${BASE_URL}/auth/verify-email`,
    SEND_OTP: `${BASE_URL}/auth/send-otp`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    UPDATE_PASSWORD: `${BASE_URL}/auth/update-password`,
};

// ==================== USER ENDPOINTS ====================
export const userEndpoints = {
    GET_PROFILE: `${BASE_URL}/users/profile`,
    UPDATE_PROFILE: `${BASE_URL}/users/profile`,
    GET_SETTINGS: `${BASE_URL}/users/settings`,
    UPDATE_SETTINGS: `${BASE_URL}/users/settings`,
    ADD_ADDRESS: `${BASE_URL}/users/addresses`,
    UPDATE_ADDRESS: (addressId) => `${BASE_URL}/users/addresses/${addressId}`,
    DELETE_ADDRESS: (addressId) => `${BASE_URL}/users/addresses/${addressId}`,
    SET_DEFAULT_ADDRESS: (addressId) => `${BASE_URL}/users/addresses/${addressId}/default`,
};

// ==================== PRODUCT ENDPOINTS ====================
export const productEndpoints = {
    GET_ALL_PRODUCTS: `${BASE_URL}/products`,
    GET_PRODUCT: (productId) => `${BASE_URL}/products/${productId}`,
    GET_FEATURED_PRODUCTS: `${BASE_URL}/products/featured`,
    GET_PRODUCTS_BY_CATEGORY: (categoryId) => `${BASE_URL}/products/category/${encodeURIComponent(categoryId)}`,
    SEARCH_PRODUCTS: `${BASE_URL}/products/search`,
    GET_RELATED_PRODUCTS: (productId) => `${BASE_URL}/products/${productId}/related`,
};

// ==================== CATEGORY ENDPOINTS ====================
export const categoryEndpoints = {
    GET_ALL_CATEGORIES: `${BASE_URL}/categories`,
    GET_CATEGORY: (categoryId) => `${BASE_URL}/categories/${categoryId}`,
    GET_ALL_FLAT_CATEGORIES: `${BASE_URL}/categories/all`,
};

// ==================== CART ENDPOINTS ====================
export const cartEndpoints = {
    GET_CART: `${BASE_URL}/cart`,
    ADD_TO_CART: `${BASE_URL}/cart/add`,
    UPDATE_CART_ITEM: (itemId) => `${BASE_URL}/cart/${itemId}`,
    REMOVE_FROM_CART: (itemId) => `${BASE_URL}/cart/${itemId}`,
    CLEAR_CART: `${BASE_URL}/cart/clear`,
};

// ==================== ORDER ENDPOINTS ====================
export const orderEndpoints = {
    CREATE_ORDER: `${BASE_URL}/orders`,
    GET_MY_ORDERS: `${BASE_URL}/orders/my-orders`,
    GET_ACTIVE_SHIPMENTS: `${BASE_URL}/orders/active-shipments`,
    GET_ORDER: (orderId) => `${BASE_URL}/orders/${orderId}`,
    CANCEL_ORDER: (orderId) => `${BASE_URL}/orders/${orderId}/cancel`,
    TRACK_ORDER: (orderId) => `${BASE_URL}/orders/${orderId}/track`,
};

// ==================== WISHLIST ENDPOINTS ====================
export const wishlistEndpoints = {
    GET_WISHLIST: `${BASE_URL}/wishlist`,
    ADD_TO_WISHLIST: `${BASE_URL}/wishlist/add`,
    REMOVE_FROM_WISHLIST: (productId) => `${BASE_URL}/wishlist/${productId}`,
    CHECK_WISHLIST: (productId) => `${BASE_URL}/wishlist/check/${productId}`,
    CLEAR_WISHLIST: `${BASE_URL}/wishlist`,
    MOVE_TO_CART: (productId) => `${BASE_URL}/wishlist/move-to-cart/${productId}`,
};

// ==================== REVIEW ENDPOINTS ====================
export const reviewEndpoints = {
    CREATE_REVIEW: `${BASE_URL}/reviews`,
    GET_PRODUCT_REVIEWS: (productId) => `${BASE_URL}/reviews/product/${productId}`,
    GET_MY_REVIEWS: `${BASE_URL}/reviews/my-reviews`,
    UPDATE_REVIEW: (reviewId) => `${BASE_URL}/reviews/${reviewId}`,
    DELETE_REVIEW: (reviewId) => `${BASE_URL}/reviews/${reviewId}`,
    MARK_HELPFUL: (reviewId) => `${BASE_URL}/reviews/${reviewId}/helpful`,
};

// ==================== SHIPPING ENDPOINTS ====================
export const shippingEndpoints = {
    GET_SHIPPING_DETAILS: (orderId) => `${BASE_URL}/shipping/${orderId}`,
    TRACK_BY_NUMBER: (trackingNumber) => `${BASE_URL}/shipping/track/${trackingNumber}`,
};

// ==================== PAYMENT ENDPOINTS ====================
export const paymentEndpoints = {
    CREATE_RAZORPAY_ORDER: `${BASE_URL}/payment/create-order`,
    VERIFY_PAYMENT: `${BASE_URL}/payment/verify`,
    GET_RAZORPAY_KEY: `${BASE_URL}/payment/get-key`,
};

// ==================== ADMIN ENDPOINTS ====================
export const adminEndpoints = {
    // Dashboard
    GET_DASHBOARD_STATS: `${BASE_URL}/admin/dashboard`,
    
    // Users
    GET_ALL_USERS: `${BASE_URL}/admin/users`,
    UPDATE_USER_ROLE: (userId) => `${BASE_URL}/admin/users/${userId}/role`,
    DELETE_USER: (userId) => `${BASE_URL}/admin/users/${userId}`,
    
    // Products
    GET_ADMIN_PRODUCTS: `${BASE_URL}/admin/products`,
    CREATE_PRODUCT: `${BASE_URL}/admin/products`,
    UPDATE_PRODUCT: (productId) => `${BASE_URL}/admin/products/${productId}`,
    DELETE_PRODUCT: (productId) => `${BASE_URL}/admin/products/${productId}`,
    UPDATE_STOCK: (productId) => `${BASE_URL}/admin/products/${productId}/stock`,
    UPLOAD_IMAGES: `${BASE_URL}/admin/upload-images`,
    
    // Categories
    GET_ADMIN_CATEGORIES: `${BASE_URL}/admin/categories`,
    CREATE_CATEGORY: `${BASE_URL}/admin/categories`,
    UPDATE_CATEGORY: (categoryId) => `${BASE_URL}/admin/categories/${categoryId}`,
    DELETE_CATEGORY: (categoryId) => `${BASE_URL}/admin/categories/${categoryId}`,
    
    // Orders
    GET_ALL_ORDERS: `${BASE_URL}/admin/orders`,
    GET_ACTIVE_SHIPMENTS: `${BASE_URL}/admin/orders/active-shipments`,
    UPDATE_ORDER_STATUS: (orderId) => `${BASE_URL}/admin/orders/${orderId}/status`,
    
    // Shipping
    UPDATE_SHIPPING: (orderId) => `${BASE_URL}/admin/shipping/${orderId}`,
    ADD_TRACKING_UPDATE: (orderId) => `${BASE_URL}/admin/shipping/${orderId}/tracking`,
    
    // Reviews
    GET_ALL_REVIEWS: `${BASE_URL}/admin/reviews`,
    APPROVE_REVIEW: (reviewId) => `${BASE_URL}/admin/reviews/${reviewId}/approve`,
    RESPOND_TO_REVIEW: (reviewId) => `${BASE_URL}/admin/reviews/${reviewId}/respond`,
};
