import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import projectReducer from './slices/projectSlice';
import seismicReducer from './slices/seismicSlice';
import viewerReducer from './slices/viewerSlice';

const appReducer = combineReducers({
  auth: authReducer,
  projects: projectReducer,
  seismic: seismicReducer,
  viewer: viewerReducer,
});

// 退出登录时丢弃全部业务状态，使下一次进入恢复成刚打开应用的样子，
// 避免上一次的项目、数据、面板配置在重新登录后再次出现。
const rootReducer = (state: ReturnType<typeof appReducer> | undefined, action: any) => {
  if (action.type === 'auth/logout/fulfilled') {
    state = undefined;
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
