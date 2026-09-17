import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Spin, message, Space, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { RootState, AppDispatch } from '../store';
import {
  fetchSeismicById,
  setCurrentSeismic,
  clearSeismicData,
} from '../store/slices/seismicSlice';
import { fetchProjects } from '../store/slices/projectSlice';
import { resetViewer } from '../store/slices/viewerSlice';
import { SeismicData } from '../types';
import SeismicCanvas from '../components/SeismicCanvas';
import ControlPanel from '../components/ControlPanel';
import Toolbar from '../components/Toolbar';
import StatusBar from '../components/StatusBar';

const { Title } = Typography;

const Viewer: React.FC = () => {
  const { seismicId } = useParams<{ seismicId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);

  const { seismicList, loading } = useSelector((state: RootState) => state.seismic);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [currentData, setCurrentData] = useState<SeismicData | null>(null);

  // 刷新后直达查看页时项目列表可能为空，补拉一次以便顶栏显示项目名称
  useEffect(() => {
    if (projects.length === 0) {
      dispatch(fetchProjects());
    }
  }, [projects.length, dispatch]);

  // 每次进入查看页都恢复成初始查看状态，避免上一条数据的切片、测量等面板配置串到当前数据
  useEffect(() => {
    dispatch(resetViewer());
    setCurrentData(null);
  }, [seismicId, dispatch]);

  useEffect(() => {
    let cancelled = false;
    const id = parseInt(seismicId || '0');
    if (!id) return;

    const loadData = async () => {
      // 只以当前数据为依据：列表命中即用，未命中则按 id 从服务端获取，
      // 不再沿用上一次浏览残留的数据
      const existing = seismicList.find((s) => s.id === id);
      if (existing) {
        if (!cancelled) {
          setCurrentData(existing);
          dispatch(setCurrentSeismic(existing));
        }
        return;
      }

      const result = await dispatch(fetchSeismicById(id));
      if (cancelled) return;
      if (fetchSeismicById.fulfilled.match(result)) {
        setCurrentData(result.payload);
      } else {
        message.error('未找到地震数据');
        navigate('/projects');
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [seismicId, seismicList, dispatch, navigate]);

  // 离开查看页时清掉当前数据上下文，返回后顶栏不再显示上一条数据的名称
  useEffect(() => {
    return () => {
      dispatch(clearSeismicData());
    };
  }, [dispatch]);

  if (loading || !currentData) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (currentData.status !== 'ready') {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 16,
        }}
      >
        <Title level={4}>数据尚未就绪</Title>
        <p>当前状态: {currentData.status}</p>
        <Button type="primary" onClick={() => navigate('/projects')}>
          返回项目列表
        </Button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="seismic-canvas-container">
      <SeismicCanvas seismicData={currentData} containerRef={containerRef} />

      <Toolbar />

      <ControlPanel seismicData={currentData} />

      <StatusBar seismicData={currentData} />

      <div
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 100,
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            返回
          </Button>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: 4,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <strong>{currentData.name}</strong>
          </div>
        </Space>
      </div>
    </div>
  );
};

export default Viewer;
