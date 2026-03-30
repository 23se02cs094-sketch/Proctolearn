import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { sendOtp } from "../../services/operations/authService";
import { setSignupData } from "../../redux/slices/authSlice";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader } from "lucide-react";

const normalizePhoneNumber = (rawPhone) => {
    const digits = String(rawPhone || "").replace(/\D/g, "");

    if (!digits) return "";
    if (digits.length === 10) return digits;
    if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
    if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);

    return null;
};

const Signup = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, otpSent } = useSelector((state) => state.auth);
    
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    
    const { name, email, phone, password, confirmPassword } = formData;
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear error when user types
        if (errors[e.target.name]) {
            setErrors({
                ...errors,
                [e.target.name]: "",
            });
        }
    };
    
    const validateForm = () => {
        const newErrors = {};
        
        if (!name.trim()) {
            newErrors.name = "Name is required";
        }
        
        if (!email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "Invalid email format";
        }
        
        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        const normalizedPhone = normalizePhoneNumber(phone);
        if (normalizedPhone === null) {
            newErrors.phone = "Enter a valid 10-digit phone number";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        // Store signup data for later use after OTP verification
        const normalizedPhone = normalizePhoneNumber(phone);
        dispatch(setSignupData({
            name,
            email,
            phone: normalizedPhone || "",
            password,
        }));
        
        // Send OTP to email
        dispatch(sendOtp(email, navigate));
        
        // Navigate to OTP verification page
        navigate("/verify-otp");
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        Join The Resin World today
                    </p>
                </div>
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border ${errors.name ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                placeholder="Enter your full name"
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                        )}
                    </div>
                    
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border ${errors.email ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                placeholder="Enter your email"
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                        )}
                    </div>
                    
                    {/* Phone (Optional) */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-gray-400">(Optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={phone}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-4 py-3 border ${errors.phone ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                placeholder="Enter your phone number"
                            />
                        </div>
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                        )}
                    </div>
                    
                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={password}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border ${errors.password ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                placeholder="Create a password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                        )}
                    </div>
                    
                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleChange}
                                className={`w-full pl-10 pr-12 py-3 border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all`}
                                placeholder="Confirm your password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                        )}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            "Continue"
                        )}
                    </button>
                </form>
                
                {/* Terms */}
                <p className="mt-4 text-xs text-gray-500 text-center">
                    By signing up, you agree to our{" "}
                    <Link to="/terms" className="text-purple-600 hover:underline">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-purple-600 hover:underline">
                        Privacy Policy
                    </Link>
                </p>
                
                {/* Login Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-purple-600 hover:text-purple-700 font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
