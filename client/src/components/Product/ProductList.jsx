import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProducts } from "../../services/operations/productService";
import { getCategories } from "../../services/operations/categoryService";
import { clearFilters } from "../../redux/slices/productSlice";
import ProductCard from "./ProductCard";
import { Loader } from "../common";
import {
    Filter,
    SlidersHorizontal,
    X,
    ChevronDown,
    Grid,
    List,
    Search,
} from "lucide-react";

const isMongoObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(value || "");

const getFiltersFromSearchParams = (searchParams) => ({
    category: isMongoObjectId(searchParams.get("category")) ? searchParams.get("category") : "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "-createdAt",
    search: searchParams.get("search") || "",
});

const ProductList = () => {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const { products, loading, totalProducts, totalPages, currentPage } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);
    
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState("grid");
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [localFilters, setLocalFilters] = useState(() => getFiltersFromSearchParams(searchParams));
    
    // Load categories on mount
    useEffect(() => {
        dispatch(getCategories());
    }, [dispatch]);

    // Keep local filter inputs in sync with URL params (e.g. navbar search)
    useEffect(() => {
        setLocalFilters(getFiltersFromSearchParams(searchParams));
    }, [searchParams]);
    
    // Fetch products when filters change
    useEffect(() => {
        const page = searchParams.get("page") || 1;
        const filtersFromParams = getFiltersFromSearchParams(searchParams);
        dispatch(getProducts({
            page,
            limit: 12,
            ...filtersFromParams,
        }));
    }, [dispatch, searchParams]);

    const handleSortChange = (sortValue) => {
        const nextFilters = { ...localFilters, sort: sortValue };
        setLocalFilters(nextFilters);

        const params = new URLSearchParams(searchParams);
        if (sortValue) {
            params.set("sort", sortValue);
        } else {
            params.delete("sort");
        }
        params.delete("page");
        setSearchParams(params);
    };
    
    // Update URL params when filters change
    const applyFilters = () => {
        const filtersToApply = {
            ...localFilters,
            category: isMongoObjectId(localFilters.category) ? localFilters.category : "",
        };

        const params = new URLSearchParams();
        Object.entries(filtersToApply).forEach(([key, value]) => {
            if (value) params.set(key, value);
        });
        setSearchParams(params);
        setShowFilters(false);
    };
    
    const handleClearFilters = () => {
        const defaultFilters = {
            category: "",
            minPrice: "",
            maxPrice: "",
            sort: "-createdAt",
            search: "",
        };
        setLocalFilters(defaultFilters);
        setSearchParams(new URLSearchParams());
        dispatch(clearFilters());
    };
    
    const handlePageChange = (page) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    
    const sortOptions = [
        { value: "-createdAt", label: "Newest First" },
        { value: "createdAt", label: "Oldest First" },
        { value: "price", label: "Price: Low to High" },
        { value: "-price", label: "Price: High to Low" },
        { value: "-rating", label: "Highest Rated" },
        { value: "name", label: "Name: A to Z" },
    ];
    
    // Use API categories so category filters always send valid ObjectId values.
    const categoryOptions = [
        { value: "", label: "All Categories", icon: "🏠" },
        ...categories.map((category) => ({
            value: category._id,
            label: category.name,
            icon: "📦",
        })),
    ];
    
    // Get selected category label
    const getSelectedCategoryLabel = () => {
        const selected = categoryOptions.find(opt => opt.value === localFilters.category);
        return selected ? selected.label : "All Categories";
    };
    
    // Handle category selection
    const handleCategorySelect = (value) => {
        const safeCategory = isMongoObjectId(value) ? value : "";
        const nextFilters = { ...localFilters, category: safeCategory };

        setLocalFilters(nextFilters);

        const params = new URLSearchParams();
        Object.entries(nextFilters).forEach(([key, filterValue]) => {
            if (filterValue) params.set(key, filterValue);
        });
        params.delete("page");
        setSearchParams(params);

        setShowCategoryDropdown(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="mt-1 text-gray-600">
                            {totalProducts || 0} products found
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        {/* View Mode Toggle */}
                        <div className="hidden sm:flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2 rounded ${viewMode === "grid" ? "bg-purple-100 text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <Grid className="h-5 w-5" />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2 rounded ${viewMode === "list" ? "bg-purple-100 text-purple-600" : "text-gray-500 hover:text-gray-700"}`}
                            >
                                <List className="h-5 w-5" />
                            </button>
                        </div>
                        
                        {/* Sort Dropdown */}
                        <select
                            value={localFilters.sort}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                        
                        {/* Filter Toggle Button (Mobile) */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg"
                        >
                            <Filter className="h-5 w-5" />
                            Filters
                        </button>
                    </div>
                </div>
                
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`
                        fixed lg:static inset-0 z-50 lg:z-0 
                        ${showFilters ? "block" : "hidden lg:block"}
                        lg:w-64 lg:flex-shrink-0
                    `}>
                        {/* Overlay */}
                        <div
                            className="fixed inset-0 bg-black/50 lg:hidden"
                            onClick={() => setShowFilters(false)}
                        />
                        
                        {/* Filter Panel */}
                        <div className="fixed lg:static right-0 top-0 h-full w-80 lg:w-full bg-white lg:rounded-xl shadow-lg lg:shadow-sm p-6 overflow-y-auto">
                            {/* Filter Header */}
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold flex items-center gap-2">
                                    <SlidersHorizontal className="h-5 w-5" />
                                    Filters
                                </h2>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            {/* Search */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={localFilters.search}
                                        onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                </div>
                            </div>
                            
                            {/* Category Filter */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Category
                                </label>
                                <div className="relative">
                                    {/* Dropdown Trigger Button */}
                                    <button
                                        type="button"
                                        onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-purple-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex items-center justify-between group"
                                    >
                                        <span className={`${localFilters.category ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                            {getSelectedCategoryLabel()}
                                        </span>
                                        <ChevronDown className={`h-5 w-5 text-gray-400 group-hover:text-purple-500 transition-transform duration-200 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                                    </button>
                                    
                                    {/* Dropdown Menu */}
                                    {showCategoryDropdown && (
                                        <>
                                            {/* Backdrop */}
                                            <div 
                                                className="fixed inset-0 z-10" 
                                                onClick={() => setShowCategoryDropdown(false)}
                                            />
                                            
                                            {/* Dropdown Card */}
                                            <div className="absolute z-20 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden animate-fadeInDown">
                                                <div className="py-2">
                                                    {categoryOptions.map((option, index) => (
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            onClick={() => handleCategorySelect(option.value)}
                                                            className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-150 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 group
                                                                ${localFilters.category === option.value 
                                                                    ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500' 
                                                                    : 'border-l-4 border-transparent'}
                                                            `}
                                                        >
                                                            <span className="text-lg">{option.icon}</span>
                                                            <span className={`font-medium transition-colors ${
                                                                localFilters.category === option.value 
                                                                    ? 'text-purple-700' 
                                                                    : 'text-gray-700 group-hover:text-purple-600'
                                                            }`}>
                                                                {option.label}
                                                            </span>
                                                            {localFilters.category === option.value && (
                                                                <span className="ml-auto">
                                                                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </span>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            
                            {/* Price Range */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Price Range
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={localFilters.minPrice}
                                        onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                                        placeholder="Min"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <span className="text-gray-500">-</span>
                                    <input
                                        type="number"
                                        value={localFilters.maxPrice}
                                        onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                                        placeholder="Max"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            {/* Filter Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClearFilters}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={applyFilters}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </aside>
                    
                    {/* Products Grid */}
                    <main className="flex-1">
                        {loading ? (
                            <Loader text="Loading products..." />
                        ) : products.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No products found
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Try adjusting your filters or search terms.
                                </p>
                                <button
                                    onClick={handleClearFilters}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className={`
                                    grid gap-6
                                    ${viewMode === "grid"
                                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                                        : "grid-cols-1"
                                    }
                                `}>
                                    {products.map((product) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                            viewMode={viewMode}
                                        />
                                    ))}
                                </div>
                                
                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex justify-center">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            
                                            {[...Array(totalPages)].map((_, index) => (
                                                <button
                                                    key={index + 1}
                                                    onClick={() => handlePageChange(index + 1)}
                                                    className={`w-10 h-10 rounded-lg ${
                                                        currentPage === index + 1
                                                            ? "bg-purple-600 text-white"
                                                            : "border border-gray-300 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {index + 1}
                                                </button>
                                            ))}
                                            
                                            <button
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ProductList;
