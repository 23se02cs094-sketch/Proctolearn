import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../services/operations/authService";
import {
    Search,
    ShoppingCart,
    Heart,
    User,
    Menu,
    X,
    ChevronDown,
    LogOut,
    Package,
    Settings,
    LayoutDashboard,
    Sparkles,
} from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const { totalItems } = useSelector((state) => state.cart);
    const { items: wishlistItems } = useSelector((state) => state.wishlist);
    
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isScrolled, setIsScrolled] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const profileRef = useRef(null);
    
    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    
    // Close profile dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // Close mobile menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location]);
    
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery("");
        }
    };
    
    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };
    
    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Categories", path: "/categories" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
    ];
    
    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
                isScrolled
                    ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-purple-500/5 py-2"
                    : "bg-white py-4"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
                <div className="flex items-center justify-between h-14 md:h-16">
                    {/* Logo */}
                    <Link 
                        to="/" 
                        className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.02]"
                    >
                        <div className="relative h-11 w-11 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-300/40 group-hover:shadow-purple-400/50 transition-all duration-500 group-hover:rotate-3">
                            <span className="text-white font-bold text-xl">R</span>
                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse" />
                        </div>
                        <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 bg-clip-text text-transparent tracking-tight">
                            The Resin World
                        </span>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1 ml-12">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`relative px-5 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group ${
                                    location.pathname === link.path
                                        ? "text-purple-600 bg-purple-50"
                                        : "text-gray-600 hover:text-purple-600 hover:bg-purple-50/50"
                                }`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <span className="relative z-10">{link.name}</span>
                                <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-300 ease-out ${
                                    location.pathname === link.path 
                                        ? "w-5 opacity-100" 
                                        : "w-0 opacity-0 group-hover:w-5 group-hover:opacity-100"
                                }`} />
                            </Link>
                        ))}
                    </div>
                    
                    {/* Search Bar */}
                    <form
                        onSubmit={handleSearch}
                        className="hidden md:flex items-center flex-1 max-w-sm mx-8 lg:mx-12"
                    >
                        <div className={`relative w-full transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsSearchFocused(true)}
                                onBlur={() => setIsSearchFocused(false)}
                                placeholder="Search products..."
                                className={`w-full pl-12 pr-5 py-3 bg-gray-50 border-2 rounded-2xl text-sm transition-all duration-300 ease-out ${
                                    isSearchFocused 
                                        ? "border-purple-400 bg-white shadow-lg shadow-purple-100 ring-4 ring-purple-50" 
                                        : "border-transparent hover:border-gray-200 hover:bg-white"
                                } focus:outline-none placeholder:text-gray-400`}
                            />
                            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-all duration-300 ${
                                isSearchFocused ? 'text-purple-500 scale-110' : 'text-gray-400'
                            }`} />
                        </div>
                    </form>
                    
                    {/* Right Icons */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Wishlist */}
                        <Link
                            to="/wishlist"
                            className="relative p-3 text-gray-600 hover:text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-300 group"
                        >
                            <Heart className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            {wishlistItems?.length > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold rounded-full shadow-md shadow-pink-200 animate-scaleIn">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>
                        
                        {/* Cart */}
                        <Link
                            to="/cart"
                            className="relative p-3 text-gray-600 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                        >
                            <ShoppingCart className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                            {totalItems > 0 && (
                                <span className="absolute top-1 right-1 h-5 w-5 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold rounded-full shadow-md shadow-purple-200 animate-scaleIn">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        
                        {/* Profile/Auth */}
                        {isAuthenticated ? (
                            <div className="relative ml-2" ref={profileRef}>
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 p-2 text-gray-600 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 group"
                                >
                                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold shadow-md shadow-purple-200 group-hover:shadow-lg group-hover:shadow-purple-300 transition-all duration-300 group-hover:scale-105">
                                        {user?.name?.charAt(0).toUpperCase() || "U"}
                                    </div>
                                    <ChevronDown className={`h-4 w-4 transition-all duration-300 ${isProfileOpen ? "rotate-180 text-purple-600" : ""}`} />
                                </button>
                                
                                {/* Profile Dropdown */}
                                <div className={`absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl shadow-purple-100/50 py-3 border border-gray-100/80 transition-all duration-300 ease-out origin-top-right ${
                                    isProfileOpen 
                                        ? "opacity-100 scale-100 translate-y-0" 
                                        : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                                }`}>
                                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 mx-3 rounded-xl mb-2">
                                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                                    </div>
                                    
                                    <div className="px-2 space-y-1">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                                        >
                                            <User className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            My Profile
                                        </Link>
                                        
                                        <Link
                                            to="/orders"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                                        >
                                            <Package className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            My Orders
                                        </Link>
                                        
                                        {user?.role === "admin" && (
                                            <Link
                                                to="/admin/dashboard"
                                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                                            >
                                                <LayoutDashboard className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        
                                        <Link
                                            to="/settings"
                                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
                                        >
                                            <Settings className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                                            Settings
                                        </Link>
                                    </div>
                                    
                                    <div className="border-t border-gray-100 mt-2 pt-2 px-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 rounded-xl hover:bg-red-50 transition-all duration-200 group"
                                        >
                                            <LogOut className="h-4 w-4 group-hover:scale-110 group-hover:-translate-x-0.5 transition-all duration-200" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="hidden sm:flex items-center gap-3 ml-2">
                                <Link
                                    to="/login"
                                    className="flex items-center justify-center px-5 py-2.5 text-purple-600 font-medium rounded-xl border-2 border-purple-200 hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 whitespace-nowrap"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-500 text-white font-medium rounded-xl shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 whitespace-nowrap"
                                >
                                    <User className="h-4 w-4" />
                                    Sign Up
                                </Link>
                            </div>
                        )}
                        
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="lg:hidden p-3 text-gray-600 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all duration-300 ml-1"
                        >
                            <div className="relative w-6 h-6">
                                <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out ${isMenuOpen ? 'rotate-45 top-3' : 'top-1'}`} />
                                <span className={`absolute block h-0.5 w-6 bg-current top-3 transition-all duration-200 ${isMenuOpen ? 'opacity-0 scale-0' : 'opacity-100'}`} />
                                <span className={`absolute block h-0.5 w-6 bg-current transform transition-all duration-300 ease-out ${isMenuOpen ? '-rotate-45 top-3' : 'top-5'}`} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Mobile Menu */}
            <div className={`lg:hidden overflow-hidden transition-all duration-500 ease-out ${
                isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
            }`}>
                <div className="bg-white border-t border-gray-100 shadow-inner">
                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="p-5">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search products..."
                                className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:bg-white focus:border-purple-400 focus:ring-4 focus:ring-purple-50 focus:outline-none transition-all duration-300 placeholder:text-gray-400"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        </div>
                    </form>
                    
                    {/* Mobile Links */}
                    <div className="px-5 pb-6 space-y-2">
                        {navLinks.map((link, index) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`block px-5 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                                    location.pathname === link.path
                                        ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                                }`}
                                style={{ 
                                    transitionDelay: isMenuOpen ? `${index * 50}ms` : '0ms',
                                    transform: isMenuOpen ? 'translateX(0)' : 'translateX(-20px)',
                                    opacity: isMenuOpen ? 1 : 0
                                }}
                            >
                                {link.name}
                            </Link>
                        ))}
                        
                        {!isAuthenticated && (
                            <div className="flex gap-3 mt-4">
                                <Link
                                    to="/login"
                                    className="flex-1 px-5 py-4 text-purple-600 text-center font-medium rounded-2xl border-2 border-purple-200 hover:bg-purple-50 transition-all duration-300"
                                    style={{ 
                                        transitionDelay: isMenuOpen ? `${navLinks.length * 50}ms` : '0ms'
                                    }}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="flex-1 px-5 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-center font-medium rounded-2xl shadow-lg shadow-purple-200 hover:shadow-xl transition-all duration-300"
                                    style={{ 
                                        transitionDelay: isMenuOpen ? `${(navLinks.length + 1) * 50}ms` : '0ms'
                                    }}
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
