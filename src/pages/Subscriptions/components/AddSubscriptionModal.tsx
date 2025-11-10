import React, { useState, useEffect } from 'react';
import api from '../../../services/api';

interface AddSubscriptionModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  status: string;
  assignedCoachId?: string;
  assignedCoachName?: string;
  coachCommissionOverride?: number;
}

interface Coach {
  id: string;
  defaultCommissionPercentage?: number;
}

interface Strategy {
  id: string;
  number: number;
  name: string;
  price: number;
}

export const AddSubscriptionModal = ({ onClose, onSuccess }: AddSubscriptionModalProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    userId: '',
    strategyId: '',
    duration: '30',
    durationType: 'days', // 'days' or 'minutes'
    coachCommissionPercentage: '30', // Default 30%
    amountPaid: '', // Total amount paid (backend expects amountPaid)
    paymentMethod: 'manual', // Payment method for manual subscriptions
    notes: '', // Admin notes
  });

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [hasCoach, setHasCoach] = useState(false);
  const [noCommission, setNoCommission] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchStrategies();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      console.log('📋 Fetched users:', response.data); // Debug log
      // Filter to only show active users
      const activeUsers = response.data.filter((user: User) => user.status === 'active');
      console.log('✅ Active users with coach info:', activeUsers.map((u: User) => ({ 
        id: u.id, 
        name: u.displayName, 
        assignedCoachId: u.assignedCoachId, 
        assignedCoachName: u.assignedCoachName 
      }))); // Debug log
      setUsers(activeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      setStrategies(response.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    }
  };

  // Handle user selection to check if they have a coach
  const handleUserChange = async (userId: string) => {
    console.log('🔍 Selected userId:', userId);
    setFormData({ ...formData, userId });
    const user = users.find(u => u.uid === userId);
    console.log('👤 Found user:', user);
    console.log('👨‍🏫 Has coach?', !!(user?.assignedCoachId), 'assignedCoachId:', user?.assignedCoachId, 'assignedCoachName:', user?.assignedCoachName);
    setSelectedUser(user || null);
    setHasCoach(!!(user?.assignedCoachId));
    
    // Determine commission percentage
    let commissionPercentage = '30'; // Default fallback
    
    if (user?.assignedCoachId) {
      // User has a coach
      if (user.coachCommissionOverride !== undefined && user.coachCommissionOverride !== null) {
        // User has a specific override
        commissionPercentage = user.coachCommissionOverride.toString();
        console.log(`💰 Using user-specific commission override: ${commissionPercentage}%`);
      } else {
        // Fetch coach's default commission
        try {
          const coachResponse = await api.get(`/coaches/${user.assignedCoachId}`);
          const coach: Coach = coachResponse.data;
          commissionPercentage = (coach.defaultCommissionPercentage || 30).toString();
          console.log(`💰 Using coach's default commission: ${commissionPercentage}%`);
        } catch (error) {
          console.error('Error fetching coach:', error);
          commissionPercentage = '30'; // Fallback to 30%
        }
      }
      setFormData(prev => ({ ...prev, userId, coachCommissionPercentage: commissionPercentage }));
      setNoCommission(false);
    } else {
      // No coach
      setFormData(prev => ({ ...prev, userId, coachCommissionPercentage: '0' }));
      setNoCommission(false);
    }
  };

  // Handle no commission checkbox
  const handleNoCommissionToggle = () => {
    const newNoCommission = !noCommission;
    setNoCommission(newNoCommission);
    setFormData({
      ...formData,
      coachCommissionPercentage: newNoCommission ? '0' : '30',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.userId || !formData.strategyId) {
      setError('Please select both user and strategy');
      return;
    }

    if (!formData.amountPaid || parseFloat(formData.amountPaid) < 0) {
      setError('Please enter a valid total amount');
      return;
    }

    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 1) {
      setError(`Duration must be at least 1 ${formData.durationType === 'minutes' ? 'minute' : 'day'}`);
      return;
    }

    setLoading(true);

    try {
      // Convert minutes to days (fractions) for backend
      const durationInDays = formData.durationType === 'minutes' 
        ? duration / (24 * 60) // Convert minutes to days
        : duration;

      const commissionPercentage = parseFloat(formData.coachCommissionPercentage);
      const amountPaid = parseFloat(formData.amountPaid);

      const requestBody = {
        userId: formData.userId,
        strategyId: formData.strategyId,
        duration: durationInDays,
        coachCommissionPercentage: commissionPercentage,
        amountPaid, // Send as amountPaid (backend expects this)
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || undefined,
      };

      console.log('📤 [FRONTEND] Sending subscription request:', requestBody);

      await api.post('/subscriptions', requestBody);

      onSuccess();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create subscription';
      
      // Check if error is about existing active/pending subscription
      if (errorMessage.includes('already has an active subscription') || 
          errorMessage.includes('pending') || 
          errorMessage.includes('Only one strategy subscription allowed')) {
        setError('⚠️ This user already has a subscription. Please use the "Renew" button on their existing subscription card to extend or upgrade it.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedStrategy = strategies.find((s) => s.id === formData.strategyId);

  // Calculate end date based on duration
  const calculateEndDate = () => {
    if (!formData.duration) return null;
    
    const duration = parseInt(formData.duration);
    if (isNaN(duration) || duration < 1) return null;

    const now = new Date();
    const endDate = new Date(now);
    
    if (formData.durationType === 'minutes') {
      endDate.setMinutes(endDate.getMinutes() + duration);
    } else {
      endDate.setDate(endDate.getDate() + duration);
    }
    
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
      <div className="modal subscription-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>➕ Add New Subscription</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="error-message">{error}</div>}

            <div className="form-group">
              <label>
                User <span className="required">*</span>
              </label>
              <select
                value={formData.userId}
                onChange={(e) => handleUserChange(e.target.value)}
                required
              >
                <option value="">-- Select User --</option>
                {users.map((user) => (
                  <option key={user.uid} value={user.uid}>
                    {user.displayName || user.email} ({user.email})
                  </option>
                ))}
              </select>
              <small className="help-text">
                ⚠️ Each user can only have ONE active subscription at a time
              </small>
            </div>

            {/* Coach Info Display */}
            {selectedUser && hasCoach && (
              <div className="coach-info-box">
                <div className="coach-info-header">
                  <span className="coach-badge">👨‍🏫 Coach Assigned</span>
                </div>
                <div className="coach-info-content">
                  <p><strong>Coach Name:</strong> {selectedUser.assignedCoachName || 'Unknown'}</p>
                </div>
              </div>
            )}

            {selectedUser && !hasCoach && (
              <div className="info-box" style={{ background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6' }}>
                <p style={{ margin: 0, color: '#3b82f6', fontSize: '0.9rem' }}>
                  ℹ️ This user has no assigned coach. Full amount will go to system wallet.
                </p>
              </div>
            )}

            {/* Commission Percentage */}
            {selectedUser && hasCoach && (
              <>
                <div className="form-group">
                  <label>
                    Coach Commission Percentage <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={formData.coachCommissionPercentage}
                    onChange={(e) => setFormData({ ...formData, coachCommissionPercentage: e.target.value })}
                    disabled={noCommission}
                    required
                  />
                  <small className="help-text">
                    Default is 30%. Enter a value between 0 and 100.
                  </small>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={noCommission}
                      onChange={handleNoCommissionToggle}
                    />
                    <span>Set No Commission (0%)</span>
                  </label>
                  <small className="help-text">
                    Check this to send the full amount to the system wallet
                  </small>
                </div>
              </>
            )}

            <div className="form-group">
              <label>
                Strategy <span className="required">*</span>
              </label>
              <select
                value={formData.strategyId}
                onChange={(e) => {
                  const strategyId = e.target.value;
                  const strategy = strategies.find(s => s.id === strategyId);
                  setFormData({ 
                    ...formData, 
                    strategyId,
                    amountPaid: strategy ? strategy.price.toString() : ''
                  });
                }}
                required
              >
                <option value="">-- Select Strategy --</option>
                {strategies.map((strategy) => (
                  <option key={strategy.id} value={strategy.id}>
                    Strategy #{strategy.number}: {strategy.name} (${strategy.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>
                Duration Type <span className="required">*</span>
              </label>
              <select
                value={formData.durationType}
                onChange={(e) => setFormData({ ...formData, durationType: e.target.value, duration: e.target.value === 'minutes' ? '5' : '30' })}
                required
              >
                <option value="days">Days (Production)</option>
                <option value="minutes">Minutes (Testing)</option>
              </select>
              <small className="help-text">
                Use minutes for quick testing, days for production
              </small>
            </div>

            <div className="form-group">
              <label>
                Duration ({formData.durationType === 'minutes' ? 'Minutes' : 'Days'}) <span className="required">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder={formData.durationType === 'minutes' ? '5' : '30'}
                required
              />
              <small className="help-text">
                {formData.durationType === 'minutes' 
                  ? '⚠️ Testing mode: Subscription will expire in minutes' 
                  : 'Default is 30 days'}
              </small>
            </div>

            {/* Payment fields - OUTSIDE info-box */}
            {selectedStrategy && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Editable Total Amount */}
                  <div className="form-group">
                    <label>
                      Total Amount ($) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                      placeholder={selectedStrategy.price.toFixed(2)}
                      required
                    />
                    <small className="help-text">
                      Default: ${selectedStrategy.price.toFixed(2)}
                    </small>
                  </div>
                </div>

                {/* Notes - Full width */}
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g., Paid via bank transfer, cash payment, PayPal, etc."
                    rows={2}
                    style={{ resize: 'vertical', minHeight: '60px' }}
                  />
                </div>

                {/* Info box with Duration/End Date/Split */}
                <div className="info-box">
                  <h4>💰 Payment Summary</h4>
                  
                  <p style={{ margin: '0 0 0.5rem 0' }}>
                    <strong>Duration:</strong> {formData.duration} {formData.durationType}
                    {formData.durationType === 'minutes' && (
                      <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                        (⚠️ Testing mode)
                      </span>
                    )}
                  </p>
                  
                  {endDate && (
                    <p style={{ 
                      background: 'rgba(74, 144, 226, 0.1)', 
                      padding: '0.75rem', 
                      borderRadius: '6px',
                      margin: '0 0 1rem 0',
                      borderLeft: '3px solid #4a90e2'
                    }}>
                      <strong>📅 Subscription Will End:</strong><br />
                      {formatDate(endDate)}
                    </p>
                  )}
                
                {/* Commission Split Display */}
                {hasCoach && selectedUser && formData.amountPaid && (
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
                          👨‍🏫 Coach ({formData.coachCommissionPercentage}%):
                        </span>
                        <strong style={{ color: '#059669', fontSize: '1.1rem' }}>
                          ${((parseFloat(formData.amountPaid) * parseFloat(formData.coachCommissionPercentage)) / 100).toFixed(2)}
                        </strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          🏢 System ({(100 - parseFloat(formData.coachCommissionPercentage)).toFixed(1)}%):
                        </span>
                        <strong style={{ color: '#3b82f6', fontSize: '1.1rem' }}>
                          ${(parseFloat(formData.amountPaid) - (parseFloat(formData.amountPaid) * parseFloat(formData.coachCommissionPercentage)) / 100).toFixed(2)}
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
                            ${parseFloat(formData.amountPaid).toFixed(2)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!hasCoach && selectedUser && formData.amountPaid && (
                  <p style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    margin: 0,
                    borderLeft: '3px solid #3b82f6',
                    color: '#3b82f6',
                    fontSize: '0.9rem'
                  }}>
                    💼 Full amount (${parseFloat(formData.amountPaid).toFixed(2)}) goes to system wallet
                  </p>
                )}
                </div>
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

