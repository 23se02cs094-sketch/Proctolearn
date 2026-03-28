import { apiConnector } from "../apiConnector";
import { cartEndpoints } from "../api";
import { setCartLoading, setCart, clearCart as clearCartState } from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";

const {
    GET_CART,
    ADD_TO_CART,
    UPDATE_CART_ITEM,
    REMOVE_FROM_CART,
    CLEAR_CART,
} = cartEndpoints;

// Get user's cart
export const getCart = () => async (dispatch) => {
    dispatch(setCartLoading(true));
    try {
        const response = await apiConnector("GET", GET_CART);
        
        if (response.data.success) {
            dispatch(setCart(response.data.data));
        }
        
    } catch (error) {
        console.error("GET CART ERROR:", error);
    }
    dispatch(setCartLoading(false));
};

// Add item to cart
export const addToCart = (productId, quantity = 1, variant = {}) => async (dispatch) => {
    const toastId = toast.loading("Adding to cart...");
    try {
        const response = await apiConnector("POST", ADD_TO_CART, {
            productId,
            quantity,
            selectedSize: variant.selectedSize || "",
            selectedSku: variant.selectedSku || "",
            selectedVariantId: variant.selectedVariantId || "",
        });
        
        if (response.data.success) {
            dispatch(setCart(response.data.data));
            toast.success("Added to cart!");
            return true;
        }
        
    } catch (error) {
        console.error("ADD TO CART ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to add to cart");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Update cart item quantity
export const updateCartItemQuantity = (itemId, quantity) => async (dispatch) => {
    try {
        const response = await apiConnector("PUT", UPDATE_CART_ITEM(itemId), { quantity });
        
        if (response.data.success) {
            dispatch(setCart(response.data.data));
            return true;
        }
        
    } catch (error) {
        console.error("UPDATE CART ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update cart");
        return false;
    }
};

// Remove item from cart
export const removeFromCart = (itemId) => async (dispatch) => {
    const toastId = toast.loading("Removing...");
    try {
        const response = await apiConnector("DELETE", REMOVE_FROM_CART(itemId));
        
        if (response.data.success) {
            dispatch(setCart(response.data.data));
            toast.success("Item removed from cart");
            return true;
        }
        
    } catch (error) {
        console.error("REMOVE FROM CART ERROR:", error);
        toast.error("Failed to remove item");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Clear entire cart
export const clearCart = () => async (dispatch) => {
    try {
        const response = await apiConnector("DELETE", CLEAR_CART);
        
        if (response.data.success) {
            dispatch(clearCartState());
            return true;
        }
        
    } catch (error) {
        console.error("CLEAR CART ERROR:", error);
        toast.error("Failed to clear cart");
        return false;
    }
};
