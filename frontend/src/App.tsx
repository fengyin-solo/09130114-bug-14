import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store';
import { getCurrentUser, logout } from './store/slices/authSlice';
import Login from './pages/Login';
import Projects from './pages/Projects';
import Viewer from './pages/Viewer';
import Layout from './components/Layout';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // 每次进入应用（含刷新）都以服务端为准获取用户信息，
  // token 失效时退出登录并清空全部残留状态。
  useEffect(() => {
    if (isAuthenticated && !user) {
      dispatch(getCurrentUser()).then((result) => {
        if (getCurrentUser.rejected.match(result)) {
          dispatch(logout());
        }
      });
    }
  }, [isAuthenticated, user, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/projects" replace />} />
        <Route path="projects" element={<Projects />} />
        <Route path="viewer/:seismicId" element={<Viewer />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
