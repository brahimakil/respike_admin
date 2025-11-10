import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../services/api';
import type { Subscription } from './types'; 
import { AddSubscriptionModal } from './components/AddSubscriptionModal';
import { ViewSubscriptionModal } from './components/ViewSubscriptionModal';
import { RenewSubscriptionModal } from './components/RenewSubscriptionModal';
import './styles/subscriptions.css';

export const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
    
    // Check for expired subscriptions every minute
    const interval = setInterval(() => {
      checkExpiredSubscriptions();
    }, 60000); // Check every 60 seconds

    return () => clearInterval(interval);
  }, []);

  const checkExpiredSubscriptions = async () => {
    try {
      await api.post('/subscriptions/check-expired');
      // Refresh subscriptions after checking
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error checking expired subscriptions:', error);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // Check for expired subscriptions first
      await api.post('/subscriptions/check-expired');
      const response = await api.get('/subscriptions');
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowViewModal(true);
  };

  const handleRenew = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setShowRenewModal(true);
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this subscription?')) return;

    try {
      await api.patch(`/subscriptions/${id}/cancel`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      alert('Failed to cancel subscription');
    }
  };

  const handleSetPending = async (id: string) => {
    if (!confirm('Set this subscription to pending? The user will need to renew to continue. Watch history will be preserved.')) return;

    try {
      await api.patch(`/subscriptions/${id}/set-pending`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error setting subscription to pending:', error);
      alert('Failed to set subscription to pending');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subscription? This action cannot be undone.')) return;

    try {
      await api.delete(`/subscriptions/${id}`);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Failed to delete subscription');
    }
  };

  // Filter subscriptions
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch =
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.strategyName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscriptions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSubscriptions = filteredSubscriptions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active': return 'status-badge-active';
      case 'pending': return 'status-badge-pending';
      case 'expired': return 'status-badge-expired';
      case 'cancelled': return 'status-badge-cancelled';
      default: return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return '✓ Active';
      case 'pending': return '⏱️ Pending';
      case 'expired': return '✗ Expired';
      case 'cancelled': return '🚫 Cancelled';
      default: return status;
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRemainingDays = (endDate: Date | string) => {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  // Status counts
  const statusCounts = {
    all: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'active').length,
    pending: subscriptions.filter((s) => s.status === 'pending').length,
    expired: subscriptions.filter((s) => s.status === 'expired').length,
    cancelled: subscriptions.filter((s) => s.status === 'cancelled').length,
  };

  if (loading) {
    return (
      <Layout>
        <div className="subscriptions-container">
          <p>Loading subscriptions...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="subscriptions-container">
        <div className="subscriptions-header">
          <h1>📋 User Subscriptions</h1>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add Subscription
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Filters */}
        <div className="subscriptions-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="🔍 Search by user name, email, or strategy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="status-tabs">
            <button
              className={`status-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All ({statusCounts.all})
            </button>
            <button
              className={`status-tab ${statusFilter === 'active' ? 'active' : ''}`}
              onClick={() => setStatusFilter('active')}
            >
              ✓ Active ({statusCounts.active})
            </button>
            <button
              className={`status-tab ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              ⏱️ Pending ({statusCounts.pending})
            </button>
            <button
              className={`status-tab ${statusFilter === 'expired' ? 'active' : ''}`}
              onClick={() => setStatusFilter('expired')}
            >
              ✗ Expired ({statusCounts.expired})
            </button>
            <button
              className={`status-tab ${statusFilter === 'cancelled' ? 'active' : ''}`}
              onClick={() => setStatusFilter('cancelled')}
            >
              🚫 Cancelled ({statusCounts.cancelled})
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="subscriptions-table-container">
          {filteredSubscriptions.length === 0 ? (
            <div className="no-subscriptions">
              <p>No subscriptions found</p>
            </div>
          ) : (
            <>
              <table className="subscriptions-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Strategy</th>
                    <th>Status</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Remaining</th>
                    <th>Progress</th>
                    <th>Payment Method</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubscriptions.map((subscription) => {
                    const remainingDays = getRemainingDays(subscription.endDate);
                    const completedCount = Array.isArray(subscription.completedVideos) 
                      ? subscription.completedVideos.length 
                      : subscription.completedVideos;
                    const progressPercentage = subscription.totalVideos > 0 
                      ? Math.round((completedCount / subscription.totalVideos) * 100)
                      : 0;

                    return (
                      <tr key={subscription.id}>
                        <td>
                          <div className="user-cell">
                            <strong>{subscription.userName}</strong>
                            <small>{subscription.userEmail}</small>
                          </div>
                        </td>
                        <td>
                          <div className="strategy-cell">
                            <strong>{subscription.strategyName}</strong>
                            <small>Strategy #{subscription.strategyNumber}</small>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${getStatusClass(subscription.status)}`}>
                            {getStatusText(subscription.status)}
                          </span>
                        </td>
                        <td>{formatDate(subscription.startDate)}</td>
                        <td>{formatDate(subscription.endDate)}</td>
                        <td>
                          <span className={remainingDays < 0 ? 'text-danger' : remainingDays < 7 ? 'text-warning' : 'text-success'}>
                            {remainingDays < 0 ? 'Expired' : `${remainingDays} days`}
                          </span>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill" 
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <small>{completedCount}/{subscription.totalVideos} videos ({progressPercentage}%)</small>
                          </div>
                        </td>
                        <td>
                          <span className={`payment-method-badge ${subscription.paymentMethod === 'manual' ? 'badge-manual' : 'badge-automatic'}`}>
                            {subscription.paymentMethod === 'manual' ? '📝 Manual' : subscription.paymentMethod === 'automatic' ? '⚡ Automatic' : '—'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn-sm btn-view" 
                              onClick={() => handleView(subscription)}
                              title="View Details"
                            >
                              👁️
                            </button>
                            {(subscription.status === 'pending' || subscription.status === 'expired') && (
                              <button 
                                className="btn-sm btn-renew" 
                                onClick={() => handleRenew(subscription)}
                                title="Renew"
                              >
                                🔄
                              </button>
                            )}
                            {subscription.status === 'active' && (
                              <button 
                                className="btn-sm btn-pending" 
                                onClick={() => handleSetPending(subscription.id)}
                                title="Set Pending"
                              >
                                ⏱️
                              </button>
                            )}
                            {(subscription.status === 'active' || subscription.status === 'pending') && (
                              <button 
                                className="btn-sm btn-cancel" 
                                onClick={() => handleCancel(subscription.id)}
                                title="Cancel"
                              >
                                🚫
                              </button>
                            )}
                            <button 
                              className="btn-sm btn-delete" 
                              onClick={() => handleDelete(subscription.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages} ({filteredSubscriptions.length} total)
                  </div>
                  
                  <button 
                    className="pagination-btn" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modals */}
        {showAddModal && (
          <AddSubscriptionModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchSubscriptions();
            }}
          />
        )}

        {showViewModal && selectedSubscription && (
          <ViewSubscriptionModal
            subscription={selectedSubscription}
            onClose={() => setShowViewModal(false)}
          />
        )}

        {showRenewModal && selectedSubscription && (
          <RenewSubscriptionModal
            subscription={selectedSubscription}
            onClose={() => setShowRenewModal(false)}
            onSuccess={() => {
              setShowRenewModal(false);
              fetchSubscriptions();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

