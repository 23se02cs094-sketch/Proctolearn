import { apiConnector } from "../apiConnector";
import { reviewEndpoints } from "../api";
import toast from "react-hot-toast";

const {
    CREATE_REVIEW,
    GET_PRODUCT_REVIEWS,
    GET_MY_REVIEWS,
    UPDATE_REVIEW,
    DELETE_REVIEW,
    MARK_HELPFUL,
} = reviewEndpoints;

// Create a review
export const createReview = async (reviewData) => {
    const toastId = toast.loading("Submitting review...");
    try {
        const response = await apiConnector("POST", CREATE_REVIEW, reviewData);
        
        if (response.data.success) {
            toast.success("Review submitted successfully!");
            return response.data.data;
        }
        
    } catch (error) {
        console.error("CREATE REVIEW ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to submit review");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Get product reviews
export const getProductReviews = async (productId, page = 1, limit = 10) => {
    try {
        const response = await apiConnector("GET", `${GET_PRODUCT_REVIEWS(productId)}?page=${page}&limit=${limit}`);
        
        if (response.data.success) {
            return response.data;
        }
        
    } catch (error) {
        console.error("GET PRODUCT REVIEWS ERROR:", error);
        return null;
    }
};

// Get my reviews
export const getMyReviews = async () => {
    try {
        const response = await apiConnector("GET", GET_MY_REVIEWS);
        
        if (response.data.success) {
            return response.data.data;
        }
        
    } catch (error) {
        console.error("GET MY REVIEWS ERROR:", error);
        return [];
    }
};

// Update review
export const updateReview = async (reviewId, reviewData) => {
    const toastId = toast.loading("Updating review...");
    try {
        const response = await apiConnector("PUT", UPDATE_REVIEW(reviewId), reviewData);
        
        if (response.data.success) {
            toast.success("Review updated successfully!");
            return response.data.data;
        }
        
    } catch (error) {
        console.error("UPDATE REVIEW ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update review");
        return null;
    } finally {
        toast.dismiss(toastId);
    }
};

// Delete review
export const deleteReview = async (reviewId) => {
    const toastId = toast.loading("Deleting review...");
    try {
        const response = await apiConnector("DELETE", DELETE_REVIEW(reviewId));
        
        if (response.data.success) {
            toast.success("Review deleted successfully!");
            return true;
        }
        
    } catch (error) {
        console.error("DELETE REVIEW ERROR:", error);
        toast.error("Failed to delete review");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Mark review as helpful
export const markReviewHelpful = async (reviewId) => {
    try {
        const response = await apiConnector("PUT", MARK_HELPFUL(reviewId));
        
        if (response.data.success) {
            toast.success("Marked as helpful!");
            return response.data.data;
        }
        
    } catch (error) {
        console.error("MARK HELPFUL ERROR:", error);
        return null;
    }
};
