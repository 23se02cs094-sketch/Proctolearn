import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAdminDashboardStats, getActiveShipmentsAdmin } from "../../services/operations/orderService";
import { Loader } from "../common";
import {
    Package,
    ShoppingCart,
    Users,
    DollarSign,
    TrendingUp,
    Eye,
    Truck,
} from "lucide-react";

const Dashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const { adminActiveShipments } = useSelector((state) => state.order);

    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const loadDashboard = async () => {
            setLoading(true);
            const stats = await getAdminDashboardStats();
            await dispatch(getActiveShipmentsAdmin({ page: 1, limit: 8 }));

            if (isMounted) {
                setDashboardStats(stats);
                setLoading(false);
            }
        };

        loadDashboard();

        return () => {
            isMounted = false;
        };
    }, [dispatch]);

    const stats = useMemo(() => {
        return [
            {
                title: "Total Revenue",
                value: `₹${(dashboardStats?.totalRevenue || 0).toLocaleString()}`,
                icon: DollarSign,
                color: "bg-green-500",
            },
            {
                title: "Total Orders",
                value: (dashboardStats?.totalOrders || 0).toLocaleString(),
                icon: ShoppingCart,
                color: "bg-blue-500",
            },
            {
                title: "Total Products",
                value: (dashboardStats?.totalProducts || 0).toLocaleString(),
                icon: Package,
                color: "bg-purple-500",
            },
            {
                title: "Total Customers",
                value: (dashboardStats?.totalUsers || 0).toLocaleString(),
                icon: Users,
                color: "bg-orange-500",
            },
        ];
    }, [dashboardStats]);

    const recentOrders = dashboardStats?.recentOrders || [];

    const getOrderStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-800";
            case "Shipped":
            case "In Transit":
            case "Out for Delivery":
                return "bg-blue-100 text-blue-800";
            case "Processing":
                return "bg-yellow-100 text-yellow-800";
            case "Confirmed":
                return "bg-indigo-100 text-indigo-800";
            case "Cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getShippingStatusColor = (status) => {
        switch (status) {
            case "Delivered":
                return "bg-green-100 text-green-800";
            case "Out for Delivery":
                return "bg-orange-100 text-orange-800";
            case "In Transit":
            case "Shipped":
                return "bg-blue-100 text-blue-800";
            case "Picked Up":
                return "bg-indigo-100 text-indigo-800";
            case "Pending":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    if (loading) {
        return <Loader fullScreen text="Loading dashboard..." />;
    }

    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.title} className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.color}`}>
                                    <stat.icon className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xs font-medium text-gray-500">Live</span>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                                <p className="text-gray-500 text-sm">{stat.title}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/admin/products"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <Package className="h-8 w-8 mb-4" />
                        <h3 className="text-xl font-semibold">Manage Products</h3>
                        <p className="text-white/80 mt-1">Add, edit or remove products</p>
                    </Link>

                    <Link
                        to="/admin/orders"
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <ShoppingCart className="h-8 w-8 mb-4" />
                        <h3 className="text-xl font-semibold">View Orders</h3>
                        <p className="text-white/80 mt-1">Process and track orders</p>
                    </Link>

                    <Link
                        to="/admin/categories"
                        className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-2xl p-6 hover:shadow-lg transition-shadow"
                    >
                        <TrendingUp className="h-8 w-8 mb-4" />
                        <h3 className="text-xl font-semibold">Categories</h3>
                        <p className="text-white/80 mt-1">Manage product categories</p>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">Active Shipments</h2>
                            <p className="text-sm text-gray-500 mt-1">Track active orders in transit, out for delivery, and shipped stages</p>
                        </div>
                        <Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium">
                            Manage Orders
                        </Link>
                    </div>

                    {adminActiveShipments.length === 0 ? (
                        <div className="text-gray-500 text-sm py-6 text-center border rounded-xl">
                            No active shipments right now.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b">
                                        <th className="pb-3 text-sm font-medium text-gray-500">Order</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Customer</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Order Status</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Shipment</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Tracking</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">ETA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {adminActiveShipments.map((order) => (
                                        <tr key={order._id} className="border-b last:border-0">
                                            <td className="py-4 font-mono text-xs">{order.orderId || order._id.slice(-8).toUpperCase()}</td>
                                            <td className="py-4">
                                                <p className="font-medium text-gray-900">{order.user?.name || "Customer"}</p>
                                                <p className="text-xs text-gray-500">{order.user?.email || "-"}</p>
                                            </td>
                                            <td className="py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td className="py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getShippingStatusColor(order.shipping?.status || "Pending")}`}>
                                                    <Truck className="h-3.5 w-3.5" />
                                                    {order.shipping?.status || "Pending"}
                                                </span>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600">{order.shipping?.trackingNumber || "Not assigned"}</td>
                                            <td className="py-4 text-sm text-gray-600">
                                                {order.shipping?.estimatedDelivery
                                                    ? new Date(order.shipping.estimatedDelivery).toLocaleDateString("en-IN")
                                                    : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link to="/admin/orders" className="text-purple-600 hover:text-purple-700 font-medium">
                            View All
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b">
                                    <th className="pb-3 text-sm font-medium text-gray-500">Order ID</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Customer</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                                    <th className="pb-3 text-sm font-medium text-gray-500">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order._id} className="border-b last:border-0">
                                        <td className="py-4 font-medium">{order.orderId || order._id.slice(-8).toUpperCase()}</td>
                                        <td className="py-4">{order.user?.name || "Customer"}</td>
                                        <td className="py-4 font-semibold">₹{(order.totalPrice || 0).toLocaleString()}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.orderStatus)}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                                        <td className="py-4">
                                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                                                <Eye className="h-4 w-4 text-gray-500" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500 text-sm">
                                            No recent orders available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
