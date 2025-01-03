import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import modalReducer from "./slices/modalSlice";
import { useDispatch, useSelector} from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";

// Configure reducers
const reducers = {
  auth: authReducer,
  modal:modalReducer,
};

// Configure store
export const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: ["modal.data.server"], // Ignore the specific path
        ignoredActions: ["modal/openModal"], // Ignore the specific action
      },
    }),
});


// Type definitions for RootState and AppDispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for typed useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
