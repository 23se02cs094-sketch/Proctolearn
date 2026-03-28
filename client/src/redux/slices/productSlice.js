import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    products: [],
    featuredProducts: [],
    currentProduct: null,
    relatedProducts: [],
    loading: false,
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    filters: {
        category: "",
        minPrice: 0,
        maxPrice: 10000,
        sort: "-createdAt",
        search: "",
    },
};

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProductLoading: (state, action) => {
            state.loading = action.payload;
        },
        setProducts: (state, action) => {
            state.products = action.payload.data || [];
            state.totalProducts = action.payload.total || 0;
            state.totalPages = action.payload.totalPages || 0;
            state.currentPage = action.payload.currentPage || 1;
        },
        setFeaturedProducts: (state, action) => {
            state.featuredProducts = action.payload;
        },
        setCurrentProduct: (state, action) => {
            state.currentProduct = action.payload;
        },
        setRelatedProducts: (state, action) => {
            state.relatedProducts = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
        },
    },
});

export const {
    setProductLoading,
    setProducts,
    setFeaturedProducts,
    setCurrentProduct,
    setRelatedProducts,
    setFilters,
    resetFilters,
} = productSlice.actions;

// Alias for backward compatibility
export const clearFilters = resetFilters;

export default productSlice.reducer;
