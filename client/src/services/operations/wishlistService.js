import { apiConnector } from "../apiConnector";
import { wishlistEndpoints } from "../api";
import { setWishlistLoading, setWishlist } from "../../redux/slices/wishlistSlice";
import toast from "react-hot-toast";

const {
    GET_WISHLIST,
    ADD_TO_WISHLIST,
    REMOVE_FROM_WISHLIST,
    CHECK_WISHLIST,
    CLEAR_WISHLIST,
    MOVE_TO_CART,
} = wishlistEndpoints;

// Get user's wishlist
export const getWishlist = () => async (dispatch) => {
    dispatch(setWishlistLoading(true));
    try {
        const response = await apiConnector("GET", GET_WISHLIST);
        
        if (response.data.success) {
            dispatch(setWishlist(response.data.data));
        }
        
    } catch (error) {
        console.error("GET WISHLIST ERROR:", error);
    }
    dispatch(setWishlistLoading(false));
};

// Add to wishlist
export const addToWishlist = (productId) => async (dispatch) => {
    const toastId = toast.loading("Adding to wishlist...");
    try {
        const response = await apiConnector("POST", ADD_TO_WISHLIST, { productId });
        
        if (response.data.success) {
            dispatch(setWishlist(response.data.data));
            toast.success("Added to wishlist!");
            return true;
        }
        
    } catch (error) {
        console.error("ADD TO WISHLIST ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to add to wishlist");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Remove from wishlist
export const removeFromWishlist = (productId) => async (dispatch) => {
    const toastId = toast.loading("Removing...");
    try {
        const response = await apiConnector("DELETE", REMOVE_FROM_WISHLIST(productId));
        
        if (response.data.success) {
            dispatch(setWishlist(response.data.data));
            toast.success("Removed from wishlist");
            return true;
        }
        
    } catch (error) {
        console.error("REMOVE FROM WISHLIST ERROR:", error);
        toast.error("Failed to remove from wishlist");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Check if product is in wishlist
export const checkWishlist = async (productId) => {
    try {
        const response = await apiConnector("GET", CHECK_WISHLIST(productId));
        return response.data.inWishlist;
    } catch (error) {
        console.error("CHECK WISHLIST ERROR:", error);
        return false;
    }
};

// Clear wishlist
export const clearWishlist = () => async (dispatch) => {
    try {
        const response = await apiConnector("DELETE", CLEAR_WISHLIST);
        
        if (response.data.success) {
            dispatch(setWishlist({ products: [] }));
            toast.success("Wishlist cleared");
            return true;
        }
        
    } catch (error) {
        console.error("CLEAR WISHLIST ERROR:", error);
        return false;
    }
};

// Move item from wishlist to cart
export const moveToCart = (productId) => async (dispatch) => {
    const toastId = toast.loading("Moving to cart...");
    try {
        const response = await apiConnector("POST", MOVE_TO_CART(productId));
        
        if (response.data.success) {
            // Refresh wishlist after moving
            dispatch(getWishlist());
            toast.success("Moved to cart!");
            return true;
        }
        
    } catch (error) {
        console.error("MOVE TO CART ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to move to cart");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};
