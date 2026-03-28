import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    getAllOrders,
    updateOrderStatusAdmin,
    addTrackingUpdateAdmin,
    updateShippingDetailsAdmin,
} from "../../services/operations/orderService";
import { Loader } from "../common";
import {
    Search,
    Eye,
    Edit2,
    X,
    Package,
    Truck,
    CheckCircle,
    Clock,
    XCircle,
    MapPin,
} from "lucide-react";

const ORDER_STATUSES = [
    "Pending",
    "Processing",
    "Confirmed",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
];

const SHIPPING_STATUSES = [
    "Pending",
    "Picked Up",
    "Shipped",
    "In Transit",
    "Out for Delivery",
    "Delivered",
    "Failed",
    "Cancelled",
    "Returned",
];

const CARRIERS = ["BlueDart", "Delhivery", "DTDC", "FedEx", "Ekart", "Shadowfax", "Other"];

const toInputDate = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const Orders = () => {
    const dispatch = useDispatch();
    const { orders, loading } = useSelector((state) => state.order);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [newStatus, setNewStatus] = useState("");
    const [newShippingStatus, setNewShippingStatus] = useState("");
    const [trackingLocation, setTrackingLocation] = useState("");
    const [trackingDescription, setTrackingDescription] = useState("");
    const [carrier, setCarrier] = useState("Other");
    const [trackingNumber, setTrackingNumber] = useState("");
    const [estimatedDelivery, setEstimatedDelivery] = useState("");

    useEffect(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    const openOrderModal = (order) => {
        setSelectedOrder(order);
        setNewStatus(order.orderStatus || "Processing");
        setNewShippingStatus(order.shipping?.status || "");
        setCarrier(order.shipping?.carrier || "Other");
        setTrackingNumber(order.shipping?.trackingNumber || "");
        setEstimatedDelivery(toInputDate(order.shipping?.estimatedDelivery));
        setTrackingLocation("");
        setTrackingDescription("");
        setShowModal(true);
    };

    const closeOrderModal = () => {
        setShowModal(false);
        setSelectedOrder(null);
        setNewStatus("");
        setNewShippingStatus("");
        setTrackingLocation("");
        setTrackingDescription("");
        setCarrier("Other");
        setTrackingNumber("");
        setEstimatedDelivery("");
    };

    const handleStatusUpdate = async () => {
        if (!selectedOrder) return;

        if (newStatus && newStatus !== selectedOrder.orderStatus) {
            await dispatch(updateOrderStatusAdmin(selectedOrder._id, newStatus));
        }

        const originalEstimatedDate = toInputDate(selectedOrder.shipping?.estimatedDelivery);
        const shippingDetailsChanged =
            carrier !== (selectedOrder.shipping?.carrier || "Other") ||
            trackingNumber !== (selectedOrder.shipping?.trackingNumber || "") ||
            estimatedDelivery !== originalEstimatedDate;

        if (shippingDetailsChanged) {
            await dispatch(
                updateShippingDetailsAdmin(selectedOrder._id, {
                    carrier,
                    trackingNumber,
                    estimatedDelivery: estimatedDelivery || undefined,
                })
            );
        }

        if (
            newShippingStatus &&
            (newShippingStatus !== selectedOrder.shipping?.status || trackingLocation || trackingDescription)
        ) {
            await dispatch(
                addTrackingUpdateAdmin(selectedOrder._id, {
                    status: newShippingStatus,
                    location: trackingLocation,
                    description:
                        trackingDescription ||
                        `Shipment status updated to ${newShippingStatus}`,
                })
            );
        }

        closeOrderModal();
        dispatch(getAllOrders());
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Pending":
                return <Clock className="h-4 w-4" />;
            case "Processing":
            case "Confirmed":
                return <Package className="h-4 w-4" />;
            case "Shipped":
            case "In Transit":
            case "Out for Delivery":
                return <Truck className="h-4 w-4" />;
            case "Delivered":
                return <CheckCircle className="h-4 w-4" />;
            case "Cancelled":
            case "Returned":
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
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

    const statuses = ["All", ...ORDER_STATUSES];

    const filteredOrders = orders.filter((order) => {
        const orderIdentity = `${order.orderId || ""} ${order._id || ""}`.toLowerCase();
        const customerName = order.user?.name?.toLowerCase() || "";
        const matchesSearch =
            orderIdentity.includes(searchQuery.toLowerCase()) ||
            customerName.includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "All" || order.orderStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <Loader fullScreen text="Loading orders..." />;
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Orders & Shipping</h1>
                    <p className="text-gray-600 mt-1">Manage order lifecycle and shipment tracking updates</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by order ID or customer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                                        statusFilter === status
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Order ID</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Customer</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Items</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Total</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Order Status</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Shipment</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-sm">
                                                {order.orderId || order._id.slice(-8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-medium text-gray-900">{order.user?.name || "Guest"}</p>
                                            <p className="text-sm text-gray-500">{order.user?.email}</p>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {order.orderItems?.length || 0} items
                                        </td>
                                        <td className="px-6 py-4 font-semibold">
                                            ₹{order.totalPrice?.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}>
                                                {getStatusIcon(order.orderStatus)}
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.shipping?.status || "Pending")}`}>
                                                    <Truck className="h-3.5 w-3.5" />
                                                    {order.shipping?.status || "Pending"}
                                                </span>
                                                <p className="text-xs text-gray-500">
                                                    {order.shipping?.trackingNumber || "Tracking pending"}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => openOrderModal(order)}
                                                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-600"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {showModal && selectedOrder && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl w-full max-w-2xl my-8">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-semibold">Update Order & Shipment</h2>
                                <button onClick={closeOrderModal} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                <p className="text-gray-600">
                                    Order: <span className="font-mono font-medium">{selectedOrder.orderId || selectedOrder._id.slice(-8).toUpperCase()}</span>
                                </p>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            {ORDER_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Status</label>
                                        <select
                                            value={newShippingStatus}
                                            onChange={(e) => setNewShippingStatus(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">No tracking update</option>
                                            {SHIPPING_STATUSES.map((status) => (
                                                <option key={status} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Number</label>
                                        <input
                                            type="text"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="TRW..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Carrier</label>
                                        <select
                                            value={carrier}
                                            onChange={(e) => setCarrier(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            {CARRIERS.map((carrierName) => (
                                                <option key={carrierName} value={carrierName}>
                                                    {carrierName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                                        <input
                                            type="date"
                                            value={estimatedDelivery}
                                            onChange={(e) => setEstimatedDelivery(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Location</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={trackingLocation}
                                                onChange={(e) => setTrackingLocation(e.target.value)}
                                                placeholder="Hub / City"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tracking Note</label>
                                    <textarea
                                        value={trackingDescription}
                                        onChange={(e) => setTrackingDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Package reached transit hub, out for delivery, etc."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={closeOrderModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleStatusUpdate}
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        Save Updates
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;
