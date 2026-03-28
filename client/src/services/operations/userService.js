import { apiConnector } from "../apiConnector";
import { userEndpoints } from "../api";
import { setUser, setLoading } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const {
    GET_PROFILE,
    UPDATE_PROFILE,
    GET_SETTINGS,
    UPDATE_SETTINGS,
    ADD_ADDRESS,
    UPDATE_ADDRESS,
    DELETE_ADDRESS,
    SET_DEFAULT_ADDRESS,
} = userEndpoints;

// Get user profile
export const getProfile = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("GET", GET_PROFILE);
        
        if (response.data.success) {
            dispatch(setUser(response.data.data));
            localStorage.setItem("user", JSON.stringify(response.data.data));
            return response.data.data;
        }
        
    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        toast.error("Failed to fetch profile");
    } finally {
        dispatch(setLoading(false));
    }
    return null;
};

// Update profile
export const updateProfile = (profileData) => async (dispatch) => {
    const toastId = toast.loading("Updating profile...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("PUT", UPDATE_PROFILE, profileData);
        
        if (response.data.success) {
            dispatch(setUser(response.data.data));
            localStorage.setItem("user", JSON.stringify(response.data.data));
            toast.success("Profile updated successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update profile");
        return false;
    } finally {
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
};

// Add new address
export const addAddress = (addressData) => async (dispatch) => {
    const toastId = toast.loading("Adding address...");
    try {
        const response = await apiConnector("POST", ADD_ADDRESS, addressData);
        
        if (response.data.success) {
            // Refresh profile to get updated addresses
            dispatch(getProfile());
            toast.success("Address added successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("ADD ADDRESS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to add address");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Update address
export const updateAddress = (addressId, addressData) => async (dispatch) => {
    const toastId = toast.loading("Updating address...");
    try {
        const response = await apiConnector("PUT", UPDATE_ADDRESS(addressId), addressData);
        
        if (response.data.success) {
            dispatch(getProfile());
            toast.success("Address updated successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("UPDATE ADDRESS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update address");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Delete address
export const deleteAddress = (addressId) => async (dispatch) => {
    const toastId = toast.loading("Deleting address...");
    try {
        const response = await apiConnector("DELETE", DELETE_ADDRESS(addressId));
        
        if (response.data.success) {
            dispatch(getProfile());
            toast.success("Address deleted successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("DELETE ADDRESS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to delete address");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Set default address
export const setDefaultAddress = (addressId) => async (dispatch) => {
    try {
        const response = await apiConnector("PUT", SET_DEFAULT_ADDRESS(addressId));
        
        if (response.data.success) {
            dispatch(getProfile());
            toast.success("Default address updated!");
            return true;
        }
        
    } catch (error) {
        console.error("SET DEFAULT ADDRESS ERROR:", error);
        toast.error("Failed to set default address");
        return false;
    }
};

// Get user settings
export const getUserSettings = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("GET", GET_SETTINGS);

        if (response.data.success) {
            return response.data.data;
        }
    } catch (error) {
        console.error("GET USER SETTINGS ERROR:", error);
        toast.error("Failed to load settings");
    } finally {
        dispatch(setLoading(false));
    }
    return null;
};

// Update user settings
export const updateUserSettings = (settingsPayload) => async (dispatch) => {
    const toastId = toast.loading("Saving settings...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("PUT", UPDATE_SETTINGS, settingsPayload);

        if (response.data.success) {
            dispatch(setUser(response.data.data));
            localStorage.setItem("user", JSON.stringify(response.data.data));
            toast.success("Settings updated successfully");
            return true;
        }
    } catch (error) {
        console.error("UPDATE USER SETTINGS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update settings");
        return false;
    } finally {
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
    return false;
};
