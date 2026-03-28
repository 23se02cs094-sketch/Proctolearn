import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCart } from "../../services/operations/cartService";
import { createOrder } from "../../services/operations/orderService";
import { setOrderLoading } from "../../redux/slices/orderSlice";
import { Loader } from "../common";
import {
    ShoppingBag,
    CreditCard,
    Wallet,
    Copy,
    Shield,
} from "lucide-react";
import toast from "react-hot-toast";
import { PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const Checkout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { items, loading: cartLoading } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.auth);
    const { loading: orderLoading } = useSelector((state) => state.order);
    
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [showUPIPayment, setShowUPIPayment] = useState(false);
    const [paymentScreenshot, setPaymentScreenshot] = useState(null);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
    });

    // UPI details - replace with your actual UPI ID
    const UPI_ID = "snehasaspara@okaxis";
    const UPI_NAME = "Saspara Sneha";
    
    useEffect(() => {
        dispatch(getCart());
        // Pre-fill user data if available
        if (user) {
            setFormData(prev => ({
                ...prev,
                firstName: user.name?.split(" ")[0] || "",
                lastName: user.name?.split(" ").slice(1).join(" ") || "",
                email: user.email || "",
                phone: user.phone || "",
            }));
        }
    }, [dispatch, user]);
    
    // Safety: Reset loading state on unmount and add timeout protection
    useEffect(() => {
        let timeoutId;
        
        if (orderLoading) {
            // Auto-reset loading after 15 seconds as safety measure
            timeoutId = setTimeout(() => {
                console.warn("Order loading state reset after timeout");
                dispatch(setOrderLoading(false));
                toast.error("Request timed out. Please try again.");
            }, 15000);
        }
        
        // Cleanup: reset loading when component unmounts or loading changes
        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            // Reset loading state when unmounting to prevent stuck state
            if (orderLoading) {
                dispatch(setOrderLoading(false));
            }
        };
    }, [orderLoading, dispatch]);
    
    // Check if form is complete
    const isFormComplete = !!(
        formData.firstName?.trim() &&
        formData.lastName?.trim() &&
        formData.email?.trim() &&
        formData.phone?.trim() &&
        formData.address?.trim() &&
        formData.city?.trim() &&
        formData.state?.trim() &&
        formData.pincode?.trim()
    );
    
    // Calculate totals - ensure items is an array
    const itemsArray = items || [];
    const subtotal = itemsArray.reduce((acc, item) => {
        return acc + (item.price || item.product?.price || 0) * item.quantity;
    }, 0);
    const shipping = subtotal > 499 ? 0 : 50;
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + shipping + tax;
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };
    
    const handlePaymentMethodClick = (method) => {
        // Validate delivery info before switching to payment
        if (!isFormComplete) {
            toast.error("Please fill all delivery information first");
            return;
        }
        
        setPaymentMethod(method);
        if (method === "UPI") {
            setShowUPIPayment(true);
        } else {
            setShowUPIPayment(false);
        }
    };
    
    const handleCopyUPI = () => {
        navigator.clipboard.writeText(UPI_ID);
        toast.success("UPI ID copied to clipboard!");
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPaymentScreenshot(file);
            toast.success("Screenshot uploaded!");
        }
    };
    
    const handleUPIOrderConfirmation = async () => {
        // Check if cart has items
        if (!itemsArray || itemsArray.length === 0) {
            toast.error("Your cart is empty!");
            navigate("/cart");
            return;
        }
        
        // Validate delivery information
        if (!isFormComplete) {
            toast.error("Please fill all delivery information");
            setShowUPIPayment(false);
            return;
        }
        
        if (!paymentScreenshot) {
            toast.error("Please upload payment screenshot");
            return;
        }
        
        const orderData = {
            orderItems: itemsArray.map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: resolveImageUrl(item.product.images?.[0]?.url, PRODUCT_PLACEHOLDER),
                quantity: item.quantity,
                price: item.price || item.product.price,
                selectedSize: item.selectedSize || "",
                selectedSku: item.selectedSku || "",
                selectedVariantId: item.variantId || null,
            })),
            shippingAddress: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.pincode,
                country: "India",
                phone: formData.phone,
            },
            paymentMethod: "UPI",
            itemsPrice: subtotal,
            shippingPrice: shipping,
            taxPrice: tax,
            totalPrice: total,
        };
        
        console.log("UPI Order Data:", orderData);
        dispatch(createOrder(orderData, navigate));
    };
    
    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        // Check if cart has items
        if (!itemsArray || itemsArray.length === 0) {
            toast.error("Your cart is empty!");
            navigate("/cart");
            return;
        }
        
        // Validate form - check each field individually for better error messaging
        if (!formData.firstName?.trim()) {
            toast.error("Please enter your first name");
            return;
        }
        if (!formData.lastName?.trim()) {
            toast.error("Please enter your last name");
            return;
        }
        if (!formData.email?.trim()) {
            toast.error("Please enter your email");
            return;
        }
        if (!formData.phone?.trim()) {
            toast.error("Please enter your phone number");
            return;
        }
        if (!formData.address?.trim()) {
            toast.error("Please enter your address");
            return;
        }
        if (!formData.city?.trim()) {
            toast.error("Please enter your city");
            return;
        }
        if (!formData.state?.trim()) {
            toast.error("Please enter your state");
            return;
        }
        if (!formData.pincode?.trim()) {
            toast.error("Please enter your pincode");
            return;
        }
        
        const orderData = {
            orderItems: itemsArray.map(item => ({
                product: item.product._id,
                name: item.product.name,
                image: resolveImageUrl(item.product.images?.[0]?.url, PRODUCT_PLACEHOLDER),
                quantity: item.quantity,
                price: item.price || item.product.price,
                selectedSize: item.selectedSize || "",
                selectedSku: item.selectedSku || "",
                selectedVariantId: item.variantId || null,
            })),
            shippingAddress: {
                street: formData.address,
                city: formData.city,
                state: formData.state,
                zipCode: formData.pincode,
                country: "India",
                phone: formData.phone,
            },
            paymentMethod,
            itemsPrice: subtotal,
            shippingPrice: shipping,
            taxPrice: tax,
            totalPrice: total,
        };
        
        console.log("Order Data:", orderData);
        dispatch(createOrder(orderData, navigate));
    };
    
    if (cartLoading) {
        return <Loader fullScreen text="Loading..." />;
    }
    
    if (!itemsArray || itemsArray.length === 0) {
        toast.error("Your cart is empty!");
        navigate("/cart");
        return null;
    }
    
    // If UPI payment view is shown
    if (showUPIPayment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pay with UPI</h1>
                            <p className="text-gray-600">Pay instantly with Google Pay</p>
                        </div>
                        
                        {/* QR Code and Details */}
                        <div className="flex flex-col items-center mb-8">
                            {/* User Avatar */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">S</span>
                                </div>
                                <h2 className="text-2xl font-semibold text-gray-800">{UPI_NAME}</h2>
                            </div>
                            
                            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 mb-6 relative">
                                <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR`}
                                    alt="UPI QR Code"
                                    className="w-64 h-64"
                                />
                                {/* Google Pay Logo in center */}
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg">
                                    <img 
                                        src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" 
                                        alt="Google Pay" 
                                        className="w-10 h-10"
                                    />
                                </div>
                            </div>
                            
                            {/* UPI ID Display */}
                            <div className="text-center mb-6">
                                <p className="text-gray-600 text-sm mb-2">UPI ID: <span className="font-semibold text-gray-900">{UPI_ID}</span></p>
                                <button
                                    onClick={handleCopyUPI}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy UPI ID
                                </button>
                            </div>
                            
                            <p className="text-gray-500 text-center mb-8">Scan to pay with any UPI app</p>
                            
                            {/* Amount Display */}
                            <div className="w-full max-w-md bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-xl mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700 font-medium">Amount:</span>
                                    <span className="text-3xl font-bold text-indigo-900">₹{total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Instructions */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="text-lg">📱</span>
                                How to pay:
                            </h3>
                            <ol className="space-y-3 text-sm text-gray-700">
                                <li className="flex gap-3">
                                    <span className="font-semibold text-indigo-600">1.</span>
                                    <span>Open your UPI app (Google Pay, PhonePe, Paytm, etc.)</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-indigo-600">2.</span>
                                    <span>Scan the QR code or use the UPI ID</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-indigo-600">3.</span>
                                    <span>Enter the amount and complete the payment</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="font-semibold text-indigo-600">4.</span>
                                    <span>Upload the payment screenshot below</span>
                                </li>
                            </ol>
                        </div>
                        
                        {/* Upload Screenshot */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-900 mb-3">
                                Upload Payment Screenshot:
                            </label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="payment-screenshot"
                                />
                                <label 
                                    htmlFor="payment-screenshot"
                                    className="cursor-pointer"
                                >
                                    {paymentScreenshot ? (
                                        <div className="flex items-center justify-center gap-2 text-green-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="font-medium">Screenshot uploaded successfully!</span>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                </svg>
                                            </div>
                                            <p className="text-gray-600 font-medium">Click to upload screenshot</p>
                                            <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowUPIPayment(false)}
                                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleUPIOrderConfirmation}
                                disabled={!paymentScreenshot || orderLoading}
                                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-lg"
                            >
                                {orderLoading ? "Processing..." : "Confirm Payment"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <form onSubmit={handlePlaceOrder} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                    {/* Order Summary */}
                    <div className="mb-8 pb-6 border-b border-gray-200">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-900 mb-4">
                            <ShoppingBag className="h-6 w-6" />
                            Order Summary
                        </h2>
                        
                        {itemsArray.map((item) => (
                            <div key={item._id} className="flex justify-between items-start mb-2">
                                <div className="text-gray-700 text-sm">
                                    <span className="text-indigo-600 font-medium">{item.product?.name}</span> x{item.quantity}
                                    {(item.selectedSize || item.selectedSku) && (
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {item.selectedSize ? `Size: ${item.selectedSize}` : ""}
                                            {item.selectedSize && item.selectedSku ? " • " : ""}
                                            {item.selectedSku ? `SKU: ${item.selectedSku}` : ""}
                                        </p>
                                    )}
                                </div>
                                <span className="font-semibold text-gray-900">
                                    ₹{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        
                        <div className="mt-4 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal:</span>
                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping:</span>
                                <span className="font-medium">₹{shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax:</span>
                                <span className="font-medium">₹{tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-indigo-900 pt-2 border-t border-gray-200">
                                <span>Total:</span>
                                <span>₹{total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Delivery Information */}
                    <div className="mb-8">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-900 mb-4">
                            <Wallet className="h-6 w-6" />
                            Delivery Information
                        </h2>
                        
                        <div className="space-y-4">
                            {/* First & Last Name */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    required
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* City, State, Pincode */}
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pincode
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Payment Options */}
                    <div className="mb-8">
                        <h2 className="flex items-center gap-2 text-xl font-bold text-indigo-900 mb-4">
                            <CreditCard className="h-6 w-6" />
                            Payment Options
                        </h2>
                        
                        <div className="space-y-3">
                            {/* Cash on Delivery */}
                            <button
                                type="button"
                                onClick={() => handlePaymentMethodClick("COD")}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    paymentMethod === "COD"
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        paymentMethod === "COD" ? "border-indigo-600" : "border-gray-300"
                                    }`}>
                                        {paymentMethod === "COD" && (
                                            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                        )}
                                    </div>
                                    <Wallet className="h-6 w-6 text-gray-700" />
                                    <div>
                                        <p className="font-semibold text-gray-900">Cash on Delivery</p>
                                        <p className="text-sm text-gray-500">Pay when you receive your order</p>
                                    </div>
                                </div>
                            </button>
                            
                            {/* UPI Payment */}
                            <button
                                type="button"
                                onClick={() => handlePaymentMethodClick("UPI")}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
                                    paymentMethod === "UPI"
                                        ? "border-indigo-600 bg-indigo-50"
                                        : "border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                        paymentMethod === "UPI" ? "border-indigo-600" : "border-gray-300"
                                    }`}>
                                        {paymentMethod === "UPI" && (
                                            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                                        )}
                                    </div>
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Pay_Logo_%282020%29.svg" alt="GPay" className="h-6 w-6" />
                                    <div>
                                        <p className="font-semibold text-gray-900">UPI Payment</p>
                                        <p className="text-sm text-gray-500">Pay instantly with Google Pay</p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    {/* Place Order Button */}
                    <button
                        type="submit"
                        disabled={!isFormComplete || orderLoading}
                        className="w-full py-4 bg-indigo-700 text-white text-lg font-semibold rounded-lg hover:bg-indigo-800 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        <Shield className="h-5 w-5" />
                        {orderLoading ? "Processing..." : "Place Order"}
                    </button>
                    
                    {/* Secure Checkout Badge */}
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Secure Checkout
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;
