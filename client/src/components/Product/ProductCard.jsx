import React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../services/operations/cartService";
import { addToWishlist, removeFromWishlist } from "../../services/operations/wishlistService";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { getMediaType, handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const ProductCard = ({ product }) => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    
    const isInWishlist = wishlistItems.some((item) => item._id === product._id || item.product?._id === product._id);
    
    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            return;
        }
        
        dispatch(addToCart(product._id, 1));
    };
    
    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!isAuthenticated) {
            toast.error("Please login to add items to wishlist");
            return;
        }
        
        if (isInWishlist) {
            dispatch(removeFromWishlist(product._id));
        } else {
            dispatch(addToWishlist(product._id));
        }
    };
    
    // Calculate discount percentage
    const discountPercent = product.comparePrice && product.comparePrice > product.price
        ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
        : 0;
    
    return (
        <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Image Container */}
            <div className="relative overflow-hidden">
                <Link to={`/product/${product._id}`} className="block">
                    <div className="aspect-square bg-gray-100">
                        {getMediaType(product.images?.[0]) === "video" ? (
                            <video
                                src={resolveImageUrl(product.images?.[0]?.url)}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 bg-black"
                                muted
                                playsInline
                                preload="metadata"
                            />
                        ) : (
                            <img
                                src={resolveImageUrl(product.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                            />
                        )}
                    </div>

                    {/* Out of Stock Overlay */}
                    {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="px-4 py-2 bg-white text-gray-900 font-semibold rounded-lg">
                                Out of Stock
                            </span>
                        </div>
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {discountPercent > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                            -{discountPercent}%
                        </span>
                    )}
                    {product.isNew && (
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                            NEW
                        </span>
                    )}
                    {product.stock < 10 && product.stock > 0 && (
                        <span className="px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                            Low Stock
                        </span>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleWishlist}
                        className={`p-2 rounded-full shadow-md transition-colors ${
                            isInWishlist
                                ? "bg-pink-500 text-white"
                                : "bg-white text-gray-700 hover:bg-pink-500 hover:text-white"
                        }`}
                    >
                        <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current" : ""}`} />
                    </button>
                    <Link
                        to={`/product/${product._id}`}
                        className="p-2 bg-white rounded-full shadow-md hover:bg-purple-500 hover:text-white transition-colors"
                    >
                        <Eye className="h-5 w-5" />
                    </Link>
                </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <Link
                        to={`/products?category=${product.category._id}`}
                        className="text-xs text-purple-600 hover:text-purple-700 uppercase tracking-wide"
                    >
                        {product.category.name}
                    </Link>
                )}
                
                {/* Title */}
                <Link to={`/product/${product._id}`}>
                    <h3 className="mt-1 text-gray-900 font-medium line-clamp-2 hover:text-purple-600 transition-colors">
                        {product.name}
                    </h3>
                </Link>
                
                {/* Rating */}
                <div className="mt-2 flex items-center gap-1">
                    <div className="flex items-center">
                        {[...Array(5)].map((_, index) => (
                            <Star
                                key={index}
                                className={`h-4 w-4 ${
                                    index < Math.floor(product.rating || 0)
                                        ? "text-yellow-400 fill-current"
                                        : "text-gray-300"
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-sm text-gray-500">
                        ({product.numReviews || 0})
                    </span>
                </div>
                
                {/* Price & Add to Cart */}
                <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">
                            ₹{product.price?.toLocaleString()}
                        </span>
                        {product.comparePrice && product.comparePrice > product.price && (
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.comparePrice?.toLocaleString()}
                            </span>
                        )}
                    </div>
                    
                    <button
                        onClick={handleAddToCart}
                        disabled={product.stock === 0}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
