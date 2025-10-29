import { useState } from 'react';
import api from '../../../services/api';
import type { StrategyVideo } from '../types';

interface EditVideoModalProps {
  strategyId: string;
  video: StrategyVideo;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditVideoModal = ({ strategyId, video, onClose, onSuccess }: EditVideoModalProps) => {
  const [formData, setFormData] = useState({
    title: video.title,
    description: video.description,
  });
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>(video.coverPhotoUrl || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      let videoUrl = video.videoUrl;
      let coverPhotoUrl = coverPhotoPreview;

      // Upload new video if provided
      if (newVideo) {
        setUploadProgress(10);
        const videoFormData = new FormData();
        videoFormData.append('video', newVideo);
        
        try {
          const videoUploadResponse = await api.post(`/strategies/${strategyId}/videos/upload-video`, videoFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          videoUrl = videoUploadResponse.data.url;
          setUploadProgress(50);
        } catch (uploadError) {
          console.error('Error uploading video:', uploadError);
          setError('Failed to upload video');
          setLoading(false);
          return;
        }
      }

      // Upload new cover photo if provided
      if (coverPhoto) {
        setUploadProgress(60);
        const coverFormData = new FormData();
        coverFormData.append('cover', coverPhoto);
        
        try {
          const coverUploadResponse = await api.post(`/strategies/${strategyId}/videos/upload-cover`, coverFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          coverPhotoUrl = coverUploadResponse.data.url;
          setUploadProgress(80);
        } catch (uploadError) {
          console.error('Error uploading cover photo:', uploadError);
        }
      }

      // Update video record
      setUploadProgress(90);
      await api.put(`/strategies/${strategyId}/videos/${video.id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl,
        coverPhotoUrl: coverPhotoUrl || undefined,
      });

      setUploadProgress(100);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating video:', error);
      setError(error.response?.data?.message || 'Failed to update video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Video</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="video-number-display">
              <span className="number-badge">Video #{video.order}</span>
            </div>

            <div className="form-group">
              <label>Replace Video (Optional)</label>
              <div className="video-upload">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  id="video-file-input-edit"
                  style={{ display: 'none' }}
                />
                <label htmlFor="video-file-input-edit" className="video-upload-label">
                  <div className="upload-placeholder">
                    <span className="upload-icon">🎬</span>
                    <span>{newVideo ? newVideo.name : 'Click to upload new video'}</span>
                    <span className="upload-hint">Leave empty to keep current video</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Cover Photo</label>
              <div className="cover-photo-upload">
                {coverPhotoPreview ? (
                  <div className="cover-photo-preview">
                    <img src={coverPhotoPreview} alt="Cover preview" />
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={() => {
                        setCoverPhoto(null);
                        setCoverPhotoPreview('');
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <label htmlFor="cover-photo-input-edit" className="cover-photo-label">
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span>Click to upload cover photo</span>
                      <span className="upload-hint">Recommended: 800x450px</span>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="cover-photo-input-edit"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Video Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Introduction to Strategy #1"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this video covers..."
                rows={4}
                required
              />
            </div>

            {loading && uploadProgress > 0 && (
              <div className="upload-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p>Uploading... {uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

