import { store } from './index';
import { logout } from './slices/authSlice';
import { setSliceVisible, setTool, setVolumeRenderingEnabled } from './slices/viewerSlice';
import { setCurrentSeismic } from './slices/seismicSlice';
import { setCurrentProject } from './slices/projectSlice';

describe('退出登录时重置应用状态', () => {
  it('logout.fulfilled 后所有 slice 恢复初始状态', () => {
    // 模拟一次会话中留下的状态：打开的面板、测量工具、当前数据/项目
    store.dispatch(setSliceVisible({ sliceType: 'inline', visible: true }));
    store.dispatch(setVolumeRenderingEnabled(true));
    store.dispatch(setTool('measure'));
    store.dispatch(setCurrentSeismic({ id: 1, name: '数据A' } as any));
    store.dispatch(setCurrentProject({ id: 2, name: '项目P' } as any));

    expect(store.getState().viewer.slices.inline.visible).toBe(true);
    expect(store.getState().viewer.volumeRendering.enabled).toBe(true);
    expect(store.getState().seismic.currentSeismic?.name).toBe('数据A');
    expect(store.getState().projects.currentProject?.name).toBe('项目P');

    // 退出登录完成
    store.dispatch(logout.fulfilled(null, 'test-request'));

    const state = store.getState();
    // 查看器面板恢复初始
    expect(state.viewer.slices.inline.visible).toBe(false);
    expect(state.viewer.volumeRendering.enabled).toBe(false);
    expect(state.viewer.tool).toBe('rotate');
    // 数据/项目选择被清空
    expect(state.seismic.currentSeismic).toBeNull();
    expect(state.seismic.seismicList).toEqual([]);
    expect(state.projects.currentProject).toBeNull();
    expect(state.projects.projects).toEqual([]);
    // 登录态被清空
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.user).toBeNull();
    expect(state.auth.token).toBeNull();
  });

  it('重置后再次进入时状态为初始值，清掉的内容不会再次出现', () => {
    store.dispatch(setSliceVisible({ sliceType: 'depth', visible: true }));
    store.dispatch(logout.fulfilled(null, 'test-request-2'));

    const state = store.getState();
    expect(state.viewer.slices.depth.visible).toBe(false);
    expect(state.seismic.currentSeismic).toBeNull();
  });
});
