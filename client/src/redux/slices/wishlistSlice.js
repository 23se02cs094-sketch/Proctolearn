import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    items: [],
    loading: false,
};

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState,
    reducers: {
        setWishlistLoading: (state, action) => {
            state.loading = action.payload;
        },
        setWishlist: (state, action) => {
            state.items = action.payload.products || [];
        },
        addToWishlist: (state, action) => {
            state.items.push(action.payload);
        },
        removeFromWishlist: (state, action) => {
            state.items = state.items.filter(item => item.product._id !== action.payload);
        },
        clearWishlist: (state) => {
            state.items = [];
        },
    },
});

export const { setWishlistLoading, setWishlist, addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
