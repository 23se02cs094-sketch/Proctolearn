import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCart, updateCartItemQuantity, removeFromCart, clearCart } from "../../services/operations/cartService";
import { Loader } from "../common";
import {
    ShoppingCart,
    Minus,
    Plus,
    Trash2,
    ArrowRight,
    ShoppingBag,
    Tag,
} from "lucide-react";
import { handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const Cart = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { items, totalItems, totalPrice, loading } = useSelector((state) => state.cart);
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getCart());
        }
    }, [dispatch, isAuthenticated]);
    
    const handleQuantityChange = (itemId, currentQuantity, action) => {
        const newQuantity = action === "increase" ? currentQuantity + 1 : currentQuantity - 1;
        if (newQuantity >= 1) {
            dispatch(updateCartItemQuantity(itemId, newQuantity));
        }
    };
    
    const handleRemoveItem = (itemId) => {
        dispatch(removeFromCart(itemId));
    };
    
    const handleClearCart = () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            dispatch(clearCart());
        }
    };
    
    const handleCheckout = () => {
        navigate("/checkout");
    };
    
    // Calculate totals
    const subtotal = items.reduce((acc, item) => {
        const price = item.price || item.product?.price || 0;
        return acc + price * item.quantity;
    }, 0);
    
    const shipping = subtotal > 499 ? 0 : 49;
    const total = subtotal + shipping;
    
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
                    <p className="text-gray-600 mb-6">Login to view your cart</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Login Now
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }
    
    if (loading) {
        return <Loader fullScreen text="Loading cart..." />;
    }
    
    if (!items || items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Cart is Empty</h2>
                    <p className="text-gray-600 mb-6">Looks like you haven't added anything yet!</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Start Shopping
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                    <button
                        onClick={handleClearCart}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                        Clear Cart
                    </button>
                </div>
                
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            {/* Table Header - Desktop */}
                            <div className="hidden md:grid md:grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-medium text-gray-500">
                                <div className="col-span-6">Product</div>
                                <div className="col-span-2 text-center">Price</div>
                                <div className="col-span-2 text-center">Quantity</div>
                                <div className="col-span-2 text-right">Total</div>
                            </div>
                            
                            {/* Cart Items */}
                            <div className="divide-y divide-gray-200">
                                {items.map((item) => (
                                    <div
                                        key={item._id}
                                        className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center"
                                    >
                                        {/* Product Info */}
                                        <div className="col-span-6 flex gap-4">
                                            <Link
                                                to={`/product/${item.product?._id}`}
                                                className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                                            >
                                                <img
                                                    src={resolveImageUrl(item.product?.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                                    alt={item.product?.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                                />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link
                                                    to={`/product/${item.product?._id}`}
                                                    className="text-gray-900 font-medium hover:text-purple-600 line-clamp-2"
                                                >
                                                    {item.product?.name}
                                                </Link>
                                                {item.product?.category && (
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        {item.product.category.name}
                                                    </p>
                                                )}
                                                {item.product?.stock < 5 && (
                                                    <p className="text-sm text-orange-600 mt-1">
                                                        Only {item.product.stock} left in stock
                                                    </p>
                                                )}
                                                {(item.selectedSize || item.selectedSku) && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                                                        {item.selectedSize && item.selectedSku ? " • " : ""}
                                                        {item.selectedSku ? `SKU: ${item.selectedSku}` : ""}
                                                    </p>
                                                )}
                                                <button
                                                    onClick={() => handleRemoveItem(item._id)}
                                                    className="md:hidden mt-2 text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Price */}
                                        <div className="col-span-2 text-center mt-4 md:mt-0">
                                            <span className="md:hidden text-sm text-gray-500 mr-2">Price:</span>
                                            <span className="font-medium">₹{(item.price || item.product?.price || 0).toLocaleString()}</span>
                                        </div>
                                        
                                        {/* Quantity */}
                                        <div className="col-span-2 flex justify-center mt-4 md:mt-0">
                                            <div className="inline-flex items-center border border-gray-300 rounded-lg">
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, "decrease")}
                                                    disabled={item.quantity <= 1}
                                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>
                                                <span className="px-4 py-2 font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => handleQuantityChange(item._id, item.quantity, "increase")}
                                                    disabled={item.quantity >= (item.product?.stock || 10)}
                                                    className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Total & Remove */}
                                        <div className="col-span-2 flex items-center justify-between md:justify-end gap-4 mt-4 md:mt-0">
                                            <span className="font-bold text-gray-900">
                                                ₹{((item.price || item.product?.price || 0) * item.quantity).toLocaleString()}
                                            </span>
                                            <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="hidden md:block p-2 text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* Continue Shopping */}
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 mt-6 text-purple-600 hover:text-purple-700 font-medium"
                        >
                            <ArrowRight className="h-5 w-5 rotate-180" />
                            Continue Shopping
                        </Link>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="lg:col-span-4 mt-8 lg:mt-0">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            
                            {/* Coupon Code */}
                            <div className="mb-6">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium">
                                        Apply
                                    </button>
                                </div>
                            </div>
                            
                            {/* Price Breakdown */}
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal ({totalItems} items)</span>
                                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    {shipping === 0 ? (
                                        <span className="text-green-600 font-medium">FREE</span>
                                    ) : (
                                        <span className="font-medium">₹{shipping}</span>
                                    )}
                                </div>
                                {shipping > 0 && (
                                    <p className="text-sm text-gray-500">
                                        Add ₹{(500 - subtotal).toLocaleString()} more for free shipping
                                    </p>
                                )}
                                <div className="border-t border-gray-200 pt-3">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span>₹{total.toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        (Inclusive of all taxes)
                                    </p>
                                </div>
                            </div>
                            
                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                className="w-full mt-6 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                            >
                                Proceed to Checkout
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            
                            {/* Security Badge */}
                            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                                <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Secure Checkout
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
