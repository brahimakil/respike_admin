import { useState } from 'react';
import api from '../../../services/api';
import { storageService } from '../../../services/storage.service';
import { uploadVideoToBunny } from '../../../services/bunny.service';

interface AddVideoModalProps {
  strategyId: string;
  nextOrder: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddVideoModal = ({ strategyId, nextOrder, onClose, onSuccess }: AddVideoModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [video, setVideo] = useState<File | null>(null);
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

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
      setVideo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!video) {
      setError('Please upload a video file');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);
    setUploadStatus('');

    try {
      let videoUrl = '';
      let bunnyVideoId = '';
      let coverPhotoUrl = '';

      // Upload video DIRECTLY to Bunny.net (bypass backend to avoid Vercel limits)
      setUploadStatus(`Uploading video to Bunny.net (${storageService.formatBytes(video.size)})...`);
      try {
        const bunnyResult = await uploadVideoToBunny(video, (progress) => {
          setUploadProgress(progress * 0.7); // Use 70% of progress bar
          setUploadStatus(
            `Uploading video to Bunny.net: ${progress}%`
          );
        });
        
        videoUrl = bunnyResult.playbackUrl;
        bunnyVideoId = bunnyResult.videoId;
        setUploadProgress(70);
        setUploadStatus('Video uploaded to Bunny.net successfully! ✅');
      } catch (uploadError) {
        console.error('Error uploading video:', uploadError);
        setError('Failed to upload video. Please check your connection and try again.');
        setLoading(false);
        return;
      }

      // Upload cover photo if provided (still through backend - small files)
      if (coverPhoto) {
        setUploadProgress(75);
        setUploadStatus('Uploading cover photo...');
        const coverFormData = new FormData();
        coverFormData.append('cover', coverPhoto);
        
        try {
          const coverUploadResponse = await api.post(`/strategies/${strategyId}/videos/upload-cover`, coverFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          coverPhotoUrl = coverUploadResponse.data.url;
          setUploadProgress(85);
        } catch (uploadError) {
          console.error('Error uploading cover photo:', uploadError);
          // Continue even if cover photo fails
        }
      }

      // Create video record in database
      setUploadProgress(90);
      setUploadStatus('Saving video details...');
      await api.post(`/strategies/${strategyId}/videos`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        videoUrl,
        bunnyVideoId, // Save bunnyVideoId for future fallback logic
        coverPhotoUrl: coverPhotoUrl || undefined,
      });

      setUploadProgress(100);
      setUploadStatus('Video added successfully! 🎉');
      onSuccess();
    } catch (error: any) {
      console.error('Error creating video:', error);
      setError(error.response?.data?.message || 'Failed to create video');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎥 Add New Video</h2>
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
              <span className="number-badge">Video #{nextOrder}</span>
            </div>

            <div className="form-group">
              <label>Video File *</label>
              <div className="video-upload">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  id="video-file-input"
                  style={{ display: 'none' }}
                />
                <label htmlFor="video-file-input" className="video-upload-label">
                  <div className="upload-placeholder">
                    <span className="upload-icon">🎬</span>
                    <span>{video ? `${video.name} (${storageService.formatBytes(video.size)})` : 'Click to upload video'}</span>
                    <span className="upload-hint">Supported: MP4, WebM, MOV • Max: 1GB</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Cover Photo (Optional)</label>
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
                  <label htmlFor="cover-photo-input" className="cover-photo-label">
                    <div className="upload-placeholder">
                      <span className="upload-icon">📷</span>
                      <span>Click to upload cover photo</span>
                      <span className="upload-hint">Recommended: 800x450px</span>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="cover-photo-input"
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
                <p className="upload-status">{uploadStatus}</p>
                <p className="upload-percentage">{uploadProgress}%</p>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Uploading...' : '🎥 Add Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

