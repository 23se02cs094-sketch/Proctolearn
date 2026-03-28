import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader } from "../common";
import {
    Search,
    Shield,
    ShieldOff,
    User,
    Mail,
    Calendar,
} from "lucide-react";

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("All");
    
    // Mock data - replace with actual API call
    useEffect(() => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setUsers([
                { _id: "1", name: "Priya Sharma", email: "priya@example.com", role: "user", createdAt: "2024-01-10" },
                { _id: "2", name: "Rahul Verma", email: "rahul@example.com", role: "user", createdAt: "2024-01-08" },
                { _id: "3", name: "Admin User", email: "admin@theresinworld.com", role: "admin", createdAt: "2024-01-01" },
                { _id: "4", name: "Anjali Patel", email: "anjali@example.com", role: "user", createdAt: "2024-01-05" },
                { _id: "5", name: "Vikram Kumar", email: "vikram@example.com", role: "user", createdAt: "2024-01-03" },
            ]);
            setLoading(false);
        }, 1000);
    }, []);
    
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === "All" || user.role === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });
    
    if (loading) {
        return <Loader fullScreen text="Loading users..." />;
    }
    
    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-600 mt-1">Manage registered users</p>
                </div>
                
                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {["All", "User", "Admin"].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setRoleFilter(role)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        roleFilter === role
                                            ? "bg-purple-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Email</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Joined</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                <span className="text-purple-600 font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="font-medium text-gray-900">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            user.role === "admin"
                                                ? "bg-purple-100 text-purple-800"
                                                : "bg-gray-100 text-gray-800"
                                        }`}>
                                            {user.role === "admin" ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button
                                            className={`px-3 py-1 rounded text-sm font-medium ${
                                                user.role === "admin"
                                                    ? "text-red-600 hover:bg-red-50"
                                                    : "text-purple-600 hover:bg-purple-50"
                                            }`}
                                        >
                                            {user.role === "admin" ? "Remove Admin" : "Make Admin"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
