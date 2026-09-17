import { combineReducers, configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import seismicReducer from './slices/seismicSlice';
import viewerReducer from './slices/viewerSlice';

const appReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  seismic: seismicReducer,
  viewer: viewerReducer,
});

// 退出登录后将整个 store 重置为初始状态，
// 确保重新进入时项目列表、查看器面板等不残留上一次会话的内容
const rootReducer: typeof appReducer = (state, action) => {
  if (logout.fulfilled.match(action)) {
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
