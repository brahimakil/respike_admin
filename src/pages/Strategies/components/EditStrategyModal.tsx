import { useState } from 'react';
import type { Strategy } from '../types';
import api from '../../../services/api';

interface EditStrategyModalProps {
  strategy: Strategy;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditStrategyModal = ({ strategy, onClose, onSuccess }: EditStrategyModalProps) => {
  const [formData, setFormData] = useState({
    number: strategy.number.toString(),
    name: strategy.name,
    description: strategy.description,
    price: strategy.price.toString(),
    tags: strategy.tags.join(', '),
    expectedWeeks: strategy.expectedWeeks?.toString() || '',
  });
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>(strategy.coverPhotoUrl || '');
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
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.number) {
      setError('Please fill in all required fields');
      return;
    }

    const price = parseFloat(formData.price);
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price');
      return;
    }

    const number = parseInt(formData.number);
    if (isNaN(number) || number < 1) {
      setError('Please enter a valid strategy number (must be 1 or higher)');
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
      let coverPhotoUrl = coverPhotoPreview;
      
      // Upload new cover photo if changed
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

      await api.put(`/strategies/${strategy.id}`, {
        number,
        name: formData.name.trim(),
        description: formData.description.trim(),
        price,
        tags,
        coverPhotoUrl: coverPhotoUrl || undefined,
        expectedWeeks: formData.expectedWeeks ? parseInt(formData.expectedWeeks) : undefined,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error updating strategy:', error);
      setError(error.response?.data?.message || 'Failed to update strategy');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content strategy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Strategy</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label>
                Strategy Number *
              </label>
              <input
                type="number"
                min="1"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="1"
                required
              />
              <small className="form-hint">
                This number must be unique. Cannot duplicate existing strategy numbers.
              </small>
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
                      <span className="upload-hint">Recommended: 800x400px</span>
                    </div>
                  </label>
                )}
                <input
                  type="file"
                  id="cover-photo-input-edit"
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
              {loading ? 'Saving...' : '💾 Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

