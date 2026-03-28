import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getProfile, updateProfile, addAddress, deleteAddress, setDefaultAddress } from "../../services/operations/userService";
import { updatePassword } from "../../services/operations/authService";
import { logoutUser } from "../../services/operations/authService";
import { Loader } from "../common";
import {
    User,
    Mail,
    Phone,
    MapPin,
    Package,
    Heart,
    Settings,
    LogOut,
    Edit2,
    Plus,
    Trash2,
    Check,
    Eye,
    EyeOff,
    Camera,
} from "lucide-react";
import toast from "react-hot-toast";

const Profile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);
    
    const [activeTab, setActiveTab] = useState("profile");
    const [isEditing, setIsEditing] = useState(false);
    const [profileForm, setProfileForm] = useState({
        name: "",
        phone: "",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "India",
    });
    
    useEffect(() => {
        dispatch(getProfile());
    }, [dispatch]);
    
    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name || "",
                phone: user.phone || "",
            });
        }
    }, [user]);
    
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        const success = await dispatch(updateProfile(profileForm));
        if (success) {
            setIsEditing(false);
        }
    };
    
    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords don't match");
            return;
        }
        
        if (passwordForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        
        const success = await dispatch(updatePassword(
            passwordForm.currentPassword,
            passwordForm.newPassword
        ));
        
        if (success) {
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        }
    };
    
    const handleAddAddress = async (e) => {
        e.preventDefault();
        const success = await dispatch(addAddress(newAddress));
        if (success) {
            setShowAddressForm(false);
            setNewAddress({
                street: "",
                city: "",
                state: "",
                zipCode: "",
                country: "India",
            });
        }
    };
    
    const handleDeleteAddress = async (addressId) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            dispatch(deleteAddress(addressId));
        }
    };
    
    const handleSetDefault = (addressId) => {
        dispatch(setDefaultAddress(addressId));
    };
    
    const handleLogout = () => {
        dispatch(logoutUser(navigate));
    };
    
    const tabs = [
        { id: "profile", label: "Profile", icon: User },
        { id: "addresses", label: "Addresses", icon: MapPin },
        { id: "security", label: "Security", icon: Settings },
    ];
    
    if (loading) {
        return <Loader fullScreen text="Loading profile..." />;
    }
    
    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                            {/* User Info */}
                            <div className="text-center pb-6 border-b">
                                <div className="relative inline-block">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white text-3xl font-bold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                                        <Camera className="h-4 w-4 text-gray-600" />
                                    </button>
                                </div>
                                <h2 className="mt-4 text-xl font-semibold text-gray-900">{user?.name}</h2>
                                <p className="text-gray-500 text-sm">{user?.email}</p>
                            </div>
                            
                            {/* Navigation */}
                            <nav className="mt-6 space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? "bg-purple-50 text-purple-600"
                                                : "text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        <tab.icon className="h-5 w-5" />
                                        {tab.label}
                                    </button>
                                ))}
                                
                                <Link
                                    to="/orders"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <Package className="h-5 w-5" />
                                    My Orders
                                </Link>
                                
                                <Link
                                    to="/wishlist"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <Heart className="h-5 w-5" />
                                    Wishlist
                                </Link>

                                <Link
                                    to="/settings"
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    <Settings className="h-5 w-5" />
                                    Account Settings
                                </Link>
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="h-5 w-5" />
                                    Logout
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Main Content */}
                    <div className="lg:col-span-9 mt-8 lg:mt-0">
                        {/* Profile Tab */}
                        {activeTab === "profile" && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Personal Information</h2>
                                    <button
                                        onClick={() => setIsEditing(!isEditing)}
                                        className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                        {isEditing ? "Cancel" : "Edit"}
                                    </button>
                                </div>
                                
                                <form onSubmit={handleProfileUpdate} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={profileForm.name}
                                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <p className="px-4 py-2 bg-gray-50 rounded-lg">{user?.name}</p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-500">
                                                {user?.email}
                                                <span className="ml-2 text-xs text-green-600">(Verified)</span>
                                            </p>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Phone Number
                                            </label>
                                            {isEditing ? (
                                                <input
                                                    type="tel"
                                                    value={profileForm.phone}
                                                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    placeholder="Enter phone number"
                                                />
                                            ) : (
                                                <p className="px-4 py-2 bg-gray-50 rounded-lg">
                                                    {user?.phone || "Not provided"}
                                                </p>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Account Type
                                            </label>
                                            <p className="px-4 py-2 bg-gray-50 rounded-lg capitalize">
                                                {user?.role}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isEditing && (
                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                            >
                                                Save Changes
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}
                        
                        {/* Addresses Tab */}
                        {activeTab === "addresses" && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold">Saved Addresses</h2>
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add New
                                    </button>
                                </div>
                                
                                {/* Add Address Form */}
                                {showAddressForm && (
                                    <form onSubmit={handleAddAddress} className="mb-6 p-4 bg-gray-50 rounded-xl">
                                        <h3 className="font-medium mb-4">Add New Address</h3>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.street}
                                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.state}
                                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.zipCode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                                                    required
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.country}
                                                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddressForm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                            >
                                                Save Address
                                            </button>
                                        </div>
                                    </form>
                                )}
                                
                                {/* Addresses List */}
                                <div className="space-y-4">
                                    {user?.addresses?.length > 0 ? (
                                        user.addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                className={`p-4 border-2 rounded-xl ${
                                                    address.isDefault ? "border-purple-200 bg-purple-50" : "border-gray-200"
                                                }`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <MapPin className="h-5 w-5 text-purple-600" />
                                                            {address.isDefault && (
                                                                <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-900">
                                                            {address.street}, {address.city}
                                                        </p>
                                                        <p className="text-gray-600">
                                                            {address.state} - {address.zipCode}
                                                        </p>
                                                        <p className="text-gray-600">{address.country}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {!address.isDefault && (
                                                            <button
                                                                onClick={() => handleSetDefault(address._id)}
                                                                className="p-2 text-gray-400 hover:text-green-600"
                                                                title="Set as default"
                                                            >
                                                                <Check className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleDeleteAddress(address._id)}
                                                            className="p-2 text-gray-400 hover:text-red-600"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 text-center py-8">No addresses saved yet.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Security Tab */}
                        {activeTab === "security" && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                                
                                <form onSubmit={handlePasswordUpdate} className="max-w-md space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.current ? "text" : "password"}
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.new ? "text" : "password"}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                                required
                                                minLength={6}
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPasswords.confirm ? "text" : "password"}
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                                required
                                                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                                    >
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
