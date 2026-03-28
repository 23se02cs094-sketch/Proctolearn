import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
    getAdminCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory 
} from "../../services/operations/categoryService";
import { 
    FolderTree, 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    X, 
    Upload, 
    Image as ImageIcon,
    Loader2,
    AlertCircle
} from "lucide-react";

const Categories = () => {
    const dispatch = useDispatch();
    const { categories, loading, adminLoading } = useSelector((state) => state.category);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        parentCategory: "",
        isActive: true,
        order: 0
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);
    
    useEffect(() => {
        dispatch(getAdminCategories());
    }, [dispatch]);
    
    // Filter categories based on search
    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name || "",
                description: category.description || "",
                parentCategory: category.parentCategory?._id || "",
                isActive: category.isActive !== undefined ? category.isActive : true,
                order: category.order || 0
            });
            setImagePreview(category.image?.url || null);
        } else {
            setEditingCategory(null);
            setFormData({
                name: "",
                description: "",
                parentCategory: "",
                isActive: true,
                order: 0
            });
            setImagePreview(null);
        }
        setImageFile(null);
        setShowModal(true);
    };
    
    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: "",
            description: "",
            parentCategory: "",
            isActive: true,
            order: 0
        });
        setImageFile(null);
        setImagePreview(null);
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };
    
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            return;
        }
        
        const submitData = new FormData();
        submitData.append("name", formData.name);
        submitData.append("description", formData.description);
        if (formData.parentCategory) {
            submitData.append("parentCategory", formData.parentCategory);
        }
        submitData.append("isActive", formData.isActive);
        submitData.append("order", formData.order);
        
        if (imageFile) {
            submitData.append("image", imageFile);
        }
        
        let result;
        if (editingCategory) {
            result = await dispatch(updateCategory(editingCategory._id, submitData));
        } else {
            result = await dispatch(createCategory(submitData));
        }
        
        if (result) {
            handleCloseModal();
            dispatch(getAdminCategories()); // Refresh list
        }
    };
    
    const handleDelete = async (categoryId) => {
        const result = await dispatch(deleteCategory(categoryId));
        if (result) {
            setDeleteConfirm(null);
        }
    };
    
    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
                        <p className="text-gray-600">Manage product categories</p>
                    </div>
                    <button 
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Category
                    </button>
                </div>
                
                {/* Search */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                {/* Categories Grid */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center py-16">
                            <FolderTree className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchQuery ? "No Categories Found" : "No Categories Yet"}
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {searchQuery ? "Try a different search term" : "Start by creating your first category"}
                            </p>
                            {!searchQuery && (
                                <button 
                                    onClick={() => handleOpenModal()}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    Add Category
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-6">
                            {filteredCategories.map((category) => (
                                <div 
                                    key={category._id}
                                    className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 hover:border-purple-300 transition-colors"
                                >
                                    {/* Category Image */}
                                    <div className="aspect-video bg-gray-200 relative">
                                        {category.image?.url ? (
                                            <img 
                                                src={category.image.url} 
                                                alt={category.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ImageIcon className="h-12 w-12 text-gray-400" />
                                            </div>
                                        )}
                                        {!category.isActive && (
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                                                Inactive
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Category Info */}
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                                        {category.description && (
                                            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                                                {category.description}
                                            </p>
                                        )}
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleOpenModal(category)}
                                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirm(category._id)}
                                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCategory ? "Edit Category" : "Add Category"}
                            </h2>
                            <button 
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter category name"
                                />
                            </div>
                            
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="Enter description"
                                />
                            </div>
                            
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category Image
                                </label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                                >
                                    {imagePreview ? (
                                        <div className="relative">
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setImageFile(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                            <p className="text-sm text-gray-500">Click to upload image</p>
                                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            
                            {/* Parent Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Parent Category (Optional)
                                </label>
                                <select
                                    name="parentCategory"
                                    value={formData.parentCategory}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">None (Top Level)</option>
                                    {categories
                                        .filter(cat => cat._id !== editingCategory?._id)
                                        .map(cat => (
                                            <option key={cat._id} value={cat._id}>
                                                {cat.name}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>
                            
                            {/* Order */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Display Order
                                </label>
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleInputChange}
                                    min={0}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                            
                            {/* Active Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleInputChange}
                                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <label htmlFor="isActive" className="text-sm text-gray-700">
                                    Active (visible to customers)
                                </label>
                            </div>
                            
                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={adminLoading}
                                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {adminLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                    {editingCategory ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Delete Category</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this category? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                disabled={adminLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {adminLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Categories;
