import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getFeaturedProducts } from "../services/operations/productService";
import { getCategories } from "../services/operations/categoryService";
import { ProductCard } from "../components/Product";
import { Loader } from "../components/common";
import { ArrowRight, Sparkles, Truck, Shield, HeadphonesIcon } from "lucide-react";
import { CATEGORY_PLACEHOLDER, handleImageError, resolveImageUrl } from "../utils/imageUrl";

const Home = () => {
    const dispatch = useDispatch();
    const { featuredProducts, loading: productLoading } = useSelector((state) => state.product);
    const { categories, loading: categoryLoading } = useSelector((state) => state.category);
    
    useEffect(() => {
        dispatch(getFeaturedProducts(8));
        dispatch(getCategories());
    }, [dispatch]);
    
    const features = [
        {
            icon: Truck,
            title: "Free Shipping",
            description: "Free shipping on orders above ₹499",
        },
        {
            icon: Shield,
            title: "Secure Payment",
            description: "100% secure payment gateway",
        },
        {
            icon: HeadphonesIcon,
            title: "24/7 Support",
            description: "Dedicated customer support",
        },
        {
            icon: Sparkles,
            title: "Handcrafted",
            description: "Each piece made with love",
        },
    ];
    
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 text-white pt-28 sm:pt-32 pb-16 sm:pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
                        <div className="text-center lg:text-left mt-4 sm:mt-6">
                            <span className="inline-block px-5 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
                                ✨ Handcrafted with Love
                            </span>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                                Discover the Beauty of{" "}
                                <span className="bg-gradient-to-r from-pink-400 to-yellow-400 bg-clip-text text-transparent">
                                    Resin Art
                                </span>
                            </h1>
                            <p className="mt-5 text-base sm:text-lg text-purple-100 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Explore our exclusive collection of handcrafted resin products - from stunning jewelry to unique home decor pieces.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/products"
                                    className="px-7 py-3.5 bg-white text-purple-900 font-semibold rounded-full hover:bg-gray-100 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
                                >
                                    Shop Now
                                    <ArrowRight className="h-5 w-5" />
                                </Link>
                                <Link
                                    to="/categories"
                                    className="px-7 py-3.5 border-2 border-white/50 text-white font-semibold rounded-full hover:bg-white/10 hover:border-white transition-all duration-300"
                                >
                                    Explore Categories
                                </Link>
                            </div>
                        </div>
                        <div className="mt-10 lg:mt-0 flex justify-center lg:justify-end">
                            <div className="relative">
                                <div className="w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full blur-3xl opacity-30 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                                <img
                                    src="/hero-product.png"
                                    alt="Resin Art"
                                    className="relative z-10 w-72 sm:w-96 lg:w-[450px] h-auto max-h-[420px] object-cover rounded-3xl shadow-2xl shadow-purple-900/40 border-4 border-white/20 transition-transform duration-500 hover:scale-[1.02]"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://images.unsplash.com/photo-1618220179428-22790b461013?w=600";
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            {/* Features Section */}
            <section className="py-12 bg-white border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center p-4">
                                <div className="w-14 h-14 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                    <feature.icon className="h-7 w-7 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                                <p className="mt-1 text-sm text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            
            {/* Categories Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">Shop by Category</h2>
                        <p className="mt-2 text-gray-600">Find exactly what you're looking for</p>
                    </div>
                    
                    {categoryLoading ? (
                        <Loader text="Loading categories..." />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                            {categories.slice(0, 8).map((category) => (
                                <Link
                                    key={category._id}
                                    to={`/products?category=${category._id}`}
                                    className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all"
                                >
                                    <img
                                        src={resolveImageUrl(category.image?.url, CATEGORY_PLACEHOLDER)}
                                        alt={category.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e) => {
                                            handleImageError(e, CATEGORY_PLACEHOLDER);
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-white font-semibold text-lg">{category.name}</h3>
                                        <p className="text-white/80 text-sm mt-1 group-hover:text-pink-300 transition-colors flex items-center gap-1">
                                            Shop Now <ArrowRight className="h-4 w-4" />
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            
            {/* Featured Products Section */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
                            <p className="mt-2 text-gray-600">Handpicked just for you</p>
                        </div>
                        <Link
                            to="/products"
                            className="hidden sm:flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                        >
                            View All
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                    
                    {productLoading ? (
                        <Loader text="Loading products..." />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                    
                    <div className="mt-8 text-center sm:hidden">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700"
                        >
                            View All Products
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </div>
                </div>
            </section>
            
            {/* Newsletter Section */}
            <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold">Stay Updated</h2>
                    <p className="mt-4 text-lg text-white/80">
                        Subscribe to our newsletter for exclusive offers, new arrivals, and crafting inspiration.
                    </p>
                    <form className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 flex-1 max-w-md"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>
            </section>
            
            {/* About Preview */}
            <section className="py-20 bg-gradient-to-br from-purple-100 via-pink-50 to-purple-100 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-200/20 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        <div className="relative flex justify-center lg:justify-start">
                            <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-3xl blur-2xl opacity-30 max-w-md"></div>
                            <img
                                src="/about-image.jpg"
                                alt="About The Resin World"
                                className="relative w-full max-w-sm lg:max-w-md h-auto max-h-80 object-cover rounded-3xl shadow-2xl shadow-purple-500/30 border-2 border-white/60 hover:shadow-purple-500/40 transition-all duration-500 hover:scale-[1.02]"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=400";
                                }}
                            />
                        </div>
                        <div className="mt-12 lg:mt-0">
                            <span className="inline-block px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-4">
                                Our Story
                            </span>
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                Crafted with{" "}
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                    Passion
                                </span>
                            </h2>
                            <p className="mt-5 text-gray-600 leading-relaxed text-lg">
                                At The Resin World, every piece tells a story. Our artisans pour their heart and soul into creating unique resin art pieces that bring beauty and elegance to your life.
                            </p>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                From stunning kitchenware to exquisite jewelry, each item is handcrafted with premium materials and meticulous attention to detail.
                            </p>
                            <Link
                                to="/about"
                                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-full shadow-lg shadow-purple-300/40 hover:shadow-xl hover:shadow-purple-400/40 hover:scale-105 transition-all duration-300"
                            >
                                Learn More About Us
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
