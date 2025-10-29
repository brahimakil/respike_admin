import type { Strategy } from '../types';

interface ViewStrategyModalProps {
  strategy: Strategy;
  onClose: () => void;
  onEdit: () => void;
}

export const ViewStrategyModal = ({ strategy, onClose, onEdit }: ViewStrategyModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content view-strategy-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📊 Strategy Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {strategy.coverPhotoUrl && (
            <div className="strategy-cover-view">
              <img src={strategy.coverPhotoUrl} alt={strategy.name} />
            </div>
          )}

          <div className="strategy-view-header">
            <div className="strategy-number-large">
              Strategy #{strategy.number}
            </div>
            <div className="strategy-price-large">
              ${strategy.price.toFixed(2)}
            </div>
          </div>

          <div className="view-section">
            <h3>Strategy Name</h3>
            <p className="view-content">{strategy.name}</p>
          </div>

          <div className="view-section">
            <h3>Description</h3>
            <p className="view-content description-text">{strategy.description}</p>
          </div>

          <div className="view-section">
            <h3>Tags</h3>
            <div className="strategy-tags-large">
              {strategy.tags.length > 0 ? (
                strategy.tags.map((tag, index) => (
                  <span key={index} className="strategy-tag-large">
                    {tag}
                  </span>
                ))
              ) : (
                <p className="no-data">No tags added</p>
              )}
            </div>
          </div>

          <div className="view-section">
            <h3>Metadata</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label">Created:</span>
                <span className="metadata-value">
                  {new Date(strategy.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Last Updated:</span>
                <span className="metadata-value">
                  {new Date(strategy.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={onEdit}>
            ✏️ Edit Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

