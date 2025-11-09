import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Hls from 'hls.js';
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
            {videos.map((video) => {
              // Check if video is from Bunny.net and might be processing
              const isBunnyVideo = video.videoUrl?.includes('.m3u8');
              
              return (
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
                    {isBunnyVideo && (
                      <div className="bunny-badge" title="Bunny.net Stream">🐰</div>
                    )}
                    <div className="play-overlay">▶</div>
                  </div>
                )}

                <div className="video-content">
                  <div className="video-header-row">
                    <h3 className="video-title">{video.title}</h3>
                    {!video.isVisible && (
                      <span className="hidden-badge">👁️ Hidden</span>
                    )}
                    {isBunnyVideo && (
                      <span className="bunny-badge-inline" title="Bunny.net HLS Stream">
                        ⚡ HLS
                      </span>
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
            );
            })}
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [videoStatus, setVideoStatus] = useState<'loading' | 'ready' | 'processing' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    console.log('🎬 VideoPlayerModal useEffect - video:', video);
    console.log('🎬 Video URL:', video.videoUrl);
    
    if (!videoRef.current || !video.videoUrl) {
      console.error('❌ Missing videoRef or videoUrl', { 
        hasVideoRef: !!videoRef.current, 
        videoUrl: video.videoUrl 
      });
      setVideoStatus('error');
      setErrorMessage('Video URL is missing');
      return;
    }

    const videoElement = videoRef.current;
    const videoUrl = video.videoUrl;

    console.log('🎬 Checking video type:', videoUrl);

    // Check if video is HLS (Bunny.net) or MP4 (Firebase)
    if (videoUrl.endsWith('.m3u8')) {
      // HLS video from Bunny.net
      console.log('🎬 Admin: Initializing HLS player');
      setVideoStatus('loading');

      if (Hls.isSupported()) {
        console.log('✅ HLS.js is supported');
        // Destroy previous HLS instance if exists
        if (hlsRef.current) {
          console.log('🗑️ Destroying previous HLS instance');
          hlsRef.current.destroy();
        }

        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90,
        });

        console.log('📥 Loading HLS source:', videoUrl);
        hls.loadSource(videoUrl);
        hls.attachMedia(videoElement);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          console.log('✅ Admin: HLS manifest loaded, attempting to play');
          setVideoStatus('ready');
          videoElement.play().then(() => {
            console.log('✅ Video playing successfully');
          }).catch(err => {
            console.error('❌ Failed to play video:', err);
            setVideoStatus('error');
            setErrorMessage('Failed to play video: ' + err.message);
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          console.error('❌ HLS Error:', data);
          if (data.fatal) {
            console.error('❌ Admin: Fatal HLS error:', data);
            
            // Check if it's a 404 (video still processing)
            if (data.response?.code === 404 || data.details === 'manifestLoadError') {
              setVideoStatus('processing');
              setErrorMessage('Video is still being processed by Bunny.net. This usually takes 2-5 minutes. Please try again in a few moments.');
              console.log('🔄 Video still processing on Bunny.net');
            } else {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log('🔄 Network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log('🔄 Media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  console.error('💥 Unrecoverable error, destroying HLS');
                  setVideoStatus('error');
                  setErrorMessage('Failed to load video: ' + (data.details || 'Unknown error'));
                  hls.destroy();
                  break;
              }
            }
          }
        });

        hlsRef.current = hls;
      } else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        console.log('🍎 Using native HLS support (Safari)');
        videoElement.src = videoUrl;
        videoElement.play().then(() => {
          console.log('✅ Video playing with native HLS');
          setVideoStatus('ready');
        }).catch(err => {
          console.error('❌ Failed to play with native HLS:', err);
          setVideoStatus('error');
          setErrorMessage('Failed to play video: ' + err.message);
        });
      } else {
        console.error('❌ HLS not supported in this browser');
        setVideoStatus('error');
        setErrorMessage('HLS streaming not supported in this browser');
      }
    } else {
      // Regular MP4 video
      console.log('🎥 Loading MP4 video:', videoUrl);
      setVideoStatus('loading');
      videoElement.src = videoUrl;
      videoElement.load();
      videoElement.onloadeddata = () => {
        console.log('✅ MP4 video loaded');
        setVideoStatus('ready');
      };
      videoElement.onerror = () => {
        console.error('❌ Failed to load MP4 video');
        setVideoStatus('error');
        setErrorMessage('Failed to load video file');
      };
    }

    // Cleanup
    return () => {
      console.log('🧹 Cleaning up HLS instance');
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [video.videoUrl]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-player-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>▶️ {video.title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body video-player-body">
          <div className="video-player-container">
            {videoStatus === 'processing' && (
              <div className="video-processing-overlay">
                <div className="processing-content">
                  <div className="spinner"></div>
                  <h3>⏳ Video Processing</h3>
                  <p>{errorMessage}</p>
                  <button className="btn-primary" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            )}
            
            {videoStatus === 'error' && !errorMessage.includes('processing') && (
              <div className="video-error-overlay">
                <div className="error-content">
                  <h3>❌ Error</h3>
                  <p>{errorMessage}</p>
                  <button className="btn-secondary" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            )}

            <video
              ref={videoRef}
              controls
              autoPlay
              controlsList="nodownload"
              disablePictureInPicture
              className="video-player"
              poster={video.coverPhotoUrl}
              onContextMenu={(e) => e.preventDefault()}
              style={{ display: videoStatus === 'processing' || (videoStatus === 'error' && !errorMessage.includes('processing')) ? 'none' : 'block' }}
            >
              {/* Source will be set by HLS.js or directly for MP4 */}
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

