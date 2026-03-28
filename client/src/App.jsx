import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Layout Components
import { Navbar, Footer, ProtectedRoute, Loader } from "./components/common";

// Page Components
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Auth Components
import { Login, Signup, VerifyOTP, ForgotPassword, ResetPassword } from "./components/Auth";

// Product Components
import { ProductList, ProductDetail } from "./components/Product";

// Cart Components
import { Cart, Checkout } from "./components/Cart";

// User Components
import { Profile, Orders, Wishlist, OrderDetail, Settings as UserSettings } from "./components/User";

// Admin Components
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./components/Admin/Dashboard";
import AdminProducts from "./components/Admin/Products";
import AdminOrders from "./components/Admin/Orders";
import AdminUsers from "./components/Admin/Users";
import AdminCategories from "./components/Admin/Categories";

function App() {
    const { isAuthenticated, loading } = useSelector((state) => state.auth);
    const location = useLocation();
    
    // Hide navbar/footer on admin pages
    const isAdminPage = location.pathname.startsWith("/admin");
    
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#333",
                        color: "#fff",
                        borderRadius: "10px",
                    },
                    success: {
                        iconTheme: {
                            primary: "#10B981",
                            secondary: "#fff",
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: "#EF4444",
                            secondary: "#fff",
                        },
                    },
                }}
            />
            
            {/* Navigation - Hidden on admin pages */}
            {!isAdminPage && <Navbar />}
            
            {/* Main Content */}
            <main className="flex-grow">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/categories" element={<ProductList />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    
                    {/* Auth Routes */}
                    <Route
                        path="/login"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
                    />
                    <Route
                        path="/signup"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <Signup />}
                    />
                    <Route
                        path="/verify-otp"
                        element={isAuthenticated ? <Navigate to="/" replace /> : <VerifyOTP />}
                    />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
                    
                    {/* Protected Routes */}
                    <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                    <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
                    <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                    <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                    
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminLogin />} />
                    <Route path="/admin/dashboard" element={
                        <ProtectedRoute adminOnly>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/products" element={
                        <ProtectedRoute adminOnly>
                            <AdminProducts />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/orders" element={
                        <ProtectedRoute adminOnly>
                            <AdminOrders />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/users" element={
                        <ProtectedRoute adminOnly>
                            <AdminUsers />
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/categories" element={
                        <ProtectedRoute adminOnly>
                            <AdminCategories />
                        </ProtectedRoute>
                    } />
                    
                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>
            
            {/* Footer - Hidden on admin pages */}
            {!isAdminPage && <Footer />}
        </div>
    );
}

// 404 Component
const NotFound = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-20">
        <div className="text-center">
            <h1 className="text-9xl font-bold text-purple-600">404</h1>
            <h2 className="text-3xl font-semibold text-gray-900 mt-4">Page Not Found</h2>
            <p className="text-gray-600 mt-2">The page you're looking for doesn't exist.</p>
            <a href="/" className="inline-block mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Go Home
            </a>
        </div>
    </div>
);

export default App;
