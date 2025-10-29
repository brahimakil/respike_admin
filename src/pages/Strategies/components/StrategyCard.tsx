import type { Strategy } from '../types';

interface StrategyCardProps {
  strategy: Strategy;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onManageVideos: () => void;
  onViewUsers: () => void;
}

export const StrategyCard = ({ strategy, onView, onEdit, onDelete, onManageVideos, onViewUsers }: StrategyCardProps) => {
  return (
    <div className="strategy-card">
      {strategy.coverPhotoUrl && (
        <div className="strategy-card-cover">
          <img src={strategy.coverPhotoUrl} alt={strategy.name} />
        </div>
      )}
      
      <div className="strategy-card-header">
        <div className="strategy-number">
          Strategy #{strategy.number}
        </div>
        <div className="strategy-price">
          ${strategy.price.toFixed(2)}
        </div>
      </div>

      <div className="strategy-card-body">
        <h3 className="strategy-title">{strategy.name}</h3>
        <p className="strategy-description">
          {strategy.description.length > 120
            ? `${strategy.description.substring(0, 120)}...`
            : strategy.description}
        </p>

        <div className="strategy-tags">
          {strategy.tags.map((tag, index) => (
            <span key={index} className="strategy-tag">
              {tag}
            </span>
          ))}
        </div>

        <div className="strategy-meta">
          <span className="meta-item">
            🎬 {strategy.videoCount || 0} videos
          </span>
          {strategy.expectedWeeks && (
            <span className="meta-item">
              ⏱️ {strategy.expectedWeeks} {strategy.expectedWeeks === 1 ? 'week' : 'weeks'}
            </span>
          )}
        </div>
      </div>

      <div className="strategy-card-footer">
        <button className="btn-icon primary" onClick={onManageVideos} title="Manage Videos">
          🎥
        </button>
        <button className="btn-icon info" onClick={onViewUsers} title="View Users">
          👥
        </button>
        <button className="btn-icon" onClick={onView} title="View Details">
          👁️
        </button>
        <button className="btn-icon" onClick={onEdit} title="Edit Strategy">
          ✏️
        </button>
        <button className="btn-icon danger" onClick={onDelete} title="Delete Strategy">
          🗑️
        </button>
      </div>
    </div>
  );
};

