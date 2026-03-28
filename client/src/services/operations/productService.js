import { apiConnector } from "../apiConnector";
import { productEndpoints } from "../api";
import {
    setProductLoading,
    setProducts,
    setFeaturedProducts,
    setCurrentProduct,
    setRelatedProducts,
} from "../../redux/slices/productSlice";
import toast from "react-hot-toast";

const {
    GET_ALL_PRODUCTS,
    GET_PRODUCT,
    GET_FEATURED_PRODUCTS,
    GET_PRODUCTS_BY_CATEGORY,
    SEARCH_PRODUCTS,
    GET_RELATED_PRODUCTS,
} = productEndpoints;

// Get all products with filters
export const getProducts = (filters = {}) => async (dispatch) => {
    dispatch(setProductLoading(true));
    try {
        const queryParams = new URLSearchParams();
        
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);
        if (filters.category) queryParams.append("category", filters.category);
        if (filters.minPrice) queryParams.append("minPrice", filters.minPrice);
        if (filters.maxPrice) queryParams.append("maxPrice", filters.maxPrice);
        if (filters.sort) queryParams.append("sort", filters.sort);
        if (filters.search) queryParams.append("search", filters.search);
        
        const url = `${GET_ALL_PRODUCTS}?${queryParams.toString()}`;
        const response = await apiConnector("GET", url);
        
        if (response.data.success) {
            dispatch(setProducts(response.data));
        }
        
    } catch (error) {
        console.error("GET PRODUCTS ERROR:", error);
        toast.error("Failed to fetch products");
    }
    dispatch(setProductLoading(false));
};

// Get featured products
export const getFeaturedProducts = (limit = 8) => async (dispatch) => {
    dispatch(setProductLoading(true));
    try {
        const response = await apiConnector("GET", `${GET_FEATURED_PRODUCTS}?limit=${limit}`);
        
        if (response.data.success) {
            dispatch(setFeaturedProducts(response.data.data));
        }
        
    } catch (error) {
        console.error("GET FEATURED PRODUCTS ERROR:", error);
    }
    dispatch(setProductLoading(false));
};

// Get single product
export const getProduct = (productId) => async (dispatch) => {
    dispatch(setProductLoading(true));
    dispatch(setCurrentProduct(null));
    let productData = null;

    try {
        const response = await apiConnector("GET", GET_PRODUCT(productId));
        
        if (response.data.success) {
            dispatch(setCurrentProduct(response.data.data));
            productData = response.data.data;
        }
        
    } catch (error) {
        console.error("GET PRODUCT ERROR:", error);
        toast.error("Failed to fetch product details");
    } finally {
        dispatch(setProductLoading(false));
    }

    return productData;
};

// Get products by category
export const getProductsByCategory = (categoryId, filters = {}) => async (dispatch) => {
    dispatch(setProductLoading(true));
    try {
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);
        
        const url = `${GET_PRODUCTS_BY_CATEGORY(categoryId)}?${queryParams.toString()}`;
        const response = await apiConnector("GET", url);
        
        if (response.data.success) {
            dispatch(setProducts(response.data));
        }
        
    } catch (error) {
        console.error("GET PRODUCTS BY CATEGORY ERROR:", error);
        toast.error("Failed to fetch products");
    }
    dispatch(setProductLoading(false));
};

// Search products
export const searchProducts = (query) => async (dispatch) => {
    dispatch(setProductLoading(true));
    try {
        const response = await apiConnector("GET", `${SEARCH_PRODUCTS}?q=${encodeURIComponent(query)}`);
        
        if (response.data.success) {
            dispatch(setProducts({ data: response.data.data, total: response.data.count }));
        }
        
    } catch (error) {
        console.error("SEARCH PRODUCTS ERROR:", error);
        toast.error("Search failed");
    }
    dispatch(setProductLoading(false));
};

// Get related products
export const getRelatedProducts = (productId) => async (dispatch) => {
    try {
        const response = await apiConnector("GET", GET_RELATED_PRODUCTS(productId));
        
        if (response.data.success) {
            dispatch(setRelatedProducts(response.data.data));
        }
        
    } catch (error) {
        console.error("GET RELATED PRODUCTS ERROR:", error);
    }
};

// ==================== ADMIN FUNCTIONS ====================
import { adminEndpoints } from "../api";

const {
    GET_ADMIN_PRODUCTS,
    CREATE_PRODUCT,
    UPDATE_PRODUCT,
    DELETE_PRODUCT,
} = adminEndpoints;

// Get all products (Admin)
export const getAllProducts = (filters = {}) => async (dispatch) => {
    dispatch(setProductLoading(true));
    try {
        const queryParams = new URLSearchParams();
        if (filters.all) queryParams.append("all", "true");
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);
        if (filters.search) queryParams.append("search", filters.search);
        
        const url = `${GET_ADMIN_PRODUCTS}?${queryParams.toString()}`;
        const response = await apiConnector("GET", url);
        
        if (response.data.success) {
            dispatch(setProducts(response.data));
        }
        
    } catch (error) {
        console.error("GET ALL PRODUCTS ERROR:", error);
        toast.error("Failed to fetch products");
    }
    dispatch(setProductLoading(false));
};

// Create product (Admin)
export const createProduct = (productData) => async (dispatch) => {
    const toastId = toast.loading("Creating product...");
    try {
        const response = await apiConnector("POST", CREATE_PRODUCT, productData);
        
        if (response.data.success) {
            toast.success("Product created successfully");
            return true;
        }
        
    } catch (error) {
        console.error("CREATE PRODUCT ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to create product");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Update product (Admin)
export const updateProduct = (productId, productData) => async (dispatch) => {
    const toastId = toast.loading("Updating product...");
    try {
        const response = await apiConnector("PUT", UPDATE_PRODUCT(productId), productData);
        
        if (response.data.success) {
            toast.success("Product updated successfully");
            return true;
        }
        
    } catch (error) {
        console.error("UPDATE PRODUCT ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update product");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Delete product (Admin)
export const deleteProduct = (productId) => async (dispatch) => {
    const toastId = toast.loading("Deleting product...");
    try {
        const response = await apiConnector("DELETE", DELETE_PRODUCT(productId));
        
        if (response.data.success) {
            toast.success("Product deleted successfully");
            return true;
        }
        
    } catch (error) {
        console.error("DELETE PRODUCT ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to delete product");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};
