import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import api from '../../services/api';
import type { Strategy, StrategyVideo } from './types';
import { AddVideoModal } from './components/AddVideoModal';
import { EditVideoModal } from './components/EditVideoModal';
import './styles/videos.css';

export const VideosManagement = () => {
  const { strategyId } = useParams<{ strategyId: string }>();
  const navigate = useNavigate();
  
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [videos, setVideos] = useState<StrategyVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<StrategyVideo | null>(null);

  useEffect(() => {
    if (strategyId) {
      fetchStrategy();
      fetchVideos();
    }
  }, [strategyId]);

  const fetchStrategy = async () => {
    try {
      const response = await api.get(`/strategies/${strategyId}`);
      setStrategy(response.data);
    } catch (error) {
      console.error('Error fetching strategy:', error);
      alert('Failed to load strategy');
      navigate('/strategies');
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/strategies/${strategyId}/videos`);
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchVideos();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedVideo(null);
    fetchVideos();
  };

  const handleToggleVisibility = async (video: StrategyVideo, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await api.patch(`/strategies/${strategyId}/videos/${video.id}/visibility`, {
        isVisible: !video.isVisible,
      });
      fetchVideos();
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update video visibility');
    }
  };

  const handleDelete = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      await api.delete(`/strategies/${strategyId}/videos/${videoId}`);
      fetchVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
      alert('Failed to delete video');
    }
  };

  const handleMoveUp = async (video: StrategyVideo) => {
    if (video.order === 1) return;
    
    try {
      await api.patch(`/strategies/${strategyId}/videos/${video.id}/reorder`, {
        newOrder: video.order - 1,
      });
      fetchVideos();
    } catch (error) {
      console.error('Error reordering video:', error);
      alert('Failed to reorder video');
    }
  };

  const handleMoveDown = async (video: StrategyVideo) => {
    if (video.order === videos.length) return;
    
    try {
      await api.patch(`/strategies/${strategyId}/videos/${video.id}/reorder`, {
        newOrder: video.order + 1,
      });
      fetchVideos();
    } catch (error) {
      console.error('Error reordering video:', error);
      alert('Failed to reorder video');
    }
  };

  if (loading || !strategy) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading videos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="videos-management-container">
        <div className="videos-header">
          <button className="btn-back" onClick={() => navigate('/strategies')}>
            ← Back to Strategies
          </button>
          
          <div 
            className="strategy-info-header"
            style={strategy.coverPhotoUrl ? {
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url(${strategy.coverPhotoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            } : undefined}
          >
            <div className="strategy-header-content">
              <div className="strategy-badge">Strategy #{strategy.number}</div>
              <h1>{strategy.name}</h1>
              <p className="strategy-subtitle">{strategy.description}</p>
            </div>
          </div>

          <div className="videos-actions-bar">
            <div className="videos-count">
              📹 {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
            </div>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              ➕ Add New Video
            </button>
          </div>
        </div>

        {videos.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎥</div>
            <h3>No Videos Yet</h3>
            <p>Start building your strategy by adding video lessons!</p>
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              ➕ Add First Video
            </button>
          </div>
        ) : (
          <div className="videos-list">
            {videos.map((video) => (
              <div key={video.id} className={`video-item ${!video.isVisible ? 'hidden-video' : ''}`}>
                <div className="video-order-controls">
                  <button
                    className="order-btn"
                    onClick={() => handleMoveUp(video)}
                    disabled={video.order === 1}
                    title="Move up"
                  >
                    ▲
                  </button>
                  <span className="order-number">{video.order}</span>
                  <button
                    className="order-btn"
                    onClick={() => handleMoveDown(video)}
                    disabled={video.order === videos.length}
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {video.coverPhotoUrl && (
                  <div className="video-thumbnail">
                    <img src={video.coverPhotoUrl} alt={video.title} />
                    <div className="play-overlay">▶</div>
                  </div>
                )}

                <div className="video-content">
                  <div className="video-header-row">
                    <h3 className="video-title">{video.title}</h3>
                    {!video.isVisible && (
                      <span className="hidden-badge">👁️ Hidden</span>
                    )}
                  </div>
                  <p className="video-description">{video.description}</p>
                </div>

                <div className="video-actions">
                  <button
                    className="btn-icon primary"
                    onClick={() => {
                      setSelectedVideo(video);
                      setShowPlayerModal(true);
                    }}
                    title="Play video"
                  >
                    ▶️
                  </button>
                  <button
                    className={`btn-icon ${video.isVisible ? 'success' : 'warning'}`}
                    onClick={(e) => handleToggleVisibility(video, e)}
                    title={video.isVisible ? 'Hide video' : 'Show video'}
                  >
                    {video.isVisible ? '👁️' : '👁️‍🗨️'}
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => {
                      setSelectedVideo(video);
                      setShowEditModal(true);
                    }}
                    title="Edit video"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(video.id)}
                    title="Delete video"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modals */}
        {showAddModal && strategyId && (
          <AddVideoModal
            strategyId={strategyId}
            nextOrder={videos.length + 1}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
          />
        )}

        {showEditModal && selectedVideo && strategyId && (
          <EditVideoModal
            strategyId={strategyId}
            video={selectedVideo}
            onClose={() => {
              setShowEditModal(false);
              setSelectedVideo(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {showPlayerModal && selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            onClose={() => {
              setShowPlayerModal(false);
              setSelectedVideo(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Video Player Modal Component
const VideoPlayerModal = ({
  video,
  onClose,
}: {
  video: StrategyVideo;
  onClose: () => void;
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>▶️ {video.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body video-player-body">
          <div className="video-player-container">
            <video
              controls
              autoPlay
              controlsList="nodownload"
              disablePictureInPicture
              className="video-player"
              poster={video.coverPhotoUrl}
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={video.videoUrl} type="video/mp4" />
              <source src={video.videoUrl} type="video/webm" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="video-info-section">
            <div className="video-meta">
              <span className="video-order-badge">Video #{video.order}</span>
              {!video.isVisible && (
                <span className="hidden-badge">👁️ Hidden from Users</span>
              )}
            </div>

            <h3 className="player-video-title">{video.title}</h3>
            <p className="player-video-description">{video.description}</p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

