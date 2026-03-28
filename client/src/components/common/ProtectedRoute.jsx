import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const location = useLocation();
    
    // For admin routes, redirect to admin login if not authenticated as admin
    if (adminOnly) {
        if (!isAuthenticated || user?.role !== "admin") {
            return <Navigate to="/admin" state={{ from: location }} replace />;
        }
    }
    
    // For regular protected routes
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return children;
};

export default ProtectedRoute;
