import { apiConnector } from "../apiConnector";
import { authEndpoints } from "../api";
import { setLoading, setUser, setToken, setSignupData, setOtpSent, logout } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const {
    REGISTER,
    LOGIN,
    LOGOUT,
    GET_ME,
    SEND_OTP,
    VERIFY_OTP,
    FORGOT_PASSWORD,
    RESET_PASSWORD,
    UPDATE_PASSWORD,
} = authEndpoints;

// Send OTP to email for signup
export const sendOtp = (email, navigate) => async (dispatch) => {
    const toastId = toast.loading("Sending OTP...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("POST", SEND_OTP, { email });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("OTP sent to your email!");
        dispatch(setOtpSent(true));
        
    } catch (error) {
        console.error("SEND OTP ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to send OTP");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
};

// Signup with OTP verification
export const signUp = (signupData, otp, navigate) => async (dispatch) => {
    const toastId = toast.loading("Creating your account...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("POST", REGISTER, {
            ...signupData,
            otp,
        });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Account created successfully!");
        dispatch(setSignupData(null));
        dispatch(setOtpSent(false));
        navigate("/login");
        
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        toast.error(error.response?.data?.message || "Signup failed");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
};

// Login
export const login = (email, password, navigate) => async (dispatch) => {
    const toastId = toast.loading("Logging in...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("POST", LOGIN, { email, password });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Login successful!");
        
        // Store token and user in localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        dispatch(setToken(response.data.token));
        dispatch(setUser(response.data.user));
        
        // Return user data for caller to handle navigation
        toast.dismiss(toastId);
        dispatch(setLoading(false));
        return { success: true, user: response.data.user };
        
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        toast.error(error.response?.data?.message || "Login failed");
        toast.dismiss(toastId);
        dispatch(setLoading(false));
        return { success: false, error: error.response?.data?.message || "Login failed" };
    }
};

// Logout
export const logoutUser = (navigate) => async (dispatch) => {
    const toastId = toast.loading("Logging out...");
    try {
        await apiConnector("GET", LOGOUT);
        
        dispatch(logout());
        toast.success("Logged out successfully!");
        navigate("/");
        
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        // Still logout locally even if API fails
        dispatch(logout());
        navigate("/");
    }
    toast.dismiss(toastId);
};

// Get current user profile
export const getMe = () => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("GET", GET_ME);
        
        if (response.data.success) {
            dispatch(setUser(response.data.data));
            localStorage.setItem("user", JSON.stringify(response.data.data));
        }
        
    } catch (error) {
        console.error("GET ME ERROR:", error);
        // If token is invalid, logout
        if (error.response?.status === 401) {
            dispatch(logout());
        }
    }
    dispatch(setLoading(false));
};

// Forgot Password
export const forgotPassword = (email) => async (dispatch) => {
    const toastId = toast.loading("Sending reset link...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("POST", FORGOT_PASSWORD, { email });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Password reset link sent to your email!");
        return true;
        
    } catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to send reset link");
        return false;
    } finally {
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
};

// Reset Password
export const resetPassword = (token, password, navigate) => async (dispatch) => {
    const toastId = toast.loading("Resetting password...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("PUT", `${RESET_PASSWORD}/${token}`, { password });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Password reset successful! Please login.");
        navigate("/login");
        
    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to reset password");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
};

// Update Password (while logged in)
export const updatePassword = (currentPassword, newPassword) => async (dispatch) => {
    const toastId = toast.loading("Updating password...");
    dispatch(setLoading(true));
    try {
        const response = await apiConnector("PUT", UPDATE_PASSWORD, {
            currentPassword,
            newPassword,
        });
        
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        
        toast.success("Password updated successfully!");
        return true;
        
    } catch (error) {
        console.error("UPDATE PASSWORD ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update password");
        return false;
    } finally {
        dispatch(setLoading(false));
        toast.dismiss(toastId);
    }
};
