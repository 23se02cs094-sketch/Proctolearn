import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProduct, getRelatedProducts } from "../../services/operations/productService";
import { addToCart } from "../../services/operations/cartService";
import { addToWishlist, removeFromWishlist } from "../../services/operations/wishlistService";
import { getProductReviews, createReview } from "../../services/operations/reviewService";
import ProductCard from "./ProductCard";
import { Loader } from "../common";
import {
    Heart,
    ShoppingCart,
    Star,
    Minus,
    Plus,
    ChevronLeft,
    ChevronRight,
    Check,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMediaType, handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { currentProduct: product, relatedProducts, loading } = useSelector((state) => state.product);
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState("description");
    const [reviews, setReviews] = useState([]);
    const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [orderNote, setOrderNote] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [selectedVariantId, setSelectedVariantId] = useState("");
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    
    const isInWishlist = wishlistItems.some((item) => item._id === product?._id || item.product?._id === product?._id);
    
    useEffect(() => {
        dispatch(getProduct(id));
        dispatch(getRelatedProducts(id));
        loadReviews();
        setQuantity(1);
        setSelectedImage(0);
        setOrderNote("");
        setSelectedSize("");
        setSelectedVariantId("");
        setAgreedToTerms(false);
    }, [id, dispatch]);

    useEffect(() => {
        const activeVariants = (product?.variants || []).filter((variant) => variant.isActive !== false);
        if (activeVariants.length > 0) {
            setSelectedVariantId((prev) => prev || activeVariants[0]._id);
        }
    }, [product]);
    
    const loadReviews = async () => {
        const data = await getProductReviews(id);
        if (data) {
            setReviews(data.data || []);
        }
    };
    
    const handleQuantityChange = (action) => {
        const activeVariants = (product?.variants || []).filter((variant) => variant.isActive !== false);
        const selectedVariant =
            activeVariants.find((variant) => String(variant._id) === String(selectedVariantId)) || activeVariants[0] || null;
        const maxStock = selectedVariant ? selectedVariant.stock : (product?.stock || 10);

        if (action === "decrease" && quantity > 1) {
            setQuantity(quantity - 1);
        } else if (action === "increase" && quantity < maxStock) {
            setQuantity(quantity + 1);
        }
    };
    
    const handleAddToCart = () => {
        if (!isAuthenticated) {
            toast.error("Please login to add items to cart");
            navigate("/login");
            return;
        }

        const activeVariants = (product?.variants || []).filter((variant) => variant.isActive !== false);
        const selectedVariant =
            activeVariants.find((variant) => String(variant._id) === String(selectedVariantId)) || activeVariants[0] || null;

        if (activeVariants.length > 0 && !selectedVariant) {
            toast.error("Please select a size variant");
            return;
        }

        dispatch(
            addToCart(product._id, quantity, {
                selectedSize: selectedVariant?.size || selectedSize || "",
                selectedSku: selectedVariant?.sku || "",
                selectedVariantId: selectedVariant?._id || "",
            })
        );
    };
    
    const handleBuyNow = () => {
        if (!isAuthenticated) {
            toast.error("Please login to continue");
            navigate("/login");
            return;
        }

        if (!agreedToTerms) {
            toast.error("Please agree to terms and conditions");
            return;
        }

        const activeVariants = (product?.variants || []).filter((variant) => variant.isActive !== false);
        const selectedVariant =
            activeVariants.find((variant) => String(variant._id) === String(selectedVariantId)) || activeVariants[0] || null;

        if (activeVariants.length > 0 && !selectedVariant) {
            toast.error("Please select a size variant");
            return;
        }

        dispatch(
            addToCart(product._id, quantity, {
                selectedSize: selectedVariant?.size || selectedSize || "",
                selectedSku: selectedVariant?.sku || "",
                selectedVariantId: selectedVariant?._id || "",
            })
        );
        navigate("/checkout");
    };
    
    const handleWishlist = () => {
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
    
    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error("Please login to submit a review");
            return;
        }
        
        const result = await createReview({
            productId: product._id,
            ...reviewForm,
        });
        
        if (result) {
            setShowReviewForm(false);
            setReviewForm({ rating: 5, title: "", comment: "" });
            loadReviews();
        }
    };
    
    if (loading) {
        return <Loader fullScreen text="Loading product..." />;
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20">
                <div className="max-w-3xl mx-auto px-4 py-16 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Product not found</h2>
                    <p className="mt-2 text-gray-600">
                        This product may have been removed or is unavailable right now.
                    </p>
                    <Link
                        to="/categories"
                        className="inline-block mt-6 px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        Back to products
                    </Link>
                </div>
            </div>
        );
    }
    
    const activeVariants = (product.variants || []).filter((variant) => variant.isActive !== false);
    const selectedVariant =
        activeVariants.find((variant) => String(variant._id) === String(selectedVariantId)) || activeVariants[0] || null;

    const sizeOptions =
        activeVariants.length > 0
            ? activeVariants.map((variant) => variant.size)
            : [
                  ...new Set(
                      (product.specifications || [])
                          .filter((spec) => spec?.key && /size/i.test(spec.key) && spec?.value)
                          .flatMap((spec) => String(spec.value).split(",").map((size) => size.trim()).filter(Boolean))
                  ),
              ];

    const activeSize = selectedVariant?.size || selectedSize || sizeOptions[0] || "";
    const displayPrice = selectedVariant ? selectedVariant.price : product.price;
    const displayComparePrice = selectedVariant ? selectedVariant.comparePrice : (product.discountPrice || 0);
    const currentStock = selectedVariant ? selectedVariant.stock : product.stock;

    const discountPercent =
        displayComparePrice && displayComparePrice > displayPrice
            ? Math.round(((displayComparePrice - displayPrice) / displayComparePrice) * 100)
            : 0;
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-gray-600">
                        <li><Link to="/" className="hover:text-purple-600">Home</Link></li>
                        <li>/</li>
                        <li><Link to="/products" className="hover:text-purple-600">Products</Link></li>
                        {product.category && (
                            <>
                                <li>/</li>
                                <li>
                                    <Link to={`/products?category=${product.category._id}`} className="hover:text-purple-600">
                                        {product.category.name}
                                    </Link>
                                </li>
                            </>
                        )}
                        <li>/</li>
                        <li className="text-gray-900 font-medium truncate max-w-[200px]">{product.name}</li>
                    </ol>
                </nav>
                
                {/* Product Main Section */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="grid lg:grid-cols-[1.15fr_1fr] gap-8 p-6 lg:p-8">
                        {/* Image Gallery */}
                        <div className="flex flex-col-reverse lg:flex-row gap-4">
                            {product.images?.length > 1 && (
                                <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                                    {product.images.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImage(index)}
                                            className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border transition-all ${
                                                selectedImage === index ? "border-gray-900" : "border-gray-200"
                                            }`}
                                        >
                                            {getMediaType(image) === "video" ? (
                                                <video
                                                    src={resolveImageUrl(image.url)}
                                                    className="w-full h-full object-cover bg-black"
                                                    muted
                                                    playsInline
                                                    preload="metadata"
                                                />
                                            ) : (
                                                <img
                                                    src={resolveImageUrl(image.url, PRODUCT_PLACEHOLDER)}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="relative flex-1 aspect-square bg-gray-100 rounded-xl overflow-hidden">
                                {getMediaType(product.images?.[selectedImage]) === "video" ? (
                                    <video
                                        src={resolveImageUrl(product.images?.[selectedImage]?.url)}
                                        className="w-full h-full object-cover bg-black"
                                        controls
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : (
                                    <img
                                        src={resolveImageUrl(product.images?.[selectedImage]?.url, PRODUCT_PLACEHOLDER)}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                    />
                                )}

                                {product.images?.length > 1 && (
                                    <>
                                        <button
                                            onClick={() => setSelectedImage((prev) => prev === 0 ? product.images.length - 1 : prev - 1)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => setSelectedImage((prev) => prev === product.images.length - 1 ? 0 : prev + 1)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between gap-3">
                                <span className={`inline-flex items-center px-2 py-1 text-sm font-medium rounded ${product.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                                    {currentStock > 0 ? "In stock" : "Out of stock"}
                                </span>
                                {product.category && (
                                    <Link
                                        to={`/products?category=${product.category._id}`}
                                        className="text-sm text-purple-600 hover:text-purple-700 uppercase tracking-wide"
                                    >
                                        {product.category.name}
                                    </Link>
                                )}
                            </div>

                            <h1 className="text-3xl font-semibold text-gray-900">{product.name}</h1>

                            <div className="flex items-center gap-2 text-gray-500 text-sm">
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
                                <span>({product.numReviews || 0})</span>
                            </div>

                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-semibold text-gray-900">
                                    ₹{displayPrice?.toLocaleString()}
                                </span>
                                {displayComparePrice && displayComparePrice > displayPrice && (
                                    <span className="text-lg text-gray-400 line-through">
                                        ₹{displayComparePrice?.toLocaleString()}
                                    </span>
                                )}
                                {discountPercent > 0 && (
                                    <span className="text-sm font-medium text-emerald-700">
                                        Save {discountPercent}%
                                    </span>
                                )}
                            </div>

                            {selectedVariant?.sku && (
                                <p className="text-sm text-gray-500">SKU: {selectedVariant.sku}</p>
                            )}

                            {sizeOptions.length > 0 && (
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">SIZE</p>
                                    <div className="flex flex-wrap gap-2">
                                        {sizeOptions.map((size) => (
                                            <button
                                                key={size}
                                                type="button"
                                                onClick={() => {
                                                    if (activeVariants.length > 0) {
                                                        const variant = activeVariants.find((item) => item.size === size);
                                                        setSelectedVariantId(variant?._id || "");
                                                    } else {
                                                        setSelectedSize(size);
                                                    }
                                                    setQuantity(1);
                                                }}
                                                className={`px-3 py-1.5 border text-sm transition-colors ${
                                                    activeSize === size
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : "border-gray-300 text-gray-700 hover:border-gray-500"
                                                }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label htmlFor="order-note" className="text-sm font-medium text-gray-700">
                                    NOTES
                                </label>
                                <textarea
                                    id="order-note"
                                    value={orderNote}
                                    onChange={(e) => setOrderNote(e.target.value)}
                                    rows={3}
                                    placeholder="Write your notes for the order"
                                    className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="inline-flex items-center border border-gray-300 rounded-md">
                                    <button
                                        onClick={() => handleQuantityChange("decrease")}
                                        disabled={quantity <= 1}
                                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </button>
                                    <span className="px-4 py-2 text-sm font-medium">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange("increase")}
                                        disabled={quantity >= currentStock}
                                        className="px-3 py-2 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={currentStock === 0}
                                    className="flex-1 bg-gray-900 text-white font-semibold py-2.5 rounded-md hover:bg-black transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    ADD TO CART
                                </button>
                            </div>

                            <button
                                onClick={handleWishlist}
                                className="inline-flex items-center gap-2 w-fit text-gray-700 hover:text-purple-700 transition-colors"
                            >
                                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current text-pink-500" : ""}`} />
                                ADD TO WISHLIST
                            </button>

                            <label className="inline-flex items-center gap-2 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                />
                                I agree with terms and conditions
                            </label>

                            <button
                                onClick={handleBuyNow}
                                disabled={currentStock === 0 || !agreedToTerms}
                                className="w-full bg-amber-300 text-gray-900 font-semibold py-2.5 rounded-md hover:bg-amber-400 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                            >
                                BUY IT NOW
                            </button>

                            <div className="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-100">
                                <p>Stock: {currentStock}</p>
                                <p>Damage in courier is not covered without proper unboxing proof.</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Tabs Section */}
                    <div className="border-t border-gray-200">
                        <div className="px-6 lg:px-8">
                            <nav className="flex gap-8 overflow-x-auto">
                                {["description", "reviews", "shipping"].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                                            activeTab === tab
                                                ? "border-purple-600 text-purple-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {tab === "reviews" && ` (${reviews.length})`}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        
                        <div className="p-6 lg:p-8">
                            {activeTab === "description" && (
                                <div className="prose max-w-none">
                                    <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            )}
                            
                            {activeTab === "reviews" && (
                                <div>
                                    {/* Write Review Button */}
                                    {isAuthenticated && !showReviewForm && (
                                        <button
                                            onClick={() => setShowReviewForm(true)}
                                            className="mb-6 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                        >
                                            Write a Review
                                        </button>
                                    )}
                                    
                                    {/* Review Form */}
                                    {showReviewForm && (
                                        <form onSubmit={handleSubmitReview} className="mb-8 p-6 bg-gray-50 rounded-xl">
                                            <h3 className="text-lg font-semibold mb-4">Write Your Review</h3>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Rating
                                                </label>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className="p-1"
                                                        >
                                                            <Star
                                                                className={`h-8 w-8 ${
                                                                    star <= reviewForm.rating
                                                                        ? "text-yellow-400 fill-current"
                                                                        : "text-gray-300"
                                                                }`}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Review Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={reviewForm.title}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Give your review a title"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Your Review
                                                </label>
                                                <textarea
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    rows="4"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Share your experience with this product"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReviewForm(false)}
                                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                                >
                                                    Submit Review
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                    
                                    {/* Reviews List */}
                                    {reviews.length > 0 ? (
                                        <div className="space-y-6">
                                            {reviews.map((review) => (
                                                <div key={review._id} className="border-b border-gray-200 pb-6 last:border-0">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-medium">
                                                                {review.user?.name?.charAt(0).toUpperCase() || "U"}
                                                            </div>
                                                            <div>
                                                                <p className="font-medium">{review.user?.name || "Anonymous"}</p>
                                                                <div className="flex items-center gap-1">
                                                                    {[...Array(5)].map((_, index) => (
                                                                        <Star
                                                                            key={index}
                                                                            className={`h-4 w-4 ${
                                                                                index < review.rating
                                                                                    ? "text-yellow-400 fill-current"
                                                                                    : "text-gray-300"
                                                                            }`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <span className="text-sm text-gray-500">
                                                            {new Date(review.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {review.title && (
                                                        <h4 className="mt-3 font-medium">{review.title}</h4>
                                                    )}
                                                    <p className="mt-2 text-gray-600">{review.comment}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">
                                            No reviews yet. Be the first to review this product!
                                        </p>
                                    )}
                                </div>
                            )}
                            
                            {activeTab === "shipping" && (
                                <div className="prose max-w-none">
                                    <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Free shipping on orders above ₹499</li>
                                        <li>• Standard delivery: 5-7 business days</li>
                                        <li>• Express delivery: 2-3 business days (additional charges apply)</li>
                                        <li>• We ship across India</li>
                                    </ul>
                                    
                                    <h3 className="text-lg font-semibold mt-6 mb-4">Return Policy</h3>
                                    <ul className="space-y-2 text-gray-600">
                                        <li>• Easy returns within 7 days of delivery</li>
                                        <li>• Returns will only be accepted if there is a defect or damage to the product.</li>
                                        <li>• Refund will be processed within 5-7 business days</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.slice(0, 4).map((relatedProduct) => (
                                <ProductCard key={relatedProduct._id} product={relatedProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetail;
