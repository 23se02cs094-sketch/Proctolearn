import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "../../services/operations/authService";
import { Mail, Loader, ArrowLeft, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);
    
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await dispatch(forgotPassword(email));
        if (success) {
            setEmailSent(true);
        }
    };
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Back Link */}
                <Link
                    to="/login"
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Login</span>
                </Link>
                
                {emailSent ? (
                    // Success State
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Check Your Email
                        </h1>
                        <p className="text-gray-600 mb-6">
                            We've sent a password reset link to
                        </p>
                        <p className="text-purple-600 font-medium mb-6">
                            {email}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            Click the link in your email to reset your password. If you don't see it, check your spam folder.
                        </p>
                        <button
                            onClick={() => setEmailSent(false)}
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Try a different email
                        </button>
                    </div>
                ) : (
                    // Form State
                    <>
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                Forgot Password?
                            </h1>
                            <p className="text-gray-600">
                                No worries, we'll send you reset instructions.
                            </p>
                        </div>
                        
                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                        placeholder="Enter your email"
                                    />
                                </div>
                            </div>
                            
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;
