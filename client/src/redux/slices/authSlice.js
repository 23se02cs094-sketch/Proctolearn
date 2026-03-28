import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null,
    token: localStorage.getItem("token") || null,
    loading: false,
    isAuthenticated: !!localStorage.getItem("token"),
    signupData: null,
    otpSent: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setToken: (state, action) => {
            state.token = action.payload;
            state.isAuthenticated = !!action.payload;
        },
        setSignupData: (state, action) => {
            state.signupData = action.payload;
        },
        setOtpSent: (state, action) => {
            state.otpSent = action.payload;
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.signupData = null;
            state.otpSent = false;
            localStorage.removeItem("token");
            localStorage.removeItem("user");
        },
    },
});

export const { setLoading, setUser, setToken, setSignupData, setOtpSent, logout } = authSlice.actions;
export default authSlice.reducer;
