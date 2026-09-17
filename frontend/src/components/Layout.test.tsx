import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../store/slices/authSlice';
import projectReducer from '../store/slices/projectSlice';
import seismicReducer from '../store/slices/seismicSlice';
import viewerReducer from '../store/slices/viewerSlice';
import Layout from './Layout';

// jsdom 未实现 matchMedia，为 antd 组件提供模拟
beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      } as unknown as MediaQueryList));
});

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      projects: projectReducer,
      seismic: seismicReducer,
      viewer: viewerReducer,
    },
  });

const renderAt = (path: string) => {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="projects" element={<div>projects-page</div>} />
            <Route path="viewer/:seismicId" element={<div>viewer-page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>
  );
};

describe('侧栏导航选中项', () => {
  it('项目管理页：选中“项目管理”', () => {
    const { container } = renderAt('/projects');
    const selected = container.querySelector('.ant-menu-item-selected');
    expect(selected?.textContent).toContain('项目管理');
  });

  it('数据查看页：仍选中“项目管理”，与页面内容对应', () => {
    const { container } = renderAt('/viewer/5');
    const selected = container.querySelector('.ant-menu-item-selected');
    expect(selected?.textContent).toContain('项目管理');
    expect(screen.getByText('viewer-page')).toBeTruthy();
  });

  it('从查看页返回项目管理后：选中项保持“项目管理”', () => {
    const store = createTestStore();
    const { container, rerender } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/viewer/5']}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="projects" element={<div>projects-page</div>} />
              <Route path="viewer/:seismicId" element={<div>viewer-page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    rerender(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/projects']}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route path="projects" element={<div>projects-page</div>} />
              <Route path="viewer/:seismicId" element={<div>viewer-page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    const selected = container.querySelector('.ant-menu-item-selected');
    expect(selected?.textContent).toContain('项目管理');
  });
});
