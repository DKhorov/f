// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import { postsReducer } from "./slices/posts";
import { authReducer } from "./slices/auth";
import userReducer from "./slices/getme";
import { storeReducer } from "./slices/store";
import player from './slices/player';

const store = configureStore({
    reducer: {
        posts: postsReducer,
        auth: authReducer,
        user: userReducer,
        store: storeReducer,
        player,
    }
});

export default store;