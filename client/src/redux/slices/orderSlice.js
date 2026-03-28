import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orders: [],
    activeShipments: [],
    adminActiveShipments: [],
    currentOrder: null,
    trackingInfo: null,
    loading: false,
    totalOrders: 0,
    totalPages: 0,
    currentPage: 1,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setOrderLoading: (state, action) => {
            state.loading = action.payload;
        },
        setOrders: (state, action) => {
            state.orders = action.payload.data || [];
            state.totalOrders = action.payload.total || 0;
            state.totalPages = action.payload.totalPages || 0;
            state.currentPage = action.payload.currentPage || 1;
        },
        setCurrentOrder: (state, action) => {
            state.currentOrder = action.payload;
        },
        setActiveShipments: (state, action) => {
            state.activeShipments = action.payload || [];
        },
        setAdminActiveShipments: (state, action) => {
            state.adminActiveShipments = action.payload || [];
        },
        setTrackingInfo: (state, action) => {
            state.trackingInfo = action.payload;
        },
        addOrder: (state, action) => {
            state.orders.unshift(action.payload);
        },
        updateOrderStatus: (state, action) => {
            const { orderId, status } = action.payload;
            const order = state.orders.find(o => o._id === orderId);
            if (order) {
                order.orderStatus = status;
            }
            if (state.currentOrder && state.currentOrder._id === orderId) {
                state.currentOrder.orderStatus = status;
            }
        },
    },
});

export const {
    setOrderLoading,
    setOrders,
    setCurrentOrder,
    setActiveShipments,
    setAdminActiveShipments,
    setTrackingInfo,
    addOrder,
    updateOrderStatus,
} = orderSlice.actions;
export default orderSlice.reducer;
