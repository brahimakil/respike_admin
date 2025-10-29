import { useState, useEffect } from 'react';
import api from '../../../services/api';
import '../styles/strategy-users-modal.css';

interface StrategyUser {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  coachId?: string;
  coachName?: string;
  coachEmail?: string;
  coachCommissionPercentage?: number;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: any;
  endDate: any;
  progressPercentage: number;
  completedVideos: number;
  totalVideos: number;
}

interface StrategyUsersModalProps {
  strategyId: string;
  strategyName: string;
  onClose: () => void;
}

export const StrategyUsersModal = ({ strategyId, strategyName, onClose }: StrategyUsersModalProps) => {
  const [users, setUsers] = useState<StrategyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'expired' | 'cancelled'>('all');

  useEffect(() => {
    fetchStrategyUsers();
  }, [strategyId]);

  const fetchStrategyUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/strategies/${strategyId}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching strategy users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    // Status filter
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    // Search filter
    const matchesSearch = 
      user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.coachName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string }> = {
      active: { label: '✓ Active', className: 'badge-active' },
      pending: { label: '⏳ Pending', className: 'badge-pending' },
      expired: { label: '✕ Expired', className: 'badge-expired' },
      cancelled: { label: '✕ Cancelled', className: 'badge-cancelled' },
    };
    return badges[status] || badges.expired;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content strategy-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👥 Users - {strategyName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Filters */}
          <div className="filters-section">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="🔍 Search by user name, email, or coach..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="status-filters">
              <button
                className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({users.length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                ✓ Active ({users.filter(u => u.status === 'active').length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                ⏳ Pending ({users.filter(u => u.status === 'pending').length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'expired' ? 'active' : ''}`}
                onClick={() => setStatusFilter('expired')}
              >
                ✕ Expired ({users.filter(u => u.status === 'expired').length})
              </button>
              <button
                className={`filter-btn ${statusFilter === 'cancelled' ? 'active' : ''}`}
                onClick={() => setStatusFilter('cancelled')}
              >
                ✕ Cancelled ({users.filter(u => u.status === 'cancelled').length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👤</div>
              <h3>No Users Found</h3>
              <p>{searchTerm ? 'Try adjusting your search' : 'No users subscribed to this strategy yet'}</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Coach</th>
                    <th>Commission</th>
                    <th>Progress</th>
                    <th>Status</th>
                    <th>Period</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="user-info">
                          <strong>{user.userName}</strong>
                          <small>{user.userEmail}</small>
                        </div>
                      </td>
                      <td>
                        {user.coachName ? (
                          <div className="coach-info">
                            <strong>{user.coachName}</strong>
                            <small>{user.coachEmail}</small>
                          </div>
                        ) : (
                          <span className="no-coach">No Coach</span>
                        )}
                      </td>
                      <td>
                        {user.coachCommissionPercentage !== undefined ? (
                          <span className="commission-badge">
                            {user.coachCommissionPercentage}%
                          </span>
                        ) : (
                          <span className="no-commission">—</span>
                        )}
                      </td>
                      <td>
                        <div className="progress-info">
                          <div className="progress-bar-small">
                            <div 
                              className="progress-fill-small" 
                              style={{ width: `${user.progressPercentage}%` }}
                            ></div>
                          </div>
                          <small>{user.completedVideos}/{user.totalVideos} ({user.progressPercentage}%)</small>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadge(user.status).className}`}>
                          {getStatusBadge(user.status).label}
                        </span>
                      </td>
                      <td>
                        <div className="date-info">
                          <small>{formatDate(user.startDate)} - {formatDate(user.endDate)}</small>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {!loading && filteredUsers.length > 0 && (
            <div className="users-summary">
              <div className="summary-stat">
                <strong>{filteredUsers.length}</strong>
                <span>{statusFilter === 'all' ? 'Total Users' : 'Filtered Users'}</span>
              </div>
              <div className="summary-stat">
                <strong>{filteredUsers.filter(u => u.status === 'active').length}</strong>
                <span>Active</span>
              </div>
              <div className="summary-stat">
                <strong>{filteredUsers.filter(u => u.status === 'pending').length}</strong>
                <span>Pending</span>
              </div>
              <div className="summary-stat">
                <strong>{filteredUsers.filter(u => u.coachName).length}</strong>
                <span>With Coach</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

