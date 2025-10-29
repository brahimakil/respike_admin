import { useState } from 'react';
import api from '../../../services/api';

interface AddStrategyModalProps {
  onClose: () => void;
  onSuccess: () => void;
  nextNumber: number;
}

export const AddStrategyModal = ({ onClose, onSuccess, nextNumber }: AddStrategyModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    tags: '',
    expectedWeeks: '',
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    // Validate expectedWeeks if provided
    if (formData.expectedWeeks) {
      const weeks = parseInt(formData.expectedWeeks);
      if (isNaN(weeks) || weeks < 1) {
        setError('Expected weeks must be at least 1 week');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let coverPhotoUrl = '';
      
      // Upload cover photo first if provided
      if (coverPhoto) {
        const photoFormData = new FormData();
        photoFormData.append('cover', coverPhoto);
        
        try {
          const uploadResponse = await api.post('/strategies/upload-cover', photoFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          coverPhotoUrl = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading cover photo:', uploadError);
          setError('Failed to upload cover photo');
          setLoading(false);
          return;
        }
      }

      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      await api.post('/strategies', {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        tags,
        coverPhotoUrl: coverPhotoUrl || undefined,
        expectedWeeks: formData.expectedWeeks ? parseInt(formData.expectedWeeks) : undefined,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error creating strategy:', error);
      setError(error.response?.data?.message || 'Failed to create strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content strategy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add New Strategy</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="strategy-number-display">
              <span className="number-badge">Strategy #{nextNumber}</span>
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
                      <span className="upload-hint">Recommended: 800x400px</span>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="cover-photo-input"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                Strategy Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Advanced Trading Strategy"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this strategy in detail..."
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>
                Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>
                Expected Duration (Weeks)
              </label>
              <input
                type="number"
                min="1"
                value={formData.expectedWeeks}
                onChange={(e) => setFormData({ ...formData, expectedWeeks: e.target.value })}
                placeholder="e.g., 4 (for 4 weeks)"
              />
              <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
                How many weeks does this strategy take? (e.g., 2-4 weeks, enter 4)
              </small>
            </div>

            <div className="form-group">
              <label>
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="e.g., beginner, advanced, sports"
              />
              <small className="form-hint">
                Separate multiple tags with commas
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '➕ Create Strategy'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

