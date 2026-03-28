import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getUserSettings, updateUserSettings } from "../../services/operations/userService";
import { Loader } from "../common";
import {
    Settings as SettingsIcon,
    Bell,
    CreditCard,
    MapPin,
    Save,
    RotateCcw,
    Package,
    User,
} from "lucide-react";

const defaultSettingsState = {
    notifications: {
        orderUpdates: true,
        shippingUpdates: true,
        promotions: true,
        wishlistAlerts: true,
        priceDropAlerts: true,
    },
    communication: {
        email: true,
        sms: false,
        whatsapp: false,
    },
    shopping: {
        preferredPaymentMethod: "COD",
        currency: "INR",
        defaultAddressId: "",
    },
};

const Settings = () => {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    const [settings, setSettings] = useState(defaultSettingsState);
    const [addresses, setAddresses] = useState([]);
    const [initialSettings, setInitialSettings] = useState(defaultSettingsState);

    useEffect(() => {
        const loadSettings = async () => {
            const response = await dispatch(getUserSettings());
            if (response) {
                const normalized = {
                    notifications: {
                        ...defaultSettingsState.notifications,
                        ...(response.settings?.notifications || {}),
                    },
                    communication: {
                        ...defaultSettingsState.communication,
                        ...(response.settings?.communication || {}),
                    },
                    shopping: {
                        ...defaultSettingsState.shopping,
                        ...(response.settings?.shopping || {}),
                        defaultAddressId: response.settings?.shopping?.defaultAddressId || "",
                    },
                };

                setSettings(normalized);
                setInitialSettings(normalized);
                setAddresses(response.addresses || []);
            }
        };

        loadSettings();
    }, [dispatch]);

    const isDirty = useMemo(() => {
        return JSON.stringify(settings) !== JSON.stringify(initialSettings);
    }, [settings, initialSettings]);

    const handleToggle = (group, key) => {
        setSettings((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: !prev[group][key],
            },
        }));
    };

    const handleSelectChange = (group, key, value) => {
        setSettings((prev) => ({
            ...prev,
            [group]: {
                ...prev[group],
                [key]: value,
            },
        }));
    };

    const handleReset = () => {
        setSettings(initialSettings);
    };

    const handleSave = async () => {
        const payload = {
            ...settings,
            shopping: {
                ...settings.shopping,
                defaultAddressId: settings.shopping.defaultAddressId || null,
            },
        };

        const success = await dispatch(updateUserSettings(payload));
        if (success) {
            setInitialSettings(settings);
        }
    };

    if (loading && !user) {
        return <Loader fullScreen text="Loading settings..." />;
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
                        <p className="text-gray-600 mt-1">Manage your ecommerce preferences and communication options</p>
                    </div>
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700"
                    >
                        <User className="h-4 w-4" />
                        Profile
                    </Link>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <Bell className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold">Notification Preferences</h2>
                            </div>

                            <div className="space-y-4">
                                {[
                                    ["orderUpdates", "Order updates"],
                                    ["shippingUpdates", "Shipping & delivery updates"],
                                    ["promotions", "Promotions and offers"],
                                    ["wishlistAlerts", "Wishlist back-in-stock alerts"],
                                    ["priceDropAlerts", "Price drop alerts"],
                                ].map(([key, label]) => (
                                    <label key={key} className="flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50">
                                        <span className="text-gray-800">{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={settings.notifications[key]}
                                            onChange={() => handleToggle("notifications", key)}
                                            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold">Shopping Preferences</h2>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Payment Method</label>
                                    <select
                                        value={settings.shopping.preferredPaymentMethod}
                                        onChange={(e) => handleSelectChange("shopping", "preferredPaymentMethod", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="COD">Cash on Delivery</option>
                                        <option value="Card">Card</option>
                                        <option value="UPI">UPI</option>
                                        <option value="NetBanking">Net Banking</option>
                                        <option value="Wallet">Wallet</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                    <select
                                        value={settings.shopping.currency}
                                        onChange={(e) => handleSelectChange("shopping", "currency", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="INR">INR (₹)</option>
                                        <option value="USD">USD ($)</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Address</label>
                                    <select
                                        value={settings.shopping.defaultAddressId || ""}
                                        onChange={(e) => handleSelectChange("shopping", "defaultAddressId", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="">No default address</option>
                                        {addresses.map((address) => (
                                            <option key={address._id} value={address._id}>
                                                {address.street}, {address.city}, {address.state} - {address.zipCode}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-5">
                                <SettingsIcon className="h-5 w-5 text-purple-600" />
                                <h2 className="text-xl font-semibold">Communication Channels</h2>
                            </div>

                            <div className="space-y-4">
                                {[
                                    ["email", "Email notifications"],
                                    ["sms", "SMS notifications"],
                                    ["whatsapp", "WhatsApp notifications"],
                                ].map(([key, label]) => (
                                    <label key={key} className="flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50">
                                        <span className="text-gray-800">{label}</span>
                                        <input
                                            type="checkbox"
                                            checked={settings.communication[key]}
                                            onChange={() => handleToggle("communication", key)}
                                            className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                        />
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Quick Account Actions</h3>
                            <div className="space-y-3">
                                <Link to="/orders" className="w-full inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
                                    <Package className="h-4 w-4" />
                                    My Orders
                                </Link>
                                <Link to="/profile" className="w-full inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 text-gray-700">
                                    <MapPin className="h-4 w-4" />
                                    Manage Addresses
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Save Changes</h3>
                            <p className="text-sm text-gray-600 mb-4">Apply your settings for checkout defaults, order alerts, and delivery communication.</p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleSave}
                                    disabled={!isDirty || loading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-60"
                                >
                                    <Save className="h-4 w-4" />
                                    Save Settings
                                </button>

                                <button
                                    onClick={handleReset}
                                    disabled={!isDirty || loading}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                    Reset Changes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
