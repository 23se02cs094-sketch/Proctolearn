import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "../../services/operations/productService";
import { getCategories } from "../../services/operations/categoryService";
import { apiConnector } from "../../services/apiConnector";
import { adminEndpoints } from "../../services/api";
import { Loader } from "../common";
import {
    Plus,
    Edit2,
    Trash2,
    Search,
    Image,
    X,
    Upload,
} from "lucide-react";
import toast from "react-hot-toast";
import { getMediaType, handleImageError, PRODUCT_PLACEHOLDER, resolveImageUrl } from "../../utils/imageUrl";

const Products = () => {
    const dispatch = useDispatch();
    const { products, loading, totalPages, currentPage } = useSelector((state) => state.product);
    const { categories } = useSelector((state) => state.category);
    
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);
    const [variantRows, setVariantRows] = useState([
        { size: "", sku: "", price: "", comparePrice: "", stock: "", isActive: true },
    ]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        comparePrice: "",
        category: "",
        stock: "",
    });

    const hasConfiguredVariants = variantRows.some(
        (variant) => variant.size.trim() && variant.sku.trim()
    );
    
    useEffect(() => {
        dispatch(getAllProducts({ all: true }));
        dispatch(getCategories());
    }, [dispatch]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        const hasPartialVariantRow = variantRows.some((variant) => {
            const hasAnyValue = [
                variant.size,
                variant.sku,
                variant.price,
                variant.comparePrice,
                variant.stock,
            ].some((value) => String(value || "").trim() !== "");

            const hasRequiredValues =
                String(variant.size || "").trim() !== "" &&
                String(variant.sku || "").trim() !== "" &&
                String(variant.price || "").trim() !== "" &&
                String(variant.stock || "").trim() !== "";

            return hasAnyValue && !hasRequiredValues;
        });

        if (hasPartialVariantRow) {
            toast.error("Please complete size, SKU, price and stock for each variant row");
            return;
        }
        
        if (uploadedImages.length === 0 && !editingProduct) {
            toast.error("Please upload at least one image");
            return;
        }
        
        const productData = {
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            discountPrice: Number(formData.comparePrice) || 0,
            category: formData.category,
            stock: Number(formData.stock),
            images: uploadedImages.length > 0 ? uploadedImages : undefined,
            variants: variantRows
                .filter(
                    (variant) =>
                        variant.size.trim() &&
                        variant.sku.trim() &&
                        String(variant.price || "").trim() !== "" &&
                        String(variant.stock || "").trim() !== ""
                )
                .map((variant) => ({
                    size: variant.size.trim(),
                    sku: variant.sku.trim().toUpperCase(),
                    price: Number(variant.price),
                    comparePrice: Number(variant.comparePrice || 0),
                    stock: Number(variant.stock),
                    isActive: variant.isActive,
                })),
        };
        
        let success;
        if (editingProduct) {
            success = await dispatch(updateProduct(editingProduct._id, productData));
        } else {
            success = await dispatch(createProduct(productData));
        }
        
        if (success) {
            setShowModal(false);
            resetForm();
            dispatch(getAllProducts({ all: true }));
        }
    };
    
    const handleEdit = (product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            comparePrice: product.discountPrice || "",
            category: product.category?._id || "",
            stock: product.stock,
        });
        setUploadedImages(product.images || []);
        setVariantRows(
            product.variants?.length > 0
                ? product.variants.map((variant) => ({
                      size: variant.size || "",
                      sku: variant.sku || "",
                      price: variant.price || "",
                      comparePrice: variant.comparePrice || "",
                      stock: variant.stock || "",
                      isActive: variant.isActive !== false,
                  }))
                : [{ size: "", sku: "", price: "", comparePrice: "", stock: "", isActive: true }]
        );
        setShowModal(true);
    };
    
    const handleDelete = async (productId) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            const success = await dispatch(deleteProduct(productId));
            if (success) {
                dispatch(getAllProducts({ all: true }));
            }
        }
    };
    
    const resetForm = () => {
        setEditingProduct(null);
        setUploadedImages([]);
        setFormData({
            name: "",
            description: "",
            price: "",
            comparePrice: "",
            category: "",
            stock: "",
        });
        setVariantRows([{ size: "", sku: "", price: "", comparePrice: "", stock: "", isActive: true }]);
    };

    const handleVariantChange = (index, field, value) => {
        setVariantRows((prev) =>
            prev.map((variant, variantIndex) =>
                variantIndex === index ? { ...variant, [field]: value } : variant
            )
        );
    };

    const addVariantRow = () => {
        setVariantRows((prev) => [...prev, { size: "", sku: "", price: "", comparePrice: "", stock: "", isActive: true }]);
    };

    const removeVariantRow = (index) => {
        setVariantRows((prev) => {
            if (prev.length === 1) return prev;
            return prev.filter((_, variantIndex) => variantIndex !== index);
        });
    };
    
    const handleImageChange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        setUploading(true);
        const toastId = toast.loading(`Uploading ${files.length} file(s)...`);
        
        try {
            const formDataToUpload = new FormData();
            files.forEach((file) => {
                formDataToUpload.append("images", file);
            });
            
            const response = await apiConnector("POST", adminEndpoints.UPLOAD_IMAGES, formDataToUpload, {
                "Content-Type": "multipart/form-data",
            });
            
            if (response.data.success) {
                setUploadedImages((prev) => [...prev, ...response.data.data]);
                toast.success(`${response.data.data.length} file(s) uploaded successfully`, { id: toastId });
            } else {
                toast.error(response.data.message || "Failed to upload files", { id: toastId });
            }
        } catch (error) {
            console.error("Image upload error:", error);
            toast.error(error.response?.data?.message || "Failed to upload files", { id: toastId });
        } finally {
            setUploading(false);
        }
    };
    
    const removeUploadedImage = (index) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };
    
    if (loading) {
        return <Loader fullScreen text="Loading products..." />;
    }
    
    return (
        <div className="min-h-screen bg-gray-100 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
                        <p className="text-gray-600 mt-1">Manage your product inventory</p>
                    </div>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                        <Plus className="h-5 w-5" />
                        Add Product
                    </button>
                </div>
                
                {/* Search */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
                
                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Product</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Category</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Price</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Stock</th>
                                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.filter(p => 
                                p.name.toLowerCase().includes(searchQuery.toLowerCase())
                            ).map((product) => (
                                <tr key={product._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <img
                                                src={resolveImageUrl(product.images?.[0]?.url, PRODUCT_PLACEHOLDER)}
                                                alt={product.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                                onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{product.name}</p>
                                                <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {product.category?.name || "N/A"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold">₹{product.price?.toLocaleString()}</p>
                                        {product.discountPrice && (
                                            <p className="text-sm text-gray-400 line-through">₹{product.discountPrice?.toLocaleString()}</p>
                                        )}
                                        {product.variants?.length > 0 && (
                                            <p className="text-xs text-purple-600 mt-1">{product.variants.length} variant(s)</p>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            product.stock > 10 
                                                ? "bg-green-100 text-green-800" 
                                                : product.stock > 0 
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-red-100 text-red-800"
                                        }`}>
                                            {product.stock > 0 ? product.stock : "Out of Stock"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEdit(product)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-purple-600"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product._id)}
                                                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-semibold">
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required={!hasConfiguredVariants}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Compare Price (₹)</label>
                                        <input
                                            type="number"
                                            value={formData.comparePrice}
                                            onChange={(e) => setFormData({ ...formData, comparePrice: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>{cat.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                                        <input
                                            type="number"
                                            value={formData.stock}
                                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                            required={!hasConfiguredVariants}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        />
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Size Variants & SKU</h3>
                                            <p className="text-xs text-gray-500">Set size-wise price, compare price, stock, and SKU</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addVariantRow}
                                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Add Variant
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {variantRows.map((variant, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                                <input
                                                    type="text"
                                                    placeholder="Size"
                                                    value={variant.size}
                                                    onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="SKU"
                                                    value={variant.sku}
                                                    onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Price"
                                                    value={variant.price}
                                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Compare"
                                                    value={variant.comparePrice}
                                                    onChange={(e) => handleVariantChange(index, "comparePrice", e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Stock"
                                                    value={variant.stock}
                                                    onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                                    className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariantRow(index)}
                                                    className="col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                    title="Remove variant"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                                <label className="col-span-1 flex items-center justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={variant.isActive}
                                                        onChange={(e) => handleVariantChange(index, "isActive", e.target.checked)}
                                                        className="h-4 w-4 text-purple-600 border-gray-300 rounded"
                                                    />
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Media</label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        {uploading ? (
                                            <div className="flex flex-col items-center">
                                                <Upload className="h-8 w-8 text-purple-500 animate-pulse mx-auto mb-2" />
                                                <p className="text-purple-600">Uploading files...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Image className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                                <input
                                                    type="file"
                                                    multiple
                                                    accept="image/*,video/mp4,video/webm,video/ogg,video/quicktime"
                                                    onChange={handleImageChange}
                                                    className="hidden"
                                                    id="images"
                                                    disabled={uploading}
                                                />
                                                <label htmlFor="images" className="cursor-pointer text-purple-600 hover:text-purple-700">
                                                    Click to upload images or videos
                                                </label>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Uploaded Images Preview */}
                                    {uploadedImages.length > 0 && (
                                        <div className="mt-4">
                                            <p className="text-sm text-gray-600 mb-2">{uploadedImages.length} file(s) uploaded</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {uploadedImages.map((img, index) => (
                                                    <div key={index} className="relative group">
                                                        {getMediaType(img) === "video" ? (
                                                            <video
                                                                src={resolveImageUrl(img.url)}
                                                                className="w-full h-20 object-cover rounded-lg bg-black"
                                                                muted
                                                                playsInline
                                                                preload="metadata"
                                                            />
                                                        ) : (
                                                            <img
                                                                src={resolveImageUrl(img.url, PRODUCT_PLACEHOLDER)}
                                                                alt={`Uploaded ${index + 1}`}
                                                                className="w-full h-20 object-cover rounded-lg"
                                                                onError={(e) => handleImageError(e, PRODUCT_PLACEHOLDER)}
                                                            />
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => removeUploadedImage(index)}
                                                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                    >
                                        {editingProduct ? "Update Product" : "Add Product"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Products;
