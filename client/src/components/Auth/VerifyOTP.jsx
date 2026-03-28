import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signUp, sendOtp } from "../../services/operations/authService";
import { setOtpSent } from "../../redux/slices/authSlice";
import { ArrowLeft, Loader, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const VerifyOTP = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, signupData, otpSent } = useSelector((state) => state.auth);
    
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);
    
    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);
    
    // Redirect if no signup data
    useEffect(() => {
        if (!signupData) {
            navigate("/signup");
            toast.error("Please complete signup first");
        }
    }, [signupData, navigate]);
    
    // Focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);
    
    const handleChange = (index, value) => {
        // Only allow numbers
        if (value && !/^\d+$/.test(value)) return;
        
        const newOtp = [...otp];
        
        // Handle paste
        if (value.length > 1) {
            const pastedValues = value.slice(0, 6).split("");
            pastedValues.forEach((val, i) => {
                if (i < 6) {
                    newOtp[i] = val;
                }
            });
            setOtp(newOtp);
            // Focus last filled input or last input
            const lastIndex = Math.min(pastedValues.length - 1, 5);
            inputRefs.current[lastIndex]?.focus();
            return;
        }
        
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Move to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };
    
    const handleKeyDown = (index, e) => {
        // Move to previous input on backspace
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        
        // Move to next input on right arrow
        if (e.key === "ArrowRight" && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
        
        // Move to previous input on left arrow
        if (e.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };
    
    const handleResendOTP = () => {
        if (!canResend || !signupData?.email) return;
        
        dispatch(sendOtp(signupData.email, navigate));
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        
        const otpString = otp.join("");
        
        if (otpString.length !== 6) {
            toast.error("Please enter complete OTP");
            return;
        }
        
        if (!signupData) {
            toast.error("Signup data not found. Please try again.");
            navigate("/signup");
            return;
        }
        
        dispatch(signUp(signupData, otpString, navigate));
    };
    
    const handleBack = () => {
        dispatch(setOtpSent(false));
        navigate("/signup");
    };
    
    if (!signupData) return null;
    
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Back Button */}
                <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Back to Signup</span>
                </button>
                
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Verify Your Email
                    </h1>
                    <p className="text-gray-600">
                        We've sent a 6-digit code to
                    </p>
                    <p className="text-purple-600 font-medium mt-1">
                        {signupData?.email}
                    </p>
                </div>
                
                {/* OTP Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* OTP Inputs */}
                    <div className="flex justify-center gap-3">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength="6"
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
                            />
                        ))}
                    </div>
                    
                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || otp.join("").length !== 6}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader className="h-5 w-5 animate-spin" />
                                Verifying...
                            </>
                        ) : (
                            "Verify & Create Account"
                        )}
                    </button>
                </form>
                
                {/* Resend OTP */}
                <div className="mt-6 text-center">
                    {canResend ? (
                        <button
                            onClick={handleResendOTP}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 mx-auto text-purple-600 hover:text-purple-700 font-medium transition-colors"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Resend OTP
                        </button>
                    ) : (
                        <p className="text-gray-600">
                            Resend OTP in{" "}
                            <span className="text-purple-600 font-medium">
                                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}
                            </span>
                        </p>
                    )}
                </div>
                
                {/* Help Text */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 text-center">
                        Didn't receive the code?{" "}
                        <span className="text-gray-700">
                            Check your spam folder or try resending.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyOTP;
