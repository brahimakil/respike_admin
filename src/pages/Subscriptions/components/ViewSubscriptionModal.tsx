import type { Subscription } from '../types';

interface ViewSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
}

export const ViewSubscriptionModal = ({ subscription, onClose }: ViewSubscriptionModalProps) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = () => {
    switch (subscription.status) {
      case 'active':
        return <span className="status-badge status-active">✓ Active</span>;
      case 'pending':
        return <span className="status-badge status-pending">⏱️ Pending Renewal</span>;
      case 'expired':
        return <span className="status-badge status-expired">✗ Expired</span>;
      case 'cancelled':
        return <span className="status-badge status-cancelled">🚫 Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal view-subscription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📋 Subscription Details</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="subscription-detail-header">
            <div className="user-avatar-large">
              {subscription.userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3>{subscription.userName}</h3>
              <p className="detail-email">{subscription.userEmail}</p>
              {getStatusBadge()}
            </div>
          </div>

          <div className="detail-section">
            <h4>🎯 Strategy Information</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Strategy</label>
                <p>
                  #{subscription.strategyNumber}: {subscription.strategyName}
                </p>
              </div>
              <div className="detail-item">
                <label>Price</label>
                <p>${subscription.strategyPrice.toFixed(2)}</p>
              </div>
              <div className="detail-item">
                <label>Amount Paid</label>
                <p>${subscription.amountPaid.toFixed(2)}</p>
              </div>
              <div className="detail-item">
                <label>Renewals</label>
                <p>{subscription.renewalCount}x</p>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h4>📅 Subscription Period</h4>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Start Date</label>
                <p>{formatDate(subscription.startDate)}</p>
              </div>
              <div className="detail-item">
                <label>End Date</label>
                <p>{formatDate(subscription.endDate)}</p>
              </div>
              <div className="detail-item">
                <label>Duration</label>
                <p>{subscription.duration} days</p>
              </div>
              {subscription.expiredAt && (
                <div className="detail-item">
                  <label>Expired At</label>
                  <p>{formatDate(subscription.expiredAt)}</p>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h4>📊 Progress Tracking</h4>
            <div className="progress-summary">
              <div className="progress-bar-large">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${subscription.progressPercentage}%` }}
                />
              </div>
              <p className="progress-text">
                {subscription.completedVideos} of {subscription.totalVideos} videos completed (
                {subscription.progressPercentage}%)
              </p>
            </div>

            <div className="video-progress-list">
              {subscription.videoProgress.map((video) => (
                <div
                  key={video.videoId}
                  className={`video-progress-item ${video.isCompleted ? 'completed' : ''} ${
                    subscription.currentVideoId === video.videoId ? 'current' : ''
                  }`}
                >
                  <div className="video-number">{video.videoOrder}</div>
                  <div className="video-info">
                    <h5>{video.videoTitle}</h5>
                    {subscription.currentVideoId === video.videoId && !video.isCompleted && (
                      <span className="current-badge">📍 Current</span>
                    )}
                    {video.isCompleted && video.completedAt && (
                      <span className="completed-badge">
                        ✓ Completed {formatDate(video.completedAt)}
                      </span>
                    )}
                  </div>
                  <div className="video-status">
                    {video.isCompleted ? '✓' : '○'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {subscription.previousStrategyId && (
            <div className="detail-section">
              <h4>🔄 Upgrade History</h4>
              <p className="info-text">
                Upgraded from a ${subscription.previousStrategyPrice?.toFixed(2)} strategy
              </p>
            </div>
          )}
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

