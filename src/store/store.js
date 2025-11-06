import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/authSlice'
import chatReducer from './slices/chatSlice'
import documentReducer from './slices/documentSlice';

export const store = configureStore({
    reducer:{
        auth:authReducer,
        chat:chatReducer,
        documents:documentReducer
    },
    devTools: process.env.NODE_ENV !== 'production'
})

export default store;