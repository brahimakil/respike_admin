import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import './AdminManagement.css';

interface Admin {
  uid: string;
  email: string;
  displayName: string | null;
  emailVerified: boolean;
  role: string;
  status: 'active' | 'disabled';
  createdAt: string;
  updatedAt: string;
  disabledAt?: string;
  disabledBy?: string;
  disabledReason?: string;
}

export const AdminManagement = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disableReason, setDisableReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const currentUser = useAuthStore((state) => state.user);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admins');
      setAdmins(response.data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      alert('Failed to fetch admins');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAdmin = (admin: Admin) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  const handleDisableClick = (admin: Admin) => {
    setSelectedAdmin(admin);
    setDisableReason('');
    setShowDisableModal(true);
  };

  const handleDisableAdmin = async () => {
    if (!selectedAdmin || !disableReason.trim()) {
      alert('Please provide a reason for disabling this admin');
      return;
    }

    if (selectedAdmin.uid === currentUser?.uid) {
      alert('You cannot disable your own account');
      return;
    }

    try {
      setActionLoading(true);
      await api.patch(`/admins/${selectedAdmin.uid}/disable`, {
        reason: disableReason,
      });
      alert('Admin disabled successfully');
      setShowDisableModal(false);
      setDisableReason('');
      setSelectedAdmin(null);
      fetchAdmins();
    } catch (error: any) {
      console.error('Error disabling admin:', error);
      alert(error.response?.data?.message || 'Failed to disable admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEnableAdmin = async (admin: Admin) => {
    if (!confirm('Are you sure you want to enable this admin?')) return;

    try {
      setActionLoading(true);
      await api.patch(`/admins/${admin.uid}/enable`);
      alert('Admin enabled successfully');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error enabling admin:', error);
      alert(error.response?.data?.message || 'Failed to enable admin');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAdmin = async (admin: Admin) => {
    if (admin.uid === currentUser?.uid) {
      alert('You cannot delete your own account');
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete admin "${admin.displayName || admin.email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`/admins/${admin.uid}`);
      alert('Admin deleted successfully');
      fetchAdmins();
    } catch (error: any) {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.message || 'Failed to delete admin');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and search
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredAdmins.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAdmins = filteredAdmins.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="admins-container">
          <div className="loading">Loading admins...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="admins-container">
        <div className="admins-header">
          <div>
            <h1>👨‍💼 Admin Management</h1>
            <p className="subtitle">Manage system administrators</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="admins-actions-bar">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <div className="admins-count">
            Total Admins: <strong>{admins.length}</strong>
          </div>
        </div>

        {/* Admins Table */}
        <div className="table-container">
          <table className="admins-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Last Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAdmins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-data">
                    No admins found
                  </td>
                </tr>
              ) : (
                paginatedAdmins.map((admin) => (
                  <tr key={admin.uid}>
                    <td>
                      <div className="admin-info">
                        <div className="admin-avatar">
                          {(admin.displayName || admin.email).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-name">
                            {admin.displayName || 'No Name'}
                            {admin.uid === currentUser?.uid && (
                              <span className="you-badge">You</span>
                            )}
                          </div>
                          <div className="admin-role">{admin.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>{admin.email}</td>
                    <td>
                      <span className={`status-badge status-${admin.status}`}>
                        {admin.status === 'active' ? '✓ Active' : '✗ Disabled'}
                      </span>
                    </td>
                    <td>{formatDate(admin.createdAt)}</td>
                    <td>{formatDate(admin.updatedAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-action view"
                          onClick={() => handleViewAdmin(admin)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {admin.uid !== currentUser?.uid && (
                          <>
                            {admin.status === 'active' ? (
                              <button
                                className="btn-action disable"
                                onClick={() => handleDisableClick(admin)}
                                disabled={actionLoading}
                                title="Disable Admin"
                              >
                                🚫
                              </button>
                            ) : (
                              <button
                                className="btn-action enable"
                                onClick={() => handleEnableAdmin(admin)}
                                disabled={actionLoading}
                                title="Enable Admin"
                              >
                                ✓
                              </button>
                            )}
                            <button
                              className="btn-action delete"
                              onClick={() => handleDeleteAdmin(admin)}
                              disabled={actionLoading}
                              title="Delete Admin"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages} ({filteredAdmins.length} admins)
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {/* View Admin Modal */}
        {showViewModal && selectedAdmin && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
            <div className="modal view-admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>👨‍💼 Admin Details</h2>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body">
                <div className="admin-details">
                  <div className="admin-avatar-large">
                    {(selectedAdmin.displayName || selectedAdmin.email).charAt(0).toUpperCase()}
                  </div>

                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Display Name</label>
                      <p>{selectedAdmin.displayName || 'Not set'}</p>
                    </div>

                    <div className="detail-item">
                      <label>Email</label>
                      <p>{selectedAdmin.email}</p>
                    </div>

                    <div className="detail-item">
                      <label>Role</label>
                      <p className="role-badge">{selectedAdmin.role}</p>
                    </div>

                    <div className="detail-item">
                      <label>Status</label>
                      <span className={`status-badge status-${selectedAdmin.status}`}>
                        {selectedAdmin.status === 'active' ? '✓ Active' : '✗ Disabled'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <label>User ID</label>
                      <p className="uid-text">{selectedAdmin.uid}</p>
                    </div>

                    <div className="detail-item">
                      <label>Created At</label>
                      <p>{formatDate(selectedAdmin.createdAt)}</p>
                    </div>

                    <div className="detail-item">
                      <label>Last Updated</label>
                      <p>{formatDate(selectedAdmin.updatedAt)}</p>
                    </div>

                    {selectedAdmin.status === 'disabled' && (
                      <>
                        <div className="detail-item full-width">
                          <label>Disabled At</label>
                          <p>{selectedAdmin.disabledAt ? formatDate(selectedAdmin.disabledAt) : 'N/A'}</p>
                        </div>

                        <div className="detail-item full-width">
                          <label>Disabled Reason</label>
                          <p className="reason-text">{selectedAdmin.disabledReason || 'No reason provided'}</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Disable Admin Modal */}
        {showDisableModal && selectedAdmin && (
          <div className="modal-overlay" onClick={() => setShowDisableModal(false)}>
            <div className="modal disable-admin-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>🚫 Disable Admin</h2>
                <button className="modal-close" onClick={() => setShowDisableModal(false)}>
                  ×
                </button>
              </div>
              <div className="modal-body disable-modal-body">
                <div className="disable-admin-info">
                  <div className="disable-admin-avatar">
                    {(selectedAdmin.displayName || selectedAdmin.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="disable-admin-name">{selectedAdmin.displayName || 'No Name'}</div>
                    <div className="disable-admin-email">{selectedAdmin.email}</div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="disable-label">
                    Reason for Disabling <span className="required">*</span>
                  </label>
                  <p className="disable-help-text">
                    Please provide a clear reason for disabling this administrator's access.
                  </p>
                  <textarea
                    className="disable-textarea"
                    value={disableReason}
                    onChange={(e) => setDisableReason(e.target.value)}
                    placeholder="e.g., Policy violation, security concerns, account no longer needed..."
                    rows={4}
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowDisableModal(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={handleDisableAdmin}
                    disabled={actionLoading || !disableReason.trim()}
                  >
                    {actionLoading ? 'Disabling...' : 'Disable Admin'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
