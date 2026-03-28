import { apiConnector } from "../apiConnector";
import { orderEndpoints, paymentEndpoints, adminEndpoints } from "../api";
import {
    setOrderLoading,
    setOrders,
    setCurrentOrder,
    setTrackingInfo,
    setActiveShipments,
    setAdminActiveShipments,
    addOrder,
    updateOrderStatus,
} from "../../redux/slices/orderSlice";
import { clearCart } from "../../redux/slices/cartSlice";
import toast from "react-hot-toast";

const {
    CREATE_ORDER,
    GET_MY_ORDERS,
    GET_ACTIVE_SHIPMENTS,
    GET_ORDER,
    CANCEL_ORDER,
    TRACK_ORDER,
} = orderEndpoints;

const {
    CREATE_RAZORPAY_ORDER,
    VERIFY_PAYMENT,
    GET_RAZORPAY_KEY,
} = paymentEndpoints;

// Create order (COD)
export const createOrder = (orderData, navigate) => async (dispatch) => {
    const toastId = toast.loading("Placing order...");
    dispatch(setOrderLoading(true));
    try {
        const response = await apiConnector("POST", CREATE_ORDER, orderData);
        
        if (response.data.success) {
            dispatch(addOrder(response.data.data));
            dispatch(clearCart());
            toast.success("Order placed successfully!");
            navigate(`/orders/${response.data.data._id}`, { state: { isNewOrder: true } });
            return response.data.data;
        }
        
    } catch (error) {
        console.error("CREATE ORDER ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to place order");
        return null;
    } finally {
        dispatch(setOrderLoading(false));
        toast.dismiss(toastId);
    }
};

// Get Razorpay key
export const getRazorpayKey = async () => {
    try {
        const response = await apiConnector("GET", GET_RAZORPAY_KEY);
        return response.data.key;
    } catch (error) {
        console.error("GET RAZORPAY KEY ERROR:", error);
        return null;
    }
};

// Create Razorpay order and process payment
export const processRazorpayPayment = (orderData, userInfo, navigate) => async (dispatch) => {
    const toastId = toast.loading("Processing payment...");
    dispatch(setOrderLoading(true));
    
    try {
        // Get Razorpay key
        const key = await getRazorpayKey();
        if (!key) {
            throw new Error("Failed to get payment key");
        }
        
        // Create Razorpay order
        const orderResponse = await apiConnector("POST", CREATE_RAZORPAY_ORDER, {
            amount: orderData.totalPrice,
        });
        
        if (!orderResponse.data.success) {
            throw new Error("Failed to create payment order");
        }
        
        const razorpayOrder = orderResponse.data.order;
        
        // Razorpay checkout options
        const options = {
            key,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: "The Resin World",
            description: "Purchase from The Resin World",
            order_id: razorpayOrder.id,
            handler: async (response) => {
                // Verify payment
                try {
                    const verifyResponse = await apiConnector("POST", VERIFY_PAYMENT, {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderData: {
                            ...orderData,
                            paymentMethod: "Card",
                        },
                    });
                    
                    if (verifyResponse.data.success) {
                        dispatch(addOrder(verifyResponse.data.order));
                        dispatch(clearCart());
                        toast.success("Payment successful! Order placed.");
                        navigate(`/orders/${verifyResponse.data.order._id}`);
                    } else {
                        toast.error("Payment verification failed");
                    }
                } catch (error) {
                    console.error("PAYMENT VERIFY ERROR:", error);
                    toast.error("Payment verification failed");
                }
            },
            prefill: {
                name: userInfo.name,
                email: userInfo.email,
                contact: userInfo.phone || "",
            },
            theme: {
                color: "#667eea",
            },
            modal: {
                ondismiss: () => {
                    toast.error("Payment cancelled");
                    dispatch(setOrderLoading(false));
                },
            },
        };
        
        // Open Razorpay checkout
        const razorpay = new window.Razorpay(options);
        razorpay.open();
        
    } catch (error) {
        console.error("RAZORPAY PAYMENT ERROR:", error);
        toast.error(error.message || "Payment failed");
        dispatch(setOrderLoading(false));
    } finally {
        toast.dismiss(toastId);
    }
};

// Get user's orders
export const getMyOrders = (page = 1, limit = 10) => async (dispatch) => {
    dispatch(setOrderLoading(true));
    try {
        const response = await apiConnector("GET", `${GET_MY_ORDERS}?page=${page}&limit=${limit}`);
        
        if (response.data.success) {
            dispatch(setOrders(response.data));
        }
        
    } catch (error) {
        console.error("GET ORDERS ERROR:", error);
        toast.error("Failed to fetch orders");
    }
    dispatch(setOrderLoading(false));
};

// Get single order
export const getOrder = (orderId) => async (dispatch) => {
    dispatch(setOrderLoading(true));
    try {
        const response = await apiConnector("GET", GET_ORDER(orderId));
        
        if (response.data.success) {
            dispatch(setCurrentOrder(response.data.data));
            return response.data.data;
        }
        
    } catch (error) {
        console.error("GET ORDER ERROR:", error);
        toast.error("Failed to fetch order details");
    } finally {
        dispatch(setOrderLoading(false));
    }
    return null;
};

// Cancel order
export const cancelOrder = (orderId, reason) => async (dispatch) => {
    const toastId = toast.loading("Cancelling order...");
    try {
        const response = await apiConnector("PUT", CANCEL_ORDER(orderId), { reason });
        
        if (response.data.success) {
            dispatch(updateOrderStatus({ orderId, status: "Cancelled" }));
            dispatch(setCurrentOrder(response.data.data));
            toast.success("Order cancelled successfully");
            return true;
        }
        
    } catch (error) {
        console.error("CANCEL ORDER ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to cancel order");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Track order
export const trackOrder = (orderId) => async (dispatch) => {
    dispatch(setOrderLoading(true));
    try {
        const response = await apiConnector("GET", TRACK_ORDER(orderId));
        
        if (response.data.success) {
            dispatch(setTrackingInfo(response.data.data));
            return response.data.data;
        }
        
    } catch (error) {
        console.error("TRACK ORDER ERROR:", error);
        toast.error("Failed to fetch tracking info");
    } finally {
        dispatch(setOrderLoading(false));
    }
    return null;
};

// Get active shipments for current user
export const getMyActiveShipments = (page = 1, limit = 10) => async (dispatch) => {
    try {
        const response = await apiConnector(
            "GET",
            `${GET_ACTIVE_SHIPMENTS}?page=${page}&limit=${limit}`
        );

        if (response.data.success) {
            dispatch(setActiveShipments(response.data.data || []));
            return response.data.data || [];
        }
    } catch (error) {
        console.error("GET ACTIVE SHIPMENTS ERROR:", error);
    }
    return [];
};

// Alias for getOrder
export const getOrderById = getOrder;

// ==================== ADMIN FUNCTIONS ====================
const {
    GET_DASHBOARD_STATS,
    GET_ALL_ORDERS,
    GET_ACTIVE_SHIPMENTS: GET_ACTIVE_SHIPMENTS_ADMIN,
    UPDATE_ORDER_STATUS,
    UPDATE_SHIPPING,
    ADD_TRACKING_UPDATE,
} = adminEndpoints;

// Get dashboard stats (Admin)
export const getAdminDashboardStats = async () => {
    try {
        const response = await apiConnector("GET", GET_DASHBOARD_STATS);
        if (response.data.success) {
            return response.data.data;
        }
    } catch (error) {
        console.error("GET DASHBOARD STATS ERROR:", error);
    }
    return null;
};

// Get all orders (Admin)
export const getAllOrders = (filters = {}) => async (dispatch) => {
    dispatch(setOrderLoading(true));
    try {
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);
        if (filters.status) queryParams.append("status", filters.status);
        
        const url = `${GET_ALL_ORDERS}?${queryParams.toString()}`;
        const response = await apiConnector("GET", url);
        
        if (response.data.success) {
            dispatch(setOrders(response.data));
        }
        
    } catch (error) {
        console.error("GET ALL ORDERS ERROR:", error);
        toast.error("Failed to fetch orders");
    }
    dispatch(setOrderLoading(false));
};

// Update order status (Admin)
export const updateOrderStatusAdmin = (orderId, status) => async (dispatch) => {
    const toastId = toast.loading("Updating status...");
    try {
        const response = await apiConnector("PUT", UPDATE_ORDER_STATUS(orderId), { status });
        
        if (response.data.success) {
            dispatch(updateOrderStatus({ orderId, status }));
            toast.success("Order status updated");
            return true;
        }
        
    } catch (error) {
        console.error("UPDATE ORDER STATUS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update status");
        return false;
    } finally {
        toast.dismiss(toastId);
    }
};

// Get active shipments (Admin)
export const getActiveShipmentsAdmin = (filters = {}) => async (dispatch) => {
    try {
        const queryParams = new URLSearchParams();
        if (filters.page) queryParams.append("page", filters.page);
        if (filters.limit) queryParams.append("limit", filters.limit);
        if (filters.orderId) queryParams.append("orderId", filters.orderId);
        if (filters.shippingStatus) queryParams.append("shippingStatus", filters.shippingStatus);

        const url = `${GET_ACTIVE_SHIPMENTS_ADMIN}?${queryParams.toString()}`;
        const response = await apiConnector("GET", url);

        if (response.data.success) {
            dispatch(setAdminActiveShipments(response.data.data || []));
            return response.data.data || [];
        }
    } catch (error) {
        console.error("GET ACTIVE SHIPMENTS ADMIN ERROR:", error);
    }
    return [];
};

// Update shipping details (Admin)
export const updateShippingDetailsAdmin = (orderId, payload) => async () => {
    const toastId = toast.loading("Updating shipping details...");
    try {
        const response = await apiConnector("PUT", UPDATE_SHIPPING(orderId), payload);
        if (response.data.success) {
            toast.success("Shipping details updated");
            return response.data.data;
        }
    } catch (error) {
        console.error("UPDATE SHIPPING DETAILS ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update shipping details");
    } finally {
        toast.dismiss(toastId);
    }
    return null;
};

// Add shipping tracking update (Admin)
export const addTrackingUpdateAdmin = (orderId, payload) => async (dispatch) => {
    const toastId = toast.loading("Updating shipment status...");
    try {
        const response = await apiConnector("POST", ADD_TRACKING_UPDATE(orderId), payload);
        if (response.data.success) {
            const mappedOrderStatus = response.data.data?.orderStatus;
            if (mappedOrderStatus) {
                dispatch(updateOrderStatus({ orderId, status: mappedOrderStatus }));
            }
            toast.success("Shipment tracking updated");
            return response.data.data;
        }
    } catch (error) {
        console.error("ADD TRACKING UPDATE ERROR:", error);
        toast.error(error.response?.data?.message || "Failed to update shipment tracking");
    } finally {
        toast.dismiss(toastId);
    }
    return null;
};
