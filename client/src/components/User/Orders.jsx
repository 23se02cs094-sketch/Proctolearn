import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMyOrders, getMyActiveShipments } from "../../services/operations/orderService";
import { Loader } from "../common";
import {
    Package,
    ChevronRight,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
} from "lucide-react";
import { handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, activeShipments, loading } = useSelector((state) => state.order);
    
    useEffect(() => {
        dispatch(getMyOrders());
        dispatch(getMyActiveShipments());
    }, [dispatch]);
    
    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case "Processing":
                return <Package className="h-5 w-5 text-blue-500" />;
            case "Shipped":
            case "In Transit":
            case "Out for Delivery":
                return <Truck className="h-5 w-5 text-purple-500" />;
            case "Delivered":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "Cancelled":
            case "Returned":
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <Package className="h-5 w-5 text-gray-500" />;
        }
    };
    
    const getStatusColor = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            case "Processing":
                return "bg-blue-100 text-blue-800";
            case "Confirmed":
                return "bg-indigo-100 text-indigo-800";
            case "Shipped":
            case "In Transit":
                return "bg-purple-100 text-purple-800";
            case "Out for Delivery":
                return "bg-orange-100 text-orange-800";
            case "Delivered":
                return "bg-green-100 text-green-800";
            case "Cancelled":
            case "Returned":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };
    
    if (loading) {
        return <Loader fullScreen text="Loading orders..." />;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

                {activeShipments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Active Shipments</h2>
                            <span className="text-sm text-gray-500">{activeShipments.length} active</span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {activeShipments.slice(0, 4).map((shipmentOrder) => (
                                <Link
                                    key={shipmentOrder._id}
                                    to={`/orders/${shipmentOrder._id}`}
                                    className="border rounded-xl p-4 hover:border-purple-300 transition-colors"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="font-mono text-xs text-gray-500">
                                            {shipmentOrder.orderId || shipmentOrder._id.slice(-8).toUpperCase()}
                                        </p>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipmentOrder.shipping?.status || shipmentOrder.orderStatus)}`}>
                                            {shipmentOrder.shipping?.status || shipmentOrder.orderStatus}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 mt-2">
                                        Tracking: {shipmentOrder.shipping?.trackingNumber || "Pending assignment"}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        ETA: {shipmentOrder.shipping?.estimatedDelivery
                                            ? new Date(shipmentOrder.shipping.estimatedDelivery).toLocaleDateString("en-IN")
                                            : "Not available"}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
                
                {orders.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
                        <Package className="h-24 w-24 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-600 mb-6">Looks like you haven't placed any orders yet.</p>
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Start Shopping
                            <ChevronRight className="h-5 w-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <Link
                                key={order._id}
                                to={`/orders/${order._id}`}
                                className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Order ID</p>
                                            <p className="font-mono text-sm">{order._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Order Date</p>
                                            <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total</p>
                                            <p className="font-semibold">₹{order.totalPrice?.toLocaleString()}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(order.orderStatus)}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {/* Order Items Preview */}
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {order.orderItems?.slice(0, 4).map((item, index) => (
                                            <div key={index} className="flex-shrink-0">
                                                <img
                                                    src={resolveImageUrl(item.product?.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                                    alt={item.product?.name || "Product"}
                                                    className="w-16 h-16 object-cover rounded-lg"
                                                    onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                                />
                                            </div>
                                        ))}
                                        {order.orderItems?.length > 4 && (
                                            <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm">
                                                +{order.orderItems.length - 4}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* View Details */}
                                    <div className="mt-4 flex items-center justify-end text-purple-600 hover:text-purple-700 font-medium">
                                        View Details
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
