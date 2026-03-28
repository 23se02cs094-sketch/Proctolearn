import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getWishlist, removeFromWishlist, moveToCart } from "../../services/operations/wishlistService";
import { Loader } from "../common";
import {
    Heart,
    ShoppingCart,
    Trash2,
    ArrowRight,
    ShoppingBag,
} from "lucide-react";
import { handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const Wishlist = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items, loading } = useSelector((state) => state.wishlist);
    const { isAuthenticated } = useSelector((state) => state.auth);
    
    useEffect(() => {
        if (isAuthenticated) {
            dispatch(getWishlist());
        }
    }, [dispatch, isAuthenticated]);
    
    const handleRemove = (productId) => {
        dispatch(removeFromWishlist(productId));
    };
    
    const handleMoveToCart = (productId) => {
        dispatch(moveToCart(productId));
    };
    
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Login</h2>
                    <p className="text-gray-600 mb-6">Login to view your wishlist</p>
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
        return <Loader fullScreen text="Loading wishlist..." />;
    }
    
    if (!items || items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Heart className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h2>
                    <p className="text-gray-600 mb-6">Save items you love for later!</p>
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Explore Products
                        <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
                    <p className="text-gray-600">{items.length} items</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => {
                        const product = item.product || item;
                        return (
                            <div key={item._id || product._id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                                {/* Image */}
                                <Link to={`/product/${product._id}`} className="block relative aspect-square bg-gray-100">
                                    <img
                                        src={resolveImageUrl(product.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                    />
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg">
                                                Out of Stock
                                            </span>
                                        </div>
                                    )}
                                </Link>
                                
                                {/* Content */}
                                <div className="p-4">
                                    <Link to={`/product/${product._id}`}>
                                        <h3 className="font-medium text-gray-900 line-clamp-2 hover:text-purple-600">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    
                                    <div className="mt-2 flex items-center gap-2">
                                        <span className="text-lg font-bold text-gray-900">
                                            ₹{product.price?.toLocaleString()}
                                        </span>
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <span className="text-sm text-gray-400 line-through">
                                                ₹{product.comparePrice?.toLocaleString()}
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="mt-4 flex gap-2">
                                        <button
                                            onClick={() => handleMoveToCart(product._id)}
                                            disabled={product.stock === 0}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleRemove(product._id)}
                                            className="p-2 border border-gray-300 rounded-lg hover:border-red-500 hover:text-red-500"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
