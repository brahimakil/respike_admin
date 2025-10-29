import { useEffect, useState } from 'react';
import { Layout } from '../../components/Layout';
import api from '../../services/api';
import type { Subscription } from './types'; 
import { SubscriptionCard } from './components/SubscriptionCard';
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

        {/* Subscriptions Grid */}
        <div className="subscriptions-grid">
          {filteredSubscriptions.length === 0 ? (
            <div className="no-subscriptions">
              <p>No subscriptions found</p>
            </div>
          ) : (
            filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                subscription={subscription}
                onView={handleView}
                onRenew={handleRenew}
                onCancel={handleCancel}
                onSetPending={handleSetPending}
                onDelete={handleDelete}
              />
            ))
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

