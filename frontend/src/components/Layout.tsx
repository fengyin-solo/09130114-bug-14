import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Dropdown, Avatar, Space, Modal, Descriptions, Tag } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppstoreOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { logout } from '../store/slices/authSlice';
import { RootState, AppDispatch } from '../store';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { currentSeismic, seismicList } = useSelector((state: RootState) => state.seismic);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menuItems = [
    {
      key: '/projects',
      icon: <AppstoreOutlined />,
      label: '项目管理',
      onClick: () => navigate('/projects'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
      onClick: () => setIsProfileOpen(true),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {},
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        // 等待状态清理完成再跳转，确保重新进入时不会残留上一次的页面与面板
        Promise.resolve(dispatch(logout())).then(() => {
          navigate('/login', { replace: true });
        });
      },
    },
  ];

  // 项目管理模块包含项目列表页与数据查看页，进入查看页时侧栏仍选中“项目管理”
  const selectedKey =
    location.pathname.startsWith('/projects') || location.pathname.startsWith('/viewer')
      ? '/projects'
      : undefined;

  // 顶栏标题始终与当前页面内容对应
  const isViewer = location.pathname.startsWith('/viewer/');
  let headerTitle = '项目管理';
  if (isViewer) {
    const seismic =
      currentSeismic || seismicList.find((s) => `/viewer/${s.id}` === location.pathname);
    const project = seismic
      ? projects.find((p) => p.id === seismic.project_id)
      : undefined;
    const parts = [project?.name, seismic?.name].filter(Boolean);
    headerTitle = parts.length > 0 ? parts.join(' / ') : '数据查看';
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: '#001529',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            S
          </div>
          <span style={{ color: 'white', fontSize: 18, fontWeight: 600 }}>
            SeismicVision
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              borderLeft: '1px solid rgba(255,255,255,0.25)',
              paddingLeft: 16,
            }}
          >
            {headerTitle}
          </span>
        </div>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer', color: 'white' }}>
            <Avatar size="small" icon={<UserOutlined />} />
            <span>{user?.full_name || user?.username}</span>
          </Space>
        </Dropdown>
      </Header>

      <AntLayout>
        <Sider width={220} style={{ background: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKey ? [selectedKey] : []}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Content style={{ margin: 0, background: '#f0f2f5', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </AntLayout>

      <Modal
        title="个人资料"
        open={isProfileOpen}
        onCancel={() => setIsProfileOpen(false)}
        footer={null}
      >
        <Descriptions column={1} bordered size="small">
          <Descriptions.Item label="用户名">{user?.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="姓名">{user?.full_name || '-'}</Descriptions.Item>
          <Descriptions.Item label="邮箱">{user?.email || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            {user?.is_admin ? <Tag color="red">管理员</Tag> : <Tag>普通用户</Tag>}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {user?.created_at ? new Date(user.created_at).toLocaleString('zh-CN') : '-'}
          </Descriptions.Item>
        </Descriptions>
      </Modal>
    </AntLayout>
  );
};

export default Layout;
