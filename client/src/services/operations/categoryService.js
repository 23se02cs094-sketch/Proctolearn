import { apiConnector } from "../apiConnector";
import { categoryEndpoints, adminEndpoints } from "../api";
import { 
    setCategoryLoading, 
    setAdminCategoryLoading,
    setCategories, 
    setCurrentCategory,
    addCategory,
    updateCategoryInState,
    removeCategoryFromState
} from "../../redux/slices/categorySlice";
import toast from "react-hot-toast";

const {
    GET_ALL_CATEGORIES,
    GET_CATEGORY,
    GET_ALL_FLAT_CATEGORIES,
} = categoryEndpoints;

const {
    CREATE_CATEGORY,
    UPDATE_CATEGORY,
    DELETE_CATEGORY,
    GET_ADMIN_CATEGORIES,
} = adminEndpoints;

// ==================== PUBLIC OPERATIONS ====================

// Get all categories (hierarchical)
export const getCategories = () => async (dispatch) => {
    dispatch(setCategoryLoading(true));
    let categories = [];
    try {
        const response = await apiConnector("GET", GET_ALL_CATEGORIES);
        
        if (response.data.success) {
            dispatch(setCategories(response.data.data));
            categories = response.data.data;
        }
        
    } catch (error) {
        console.error("GET CATEGORIES ERROR:", error);
    } finally {
        dispatch(setCategoryLoading(false));
    }
    return categories;
};

// Get single category
export const getCategory = (categoryId) => async (dispatch) => {
    dispatch(setCategoryLoading(true));
    let category = null;
    try {
        const response = await apiConnector("GET", GET_CATEGORY(categoryId));
        
        if (response.data.success) {
            dispatch(setCurrentCategory(response.data.data));
            category = response.data.data;
        }
        
    } catch (error) {
        console.error("GET CATEGORY ERROR:", error);
        toast.error("Failed to fetch category");
    } finally {
        dispatch(setCategoryLoading(false));
    }
    return category;
};

// Get all categories flat list
export const getAllFlatCategories = () => async (dispatch) => {
    dispatch(setCategoryLoading(true));
    let categories = [];
    try {
        const response = await apiConnector("GET", GET_ALL_FLAT_CATEGORIES);
        
        if (response.data.success) {
            dispatch(setCategories(response.data.data));
            categories = response.data.data;
        }
        
    } catch (error) {
        console.error("GET FLAT CATEGORIES ERROR:", error);
    } finally {
        dispatch(setCategoryLoading(false));
    }
    return categories;
};

// ==================== ADMIN OPERATIONS ====================

// Get all categories for admin (including inactive)
export const getAdminCategories = () => async (dispatch) => {
    dispatch(setCategoryLoading(true));
    try {
        const response = await apiConnector("GET", GET_ADMIN_CATEGORIES);
        
        if (response.data.success) {
            dispatch(setCategories(response.data.data));
            dispatch(setCategoryLoading(false));
            return response.data.data;
        }
        
    } catch (error) {
        console.error("GET ADMIN CATEGORIES ERROR:", error);
    }
    dispatch(setCategoryLoading(false));
    return [];
};

// Create category (Admin)
export const createCategory = (formData) => async (dispatch) => {
    const toastId = toast.loading("Creating category...");
    dispatch(setAdminCategoryLoading(true));
    try {
        // Don't set Content-Type for FormData - let axios handle it
        const response = await apiConnector("POST", CREATE_CATEGORY, formData);
        
        if (response.data.success) {
            dispatch(addCategory(response.data.data));
            toast.success("Category created successfully!");
            return response.data.data;
        }
        
    } catch (error) {
        console.error("CREATE CATEGORY ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to create category");
        return null;
    } finally {
        toast.dismiss(toastId);
        dispatch(setAdminCategoryLoading(false));
    }
};

// Update category (Admin)
export const updateCategory = (categoryId, formData) => async (dispatch) => {
    const toastId = toast.loading("Updating category...");
    dispatch(setAdminCategoryLoading(true));
    try {
        // Don't set Content-Type for FormData - let axios handle it
        const response = await apiConnector("PUT", UPDATE_CATEGORY(categoryId), formData);
        
        if (response.data.success) {
            dispatch(updateCategoryInState(response.data.data));
            toast.success("Category updated successfully!");
            return response.data.data;
        }
        
    } catch (error) {
        console.error("UPDATE CATEGORY ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update category");
        return null;
    } finally {
        toast.dismiss(toastId);
        dispatch(setAdminCategoryLoading(false));
    }
};

// Delete category (Admin)
export const deleteCategory = (categoryId) => async (dispatch) => {
    const toastId = toast.loading("Deleting category...");
    dispatch(setAdminCategoryLoading(true));
    try {
        const response = await apiConnector("DELETE", DELETE_CATEGORY(categoryId));
        
        if (response.data.success) {
            dispatch(removeCategoryFromState(categoryId));
            toast.success("Category deleted successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("DELETE CATEGORY ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to delete category");
        return false;
    } finally {
        toast.dismiss(toastId);
        dispatch(setAdminCategoryLoading(false));
    }
};
