import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getOrderById, cancelOrder, trackOrder } from "../../services/operations/orderService";
import { Loader } from "../common";
import {
    ArrowLeft,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
    CreditCard,
    Phone,
    Mail,
    Download,
} from "lucide-react";
import { handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const OrderDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const dispatch = useDispatch();
    const { currentOrder, trackingInfo, loading } = useSelector((state) => state.order);
    const [cancelling, setCancelling] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isNewOrder, setIsNewOrder] = useState(location.state?.isNewOrder || false);
    
    useEffect(() => {
        if (isNewOrder && currentOrder && !loading) {
            setShowSuccess(true);
        }
    }, [currentOrder, loading, isNewOrder]);
    
    useEffect(() => {
        if (id) {
            dispatch(getOrderById(id));
            dispatch(trackOrder(id));
        }
    }, [dispatch, id]);
    
    const handleCancelOrder = async () => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            setCancelling(true);
            await dispatch(cancelOrder(id));
            setCancelling(false);
        }
    };
    
    const getStatusStep = (status) => {
        const steps = [
            "Pending",
            "Processing",
            "Confirmed",
            "Shipped",
            "In Transit",
            "Out for Delivery",
            "Delivered",
        ];
        return steps.indexOf(status);
    };
    
    const steps = [
        { status: "Pending", icon: Clock, label: "Order Placed" },
        { status: "Processing", icon: Package, label: "Processing" },
        { status: "Confirmed", icon: Package, label: "Confirmed" },
        { status: "Shipped", icon: Truck, label: "Shipped" },
        { status: "In Transit", icon: Truck, label: "In Transit" },
        { status: "Out for Delivery", icon: Truck, label: "Out for Delivery" },
        { status: "Delivered", icon: CheckCircle, label: "Delivered" },
    ];
    
    if (loading) {
        return <Loader fullScreen text="Loading order details..." />;
    }
    
    // Show success modal for newly created orders
    if (showSuccess && currentOrder) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center px-4">
                <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
                    {/* Success Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                    </div>
                    
                    {/* Success Message */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
                    
                    {/* Order ID */}
                    <div className="bg-blue-50 rounded-xl p-4 mb-6">
                        <p className="text-sm text-gray-600 mb-1">Your order ID is</p>
                        <p className="text-lg font-mono font-bold text-blue-600">{currentOrder._id}</p>
                    </div>
                    
                    {/* Confirmation Message */}
                    <p className="text-gray-600 mb-8">You will receive a confirmation email shortly.</p>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3 flex-col sm:flex-row">
                        <Link
                            to="/"
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition"
                        >
                            Continue Shopping
                        </Link>
                        <button
                            onClick={() => {
                                setShowSuccess(false);
                                window.print();
                            }}
                            className="flex-1 px-4 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 font-semibold transition"
                        >
                            Print Order
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    if (!currentOrder) {
        return (
            <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
                <div className="text-center">
                    <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
                    <Link to="/orders" className="text-purple-600 hover:underline">
                        View All Orders
                    </Link>
                </div>
            </div>
        );
    }
    
    const currentStep = getStatusStep(currentOrder.orderStatus);
    const isCancelled = currentOrder.orderStatus === "Cancelled";
    const shippingInfo = currentOrder.shipping || trackingInfo?.shipping || null;
    const trackingTimeline =
        trackingInfo?.trackingTimeline?.length > 0
            ? [...trackingInfo.trackingTimeline].reverse()
            : [];
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/orders" className="p-2 hover:bg-gray-100 rounded-lg">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                        <p className="text-gray-500 font-mono text-sm">#{currentOrder._id}</p>
                    </div>
                </div>
                
                {/* Order Status Timeline */}
                {!isCancelled && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <h2 className="text-lg font-semibold mb-6">Order Status</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
                            {steps.map((step, index) => (
                                <div key={step.status} className="flex flex-col items-center">
                                    <div
                                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                            currentStep >= 0 && index <= currentStep
                                                ? "bg-green-100 text-green-600"
                                                : "bg-gray-100 text-gray-400"
                                        }`}
                                    >
                                        <step.icon className="h-6 w-6" />
                                    </div>
                                    <span className={`mt-2 text-xs text-center ${currentStep >= 0 && index <= currentStep ? "text-green-600 font-medium" : "text-gray-400"}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Shipment Tracking</h2>

                    {shippingInfo ? (
                        <>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <p className="text-xs text-gray-500">Tracking Number</p>
                                    <p className="font-mono text-sm text-gray-900">{shippingInfo.trackingNumber || "Pending"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Carrier</p>
                                    <p className="text-sm text-gray-900">{shippingInfo.carrier || "-"}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Shipment Status</p>
                                    <p className="text-sm font-medium text-purple-700">{shippingInfo.status || currentOrder.orderStatus}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Estimated Delivery</p>
                                    <p className="text-sm text-gray-900">
                                        {shippingInfo.estimatedDelivery
                                            ? new Date(shippingInfo.estimatedDelivery).toLocaleDateString("en-IN")
                                            : "Not available"}
                                    </p>
                                </div>
                            </div>

                            {trackingTimeline.length > 0 ? (
                                <div className="space-y-3">
                                    {trackingTimeline.map((event, index) => (
                                        <div key={`${event.status}-${index}`} className="flex items-start gap-3 border rounded-lg p-3">
                                            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500" />
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <p className="font-medium text-gray-900">{event.status}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(event.timestamp).toLocaleString("en-IN")}
                                                    </p>
                                                </div>
                                                {event.location && (
                                                    <p className="text-sm text-gray-600 mt-1">Location: {event.location}</p>
                                                )}
                                                {event.note && (
                                                    <p className="text-sm text-gray-600 mt-1">{event.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">Tracking updates will appear here as shipment moves through transit and delivery stages.</p>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-gray-500">Shipment details are being prepared for this order.</p>
                    )}
                </div>
                
                {/* Cancelled Status */}
                {isCancelled && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                        <div className="flex items-center gap-3">
                            <XCircle className="h-8 w-8 text-red-500" />
                            <div>
                                <h2 className="text-lg font-semibold text-red-700">Order Cancelled</h2>
                                <p className="text-red-600">This order has been cancelled.</p>
                            </div>
                        </div>
                    </div>
                )}
                
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                            <div className="divide-y">
                                {currentOrder.orderItems?.map((item, index) => (
                                    <div key={index} className="py-4 flex gap-4">
                                        <img
                                            src={resolveImageUrl(item.product?.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                            alt={item.product?.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                            onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                        />
                                        <div className="flex-1">
                                            <Link
                                                to={`/product/${item.product?._id}`}
                                                className="font-medium text-gray-900 hover:text-purple-600"
                                            >
                                                {item.product?.name || item.name}
                                            </Link>
                                            <p className="text-gray-500 text-sm">Qty: {item.quantity}</p>
                                            <p className="font-semibold mt-1">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="space-y-6">
                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-600" />
                                Shipping Address
                            </h2>
                            {currentOrder.shippingAddress && (
                                <div className="text-gray-600">
                                    <p>{currentOrder.shippingAddress.street}</p>
                                    <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</p>
                                    <p>{currentOrder.shippingAddress.zipCode}</p>
                                    <p>{currentOrder.shippingAddress.country}</p>
                                </div>
                            )}
                        </div>
                        
                        {/* Payment Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                Payment Info
                            </h2>
                            <div className="space-y-2 text-gray-600">
                                <p>Method: <span className="text-gray-900">{currentOrder.paymentInfo?.method || "N/A"}</span></p>
                                <p>Status: <span className={currentOrder.paymentInfo?.status === "Completed" ? "text-green-600" : "text-yellow-600"}>
                                    {currentOrder.paymentInfo?.status || "Pending"}
                                </span></p>
                                {currentOrder.paymentInfo?.transactionId && (
                                    <p className="text-xs font-mono">Txn: {currentOrder.paymentInfo.transactionId}</p>
                                )}
                            </div>
                        </div>
                        
                        {/* Order Total */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>₹{(currentOrder.itemsPrice || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span>₹{(currentOrder.shippingPrice || 0).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>₹{(currentOrder.taxPrice || 0).toLocaleString()}</span>
                                </div>
                                {currentOrder.discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₹{currentOrder.discount.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="pt-2 border-t flex justify-between font-bold text-lg">
                                    <span>Total</span>
                                    <span>₹{(currentOrder.totalPrice || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="space-y-3">
                            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Download className="h-5 w-5" />
                                Download Invoice
                            </button>
                            
                            {[
                                "Pending",
                                "Processing",
                                "Confirmed",
                            ].includes(currentOrder.orderStatus) && !isCancelled && (
                                <button
                                    onClick={handleCancelOrder}
                                    disabled={cancelling}
                                    className="w-full px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                >
                                    {cancelling ? "Cancelling..." : "Cancel Order"}
                                </button>
                            )}
                        </div>
                        
                        {/* Order Date */}
                        <p className="text-center text-sm text-gray-500">
                            Order placed on {new Date(currentOrder.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
