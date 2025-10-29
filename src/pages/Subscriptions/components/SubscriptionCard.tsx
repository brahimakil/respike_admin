import type { Subscription } from '../types';

interface SubscriptionCardProps {
  subscription: Subscription;
  onView: (subscription: Subscription) => void;
  onRenew: (subscription: Subscription) => void;
  onCancel: (id: string) => void;
  onSetPending: (id: string) => void;
  onDelete: (id: string) => void;
}

export const SubscriptionCard = ({
  subscription,
  onView,
  onRenew,
  onCancel,
  onSetPending,
  onDelete,
}: SubscriptionCardProps) => {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'pending':
        return 'status-pending';
      case 'expired':
        return 'status-expired';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return '✓ Active';
      case 'pending':
        return '⏱️ Pending';
      case 'expired':
        return '✗ Expired';
      case 'cancelled':
        return '🚫 Cancelled';
      default:
        return status;
    }
  };

  const getRemainingTime = () => {
    if (subscription.status !== 'active') return null;
    const now = new Date();
    const end = new Date(subscription.endDate);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    // If less than 2 hours, show in minutes
    if (diffMinutes < 120) {
      return { value: diffMinutes, unit: 'minutes', days: diffDays };
    }
    
    return { value: diffDays, unit: 'days', days: diffDays };
  };

  const remainingTime = getRemainingTime();

  const formatEndDate = (date: Date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`subscription-card ${getStatusClass(subscription.status)}`}>
      <div className="subscription-card-header">
        <div className="user-info">
          <div className="user-avatar">
            {subscription.userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3>{subscription.userName}</h3>
            <p className="user-email">{subscription.userEmail}</p>
          </div>
        </div>
        <span className={`subscription-status ${getStatusClass(subscription.status)}`}>
          {getStatusText(subscription.status)}
        </span>
      </div>

      <div className="subscription-card-body">
        <div className="strategy-info">
          <div className="strategy-badge">Strategy #{subscription.strategyNumber}</div>
          <h4>{subscription.strategyName}</h4>
          <p className="strategy-price">${subscription.strategyPrice.toFixed(2)}</p>
        </div>

        <div className="subscription-stats">
          <div className="stat-item">
            <span className="stat-label">Progress</span>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${subscription.progressPercentage}%` }}
              />
            </div>
            <span className="stat-value">
              {subscription.completedVideos}/{subscription.totalVideos} videos ({subscription.progressPercentage}%)
            </span>
          </div>

          {subscription.status === 'active' && remainingTime !== null && (
            <>
              <div className="stat-item">
                <span className="stat-label">Time Remaining</span>
                <span className={`stat-value ${remainingTime.days <= 7 ? 'text-warning' : ''}`}>
                  {remainingTime.value} {remainingTime.unit}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ends On</span>
                <span className="stat-value" style={{ fontSize: '0.85rem' }}>
                  📅 {formatEndDate(subscription.endDate)}
                </span>
              </div>
            </>
          )}

          <div className="stat-item">
            <span className="stat-label">Amount Paid</span>
            <span className="stat-value">${subscription.amountPaid.toFixed(2)}</span>
          </div>

          {subscription.renewalCount > 0 && (
            <div className="stat-item">
              <span className="stat-label">Renewals</span>
              <span className="stat-value">{subscription.renewalCount}x</span>
            </div>
          )}
        </div>
      </div>

      <div className="subscription-card-footer">
        <button className="btn-icon" onClick={() => onView(subscription)} title="View Details">
          👁️
        </button>
        {(subscription.status === 'pending' || subscription.status === 'expired') && (
          <button
            className="btn-icon primary"
            onClick={() => onRenew(subscription)}
            title="Renew Subscription"
          >
            🔄
          </button>
        )}
        {subscription.status === 'active' && (
          <>
            <button
              className="btn-icon warning"
              onClick={() => onSetPending(subscription.id)}
              title="Set to Pending (Expire)"
            >
              ⏱️
            </button>
            <button
              className="btn-icon warning"
              onClick={() => onCancel(subscription.id)}
              title="Cancel Subscription"
            >
              ⏸️
            </button>
          </>
        )}
        <button
          className="btn-icon danger"
          onClick={() => onDelete(subscription.id)}
          title="Delete Subscription"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

