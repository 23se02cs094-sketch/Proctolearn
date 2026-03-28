import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    loading: false,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartLoading: (state, action) => {
            state.loading = action.payload;
        },
        setCart: (state, action) => {
            state.items = action.payload.items || [];
            state.totalItems = action.payload.totalItems || 0;
            state.totalPrice = action.payload.totalPrice || 0;
        },
        addToCart: (state, action) => {
            const item = action.payload;
            const existingItem = state.items.find(i => i.product._id === item.product._id);
            
            if (existingItem) {
                existingItem.quantity += item.quantity;
            } else {
                state.items.push(item);
            }
            state.totalItems = state.items.reduce((total, i) => total + i.quantity, 0);
            state.totalPrice = state.items.reduce((total, i) => total + (i.price * i.quantity), 0);
        },
        updateCartItem: (state, action) => {
            const { itemId, quantity } = action.payload;
            const item = state.items.find(i => i._id === itemId);
            if (item) {
                item.quantity = quantity;
            }
            state.totalItems = state.items.reduce((total, i) => total + i.quantity, 0);
            state.totalPrice = state.items.reduce((total, i) => total + (i.price * i.quantity), 0);
        },
        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item._id !== action.payload);
            state.totalItems = state.items.reduce((total, i) => total + i.quantity, 0);
            state.totalPrice = state.items.reduce((total, i) => total + (i.price * i.quantity), 0);
        },
        clearCart: (state) => {
            state.items = [];
            state.totalItems = 0;
            state.totalPrice = 0;
        },
    },
});

export const { setCartLoading, setCart, addToCart, updateCartItem, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
