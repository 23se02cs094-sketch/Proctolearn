import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    categories: [],
    currentCategory: null,
    loading: false,
    adminLoading: false,
};

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {
        setCategoryLoading: (state, action) => {
            state.loading = action.payload;
        },
        setAdminCategoryLoading: (state, action) => {
            state.adminLoading = action.payload;
        },
        setCategories: (state, action) => {
            state.categories = action.payload;
        },
        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },
        addCategory: (state, action) => {
            state.categories.push(action.payload);
        },
        updateCategoryInState: (state, action) => {
            const index = state.categories.findIndex(cat => cat._id === action.payload._id);
            if (index !== -1) {
                state.categories[index] = action.payload;
            }
        },
        removeCategoryFromState: (state, action) => {
            state.categories = state.categories.filter(cat => cat._id !== action.payload);
        },
    },
});

export const { 
    setCategoryLoading, 
    setAdminCategoryLoading,
    setCategories, 
    setCurrentCategory,
    addCategory,
    updateCategoryInState,
    removeCategoryFromState
} = categorySlice.actions;

export default categorySlice.reducer;
