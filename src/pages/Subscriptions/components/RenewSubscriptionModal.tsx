import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import type { Subscription } from '../types';

interface RenewSubscriptionModalProps {
  subscription: Subscription;
  onClose: () => void;
  onSuccess: () => void;
}

interface Strategy {
  id: string;
  number: number;
  name: string;
  price: number;
}

interface User {
  id: string;
  uid: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  coachCommissionOverride?: number;
}

interface Coach {
  id: string;
  defaultCommissionPercentage?: number;
}

export const RenewSubscriptionModal = ({
  subscription,
  onClose,
  onSuccess,
}: RenewSubscriptionModalProps) => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState<number>(30);

  const [formData, setFormData] = useState({
    duration: '30',
    newStrategyId: subscription.strategyId, // Default to current strategy
    customAmount: '100', // Default renewal amount
  });

  useEffect(() => {
    fetchStrategies();
    fetchUser();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      setStrategies(response.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${subscription.userId}`);
      const userData: User = response.data;
      setUser(userData);

      // Determine commission percentage
      if (userData.assignedCoachId) {
        if (userData.coachCommissionOverride !== undefined && userData.coachCommissionOverride !== null) {
          // User has a specific override
          setCommissionPercentage(userData.coachCommissionOverride);
          console.log(`💰 Using user-specific commission override: ${userData.coachCommissionOverride}%`);
        } else {
          // Fetch coach's default commission
          try {
            const coachResponse = await api.get(`/coaches/${userData.assignedCoachId}`);
            const coach: Coach = coachResponse.data;
            setCommissionPercentage(coach.defaultCommissionPercentage || 30);
            console.log(`💰 Using coach's default commission: ${coach.defaultCommissionPercentage || 30}%`);
          } catch (error) {
            console.error('Error fetching coach:', error);
            setCommissionPercentage(30); // Fallback to 30%
          }
        }
      } else {
        setCommissionPercentage(0); // No coach
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const calculatePayment = () => {
    if (formData.newStrategyId === subscription.strategyId) {
      // Same strategy renewal - use custom amount
      const customAmount = parseFloat(formData.customAmount) || 0;
      return {
        type: 'renewal',
        amount: customAmount,
        message: customAmount === 0 ? 'Free renewal' : 'Custom renewal amount',
      };
    } else {
      // Strategy change
      const newStrategy = strategies.find((s) => s.id === formData.newStrategyId);
      if (!newStrategy) return { type: 'unknown', amount: 0, message: '' };

      const priceDifference = newStrategy.price - subscription.strategyPrice;
      
      if (priceDifference > 0) {
        return {
          type: 'upgrade',
          amount: priceDifference,
          message: `Upgrade difference: $${newStrategy.price.toFixed(2)} - $${subscription.strategyPrice.toFixed(2)}`,
        };
      } else if (priceDifference < 0) {
        return {
          type: 'downgrade',
          amount: 0,
          message: 'No additional payment required for downgrade',
        };
      } else {
        return {
          type: 'same-price',
          amount: 0,
          message: 'Both strategies have the same price, no additional payment required',
        };
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 1) {
      setError('Duration must be at least 1 day');
      return;
    }

    setLoading(true);

    try {
      const customAmount = parseFloat(formData.customAmount);
      
      await api.post(`/subscriptions/${subscription.id}/renew`, {
        duration,
        newStrategyId: formData.newStrategyId !== subscription.strategyId ? formData.newStrategyId : undefined,
        customAmount: formData.newStrategyId === subscription.strategyId ? customAmount : undefined,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error renewing subscription:', error);
      setError(error.response?.data?.message || 'Failed to renew subscription');
    } finally {
      setLoading(false);
    }
  };

  const payment = calculatePayment();
  const selectedStrategy = strategies.find((s) => s.id === formData.newStrategyId);

  // Calculate end date based on duration
  const calculateEndDate = () => {
    if (!formData.duration) return null;
    
    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 1) return null;

    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + duration);
    
    return endDate;
  };

  const endDate = calculateEndDate();

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal renew-subscription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Renew Subscription</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="current-subscription-info">
              <h4>Current Subscription</h4>
              <p>
                <strong>{subscription.userName}</strong> - Strategy #{subscription.strategyNumber}:{' '}
                {subscription.strategyName} (${subscription.strategyPrice.toFixed(2)})
              </p>
            </div>

            {/* Coach Info Display */}
            {user && user.assignedCoachId && (
              <div className="coach-info-box">
                <div className="coach-info-header">
                  <span className="coach-badge">👨‍🏫 Coach Assigned</span>
                </div>
                <div className="coach-info-content">
                  <p><strong>Coach Name:</strong> {user.assignedCoachName || 'Unknown'}</p>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.5rem' }}>
                    ℹ️ {commissionPercentage}% commission will be sent to the coach's wallet
                  </p>
                </div>
              </div>
            )}

            {user && !user.assignedCoachId && (
              <div className="info-box" style={{ background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6' }}>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.9rem' }}>
                  ℹ️ This user has no assigned coach. Full amount will go to system wallet.
                </p>
              </div>
            )}

            <div className="form-group">
              <label>
                Strategy <span className="required">*</span>
              </label>
              <select
                value={formData.newStrategyId}
                onChange={(e) => setFormData({ ...formData, newStrategyId: e.target.value })}
                required
              >
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    Strategy #{strategy.number}: {strategy.name} (${strategy.price.toFixed(2)})
                    {strategy.id === subscription.strategyId && ' (Current)'}
                  </option>
                ))}
              </select>
              <small className="help-text">
                Select the same strategy to renew, or a different one to switch
              </small>
            </div>

            <div className="form-group">
              <label>
                Duration (Days) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="30"
                required
              />
              <small className="help-text">Default is 30 days</small>
            </div>

            {/* Custom Amount Input - Only show for same strategy renewal */}
            {formData.newStrategyId === subscription.strategyId && (
              <div className="form-group">
                <label>
                  Renewal Amount ($) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.customAmount}
                  onChange={(e) => setFormData({ ...formData, customAmount: e.target.value })}
                  placeholder="100"
                  required
                />
                <small className="help-text">
                  Set custom renewal amount. Use 0 for free renewal, 100 for standard renewal, or any custom amount.
                </small>
              </div>
            )}

            {/* Payment Calculation */}
            <div className={`payment-box ${payment.type}`}>
              <h4>💰 Payment Calculation</h4>
              
              {payment.type === 'renewal' && (
                <div>
                  <p className="payment-detail">
                    <strong>Renewal Fee:</strong> ${payment.amount.toFixed(2)}
                  </p>
                  <p className="payment-note">
                    {payment.amount === 0 
                      ? '🎁 Free renewal - No payment required' 
                      : `${payment.message} for the same strategy`}
                  </p>
                </div>
              )}

              {payment.type === 'upgrade' && selectedStrategy && (
                <div>
                  <p className="payment-detail">Current Strategy: ${subscription.strategyPrice.toFixed(2)}</p>
                  <p className="payment-detail">New Strategy: ${selectedStrategy.price.toFixed(2)}</p>
                  <p className="payment-detail payment-difference">
                    <strong>Difference to Pay:</strong> ${payment.amount.toFixed(2)}
                  </p>
                  <p className="payment-note">
                    ✓ User only pays the difference when upgrading
                  </p>
                </div>
              )}

              {payment.type === 'downgrade' && selectedStrategy && (
                <div>
                  <p className="payment-detail">Current Strategy: ${subscription.strategyPrice.toFixed(2)}</p>
                  <p className="payment-detail">New Strategy: ${selectedStrategy.price.toFixed(2)}</p>
                  <p className="payment-detail payment-no-charge">
                    <strong>Amount to Pay:</strong> $0.00
                  </p>
                  <p className="payment-note">No additional payment for downgrade</p>
                </div>
              )}

              {payment.type === 'same-price' && (
                <div>
                  <p className="payment-detail payment-no-charge">
                    <strong>Amount to Pay:</strong> $0.00
                  </p>
                  <p className="payment-note">{payment.message}</p>
                </div>
              )}

              <p className="renewal-period">
                <strong>New Period:</strong> {formData.duration} days from now
              </p>
              {endDate && (
                <p style={{ 
                  background: 'rgba(74, 144, 226, 0.1)', 
                  padding: '0.75rem', 
                  borderRadius: '6px',
                  marginTop: '0.75rem',
                  borderLeft: '3px solid #4a90e2'
                }}>
                  <strong>📅 Subscription Will End:</strong><br />
                  {formatDate(endDate)}
                </p>
              )}

              {/* Commission Split Display (only if there's a payment amount) */}
              {user && user.assignedCoachId && payment.amount > 0 && (
                <div style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.05) 100%)',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginTop: '1rem',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  <h5 style={{ margin: '0 0 0.75rem 0', color: '#059669', fontSize: '0.95rem' }}>
                    💸 Payment Split
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        👨‍🏫 Coach ({commissionPercentage}%):
                      </span>
                      <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                        ${((payment.amount * commissionPercentage) / 100).toFixed(2)}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        🏢 System ({(100 - commissionPercentage).toFixed(1)}%):
                      </span>
                      <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>
                        ${(payment.amount - (payment.amount * commissionPercentage) / 100).toFixed(2)}
                      </strong>
                    </div>
                    <div style={{ 
                      borderTop: '1px solid rgba(16, 185, 129, 0.2)', 
                      paddingTop: '0.5rem', 
                      marginTop: '0.25rem' 
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>Total:</span>
                        <strong style={{ fontSize: '1.2rem', color: '#1e293b' }}>
                          ${payment.amount.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user && !user.assignedCoachId && payment.amount > 0 && (
                <p style={{
                  background: 'rgba(59, 130, 246, 0.1)',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginTop: '0.75rem',
                  borderLeft: '3px solid #3b82f6',
                  color: '#3b82f6',
                  fontSize: '0.9rem'
                }}>
                  💼 Full amount (${payment.amount.toFixed(2)}) goes to system wallet
                </p>
              )}
            </div>

            <div className="info-box">
              <p className="note">
                ⚠️ <strong>Note:</strong> When renewing with a different strategy, the user's video
                progress will be reset for the new strategy.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Processing...' : `Renew Subscription ($${payment.amount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

