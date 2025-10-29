import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import api from '../services/api';
import './Users.css';

interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  phoneNumber?: string;
  photoURL?: string;
  status: 'active' | 'banned';
  assignedCoachId?: string;
  assignedCoachName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Coach {
  id: string;
  fullName: string;
  email: string;
  status: string;
}

export const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [coachFilter, setCoachFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
    fetchCoaches();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/coaches');
      // Only get approved coaches for assignment
      setCoaches(response.data.filter((c: Coach) => c.status === 'approved'));
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success';
      case 'banned':
        return 'badge-dark';
      default:
        return 'badge-secondary';
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    // Filter by status
    const matchesStatusFilter = filter === 'all' || user.status === filter;
    
    // Filter by coach assignment
    let matchesCoachFilter = true;
    if (coachFilter === 'with_coach') {
      matchesCoachFilter = !!user.assignedCoachId;
    } else if (coachFilter === 'without_coach') {
      matchesCoachFilter = !user.assignedCoachId;
    } else if (coachFilter !== 'all') {
      matchesCoachFilter = user.assignedCoachId === coachFilter;
    }
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phoneNumber?.includes(searchTerm) ||
      user.assignedCoachName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatusFilter && matchesCoachFilter && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, coachFilter, searchTerm]);

  return (
    <Layout>
      <div className="page-content">
        {/* Header Actions */}
        <div className="page-header">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search by name, email, phone, or coach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              + Add New User
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({users.length})
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({users.filter(u => u.status === 'active').length})
          </button>
          <button
            className={`filter-tab ${filter === 'banned' ? 'active' : ''}`}
            onClick={() => setFilter('banned')}
          >
            Banned ({users.filter(u => u.status === 'banned').length})
          </button>
        </div>

        {/* Coach Filter */}
        <div className="coach-filter-section">
          <label>Filter by Coach:</label>
          <select
            value={coachFilter}
            onChange={(e) => setCoachFilter(e.target.value)}
            className="coach-filter-select"
          >
            <option value="all">All Users</option>
            <option value="with_coach">With Coach ({users.filter(u => u.assignedCoachId).length})</option>
            <option value="without_coach">Without Coach ({users.filter(u => !u.assignedCoachId).length})</option>
            <optgroup label="By Specific Coach">
              {coaches.map(coach => (
                <option key={coach.id} value={coach.id}>
                  {coach.fullName} ({users.filter(u => u.assignedCoachId === coach.id).length} users)
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-state">Loading users...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Coach</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="empty-state">
                      No users found
                    </td>
                  </tr>
                ) : (
                  paginatedUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <img
                          src={user.photoURL || 'https://via.placeholder.com/50'}
                          alt={user.displayName}
                          className="user-avatar"
                        />
                      </td>
                      <td>{user.displayName || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>
                        {user.assignedCoachName ? (
                          <span className="coach-badge">{user.assignedCoachName}</span>
                        ) : (
                          <span className="no-coach-text">No coach assigned</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowViewModal(true);
                            }}
                            title="View Details"
                          >
                            👁️
                          </button>
                          
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowEditModal(true);
                            }}
                            title="Edit User"
                          >
                            ✏️
                          </button>
                          
                          {user.status === 'active' && (
                            <button
                              className="btn-icon danger"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowBanModal(true);
                              }}
                              title="Ban User"
                            >
                              🚫
                            </button>
                          )}
                          {user.status === 'banned' && (
                            <button
                              className="btn-icon success"
                              onClick={async () => {
                                if (!confirm(`Unban ${user.displayName}?`)) return;
                                try {
                                  await api.post(`/users/${user.id}/unban`);
                                  fetchUsers();
                                } catch (error) {
                                  console.error('Error unbanning user:', error);
                                  alert('Failed to unban user');
                                }
                              }}
                              title="Unban User"
                            >
                              ✅
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filteredUsers.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>

            <div className="pagination-controls">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="items-per-page"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>

              <div className="pagination-buttons">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  title="First page"
                >
                  ⟪
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  title="Previous page"
                >
                  ‹
                </button>

                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  title="Next page"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  title="Last page"
                >
                  ⟫
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            coaches={coaches}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}

        {/* Add User Modal */}
        {showAddModal && (
          <AddUserModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchUsers();
            }}
          />
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <ViewUserModal
            user={selectedUser}
            onClose={() => {
              setShowViewModal(false);
              setSelectedUser(null);
            }}
            onUpdate={fetchUsers}
          />
        )}

        {/* Ban User Modal */}
        {showBanModal && selectedUser && (
          <BanUserModal 
            user={selectedUser} 
            onClose={() => {
              setShowBanModal(false);
              setSelectedUser(null);
            }} 
            onSuccess={() => {
              setShowBanModal(false);
              setSelectedUser(null);
              fetchUsers();
            }} 
          />
        )}
      </div>
    </Layout>
  );
};

// Add User Modal Component
const AddUserModal = ({ 
  onClose, 
  onSuccess 
}: { 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    phoneNumber: '',
    coachId: '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/coaches');
      setCoaches(response.data.filter((c: Coach) => c.status === 'approved'));
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    // Validate phone number format if provided
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        setError('Phone number must be in E.164 format (e.g., +1234567890). It must start with + followed by country code and number.');
        return;
      }
    }

    setLoading(true);
    try {
      // First, upload photo if provided
      let photoURL = '';
      if (profilePhoto) {
        const photoFormData = new FormData();
        photoFormData.append('photo', profilePhoto);
        
        try {
          const uploadResponse = await api.post('/users/upload-photo', photoFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          photoURL = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          // Continue without photo
        }
      }

      // Create user with photo URL
      const userData: any = {
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        photoURL: photoURL || undefined,
      };

      // Only include coachId if it's not empty
      if (formData.coachId && formData.coachId !== '') {
        userData.coachId = formData.coachId;
      }

      await api.post('/users', userData);

      onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>👤 Add New User</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid var(--danger)', 
              borderRadius: 'var(--border-radius-sm)', 
              color: 'var(--danger)', 
              marginBottom: '1.5rem' 
            }}>
              {error}
            </div>
          )}

          {/* Profile Photo Upload */}
          <div className="form-group">
            <label>Profile Photo</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={photoPreview || 'https://via.placeholder.com/100'}
                  alt="Profile preview"
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--border-color)',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="profile-photo-input"
                />
                <label
                  htmlFor="profile-photo-input"
                  className="btn-secondary"
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                  📷 Choose Photo
                </label>
                {profilePhoto && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {profilePhoto.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="form-input"
              placeholder="user@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="form-input"
              placeholder="Minimum 6 characters"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="form-input"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="form-input"
              placeholder="+1234567890"
            />
            <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              Must be in E.164 format: + followed by country code and number (e.g., +1234567890)
            </small>
          </div>

          <div className="form-group">
            <label>Assign Coach (Optional)</label>
            <select
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
              className="coach-select"
            >
              <option value="">👤 No Coach - User trains independently</option>
              <optgroup label="Available Coaches">
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    🧑‍ {coach.fullName} • {coach.email}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Ban User Modal Component
const BanUserModal = ({
  user,
  onClose,
  onSuccess,
}: {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [banReason, setBanReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!banReason.trim()) {
      setError('Please provide a ban reason');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/users/${user.id}/ban`, { banReason: banReason.trim() });
      onSuccess();
    } catch (error: any) {
      console.error('Error banning user:', error);
      setError(error.response?.data?.message || 'Failed to ban user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ban-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🚫 Ban User</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="ban-modal-body">
            {error && (
              <div className="error-message" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <div className="ban-user-info">
              <img 
                src={user.photoURL || 'https://via.placeholder.com/60'} 
                alt={user.displayName}
                className="ban-user-avatar"
              />
              <div>
                <h3>{user.displayName}</h3>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="form-group">
              <label className="ban-label">
                Ban Reason *
              </label>
              <p className="ban-help-text">
                Explain why this user is being banned. This will be recorded in the system.
              </p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Example: Violated community guidelines by posting inappropriate content..."
                className="ban-textarea"
                rows={5}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-danger" disabled={loading}>
              {loading ? 'Banning...' : '🚫 Ban User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit User Modal Component
const EditUserModal = ({ 
  user, 
  coaches, 
  onClose, 
  onSuccess 
}: { 
  user: User; 
  coaches: Coach[]; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    displayName: user.displayName || '',
    phoneNumber: user.phoneNumber || '',
    coachId: user.assignedCoachId || '',
  });
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(user.photoURL || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number format if provided
    if (formData.phoneNumber && formData.phoneNumber.trim()) {
      const phoneRegex = /^\+[1-9]\d{1,14}$/;
      if (!phoneRegex.test(formData.phoneNumber.trim())) {
        setError('Phone number must be in E.164 format (e.g., +1234567890). It must start with + followed by country code and number.');
        return;
      }
    }

    setLoading(true);

    try {
      // Upload new photo if provided
      let photoURL = user.photoURL;
      if (profilePhoto) {
        const photoFormData = new FormData();
        photoFormData.append('photo', profilePhoto);
        
        try {
          const uploadResponse = await api.post('/users/upload-photo', photoFormData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          photoURL = uploadResponse.data.url;
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
        }
      }

      // Update user details (Note: Backend endpoint needs to be created)
      await api.put(`/users/${user.id}`, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        photoURL,
      });

      // Update coach assignment if changed
      if (formData.coachId !== user.assignedCoachId) {
        await api.post(`/users/${user.id}/assign-coach`, {
          coachId: formData.coachId || null,
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit User - {user.displayName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ padding: '2rem' }}>
          {error && (
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid var(--danger)', 
              borderRadius: 'var(--border-radius-sm)', 
              color: 'var(--danger)', 
              marginBottom: '1.5rem' 
            }}>
              {error}
            </div>
          )}

          {/* Profile Photo */}
          <div className="form-group">
            <label>Profile Photo</label>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <img
                src={photoPreview || 'https://via.placeholder.com/100'}
                alt="Profile preview"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--border-color)',
                }}
              />
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                  id="edit-profile-photo-input"
                />
                <label
                  htmlFor="edit-profile-photo-input"
                  className="btn-secondary"
                  style={{ cursor: 'pointer', display: 'inline-block' }}
                >
                  📷 Change Photo
                </label>
                {profilePhoto && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {profilePhoto.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={user.email}
              className="form-input"
              disabled
              style={{ background: 'var(--bg-tertiary)', cursor: 'not-allowed' }}
            />
            <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Email cannot be changed</small>
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="form-input"
              placeholder="John Doe"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="form-input"
              placeholder="+1234567890"
            />
            <small style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.25rem', display: 'block' }}>
              Must be in E.164 format: + followed by country code and number (e.g., +1234567890)
            </small>
          </div>

          <div className="form-group">
            <label>Assigned Coach</label>
            <select
              value={formData.coachId}
              onChange={(e) => setFormData({ ...formData, coachId: e.target.value })}
              className="coach-select"
            >
              <option value="">👤 No Coach - User trains independently</option>
              <optgroup label="Available Coaches">
                {coaches.map(coach => (
                  <option key={coach.id} value={coach.id}>
                    🧑‍ {coach.fullName} • {coach.email}
                  </option>
                ))}
              </optgroup>
            </select>
            {user.assignedCoachName && (
              <small style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Current: {user.assignedCoachName}
              </small>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View User Modal Component
const ViewUserModal = ({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User; 
  onClose: () => void; 
  onUpdate: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  const handleBan = async () => {
    if (!confirm('Are you sure you want to BAN this user?')) return;
    
    setLoading(true);
    try {
      await api.post(`/users/${user.id}/ban`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnban = async () => {
    if (!confirm('Are you sure you want to UNBAN this user?')) return;
    
    setLoading(true);
    try {
      await api.post(`/users/${user.id}/unban`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>User Details</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="user-details">
          <div className="profile-section">
            <img
              src={user.photoURL || 'https://via.placeholder.com/150'}
              alt={user.displayName}
              className="profile-photo"
            />
            <h3>{user.displayName}</h3>
            <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-dark'}`}>
              {user.status}
            </span>
          </div>

          <div className="info-section">
            <h3>Contact Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Phone:</label>
                <span>{user.phoneNumber || 'Not provided'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Coach Assignment</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Assigned Coach:</label>
                <span>{user.assignedCoachName || 'No coach assigned'}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Account Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>User ID:</label>
                <span>{user.uid}</span>
              </div>
              <div className="info-item">
                <label>Joined:</label>
                <span>{new Date(user.createdAt).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <label>Last Updated:</label>
                <span>{new Date(user.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            
            {user.status === 'active' && (
              <button 
                className="btn-danger" 
                onClick={handleBan}
                disabled={loading}
              >
                🚫 Ban User
              </button>
            )}

            {user.status === 'banned' && (
              <button 
                className="btn-success" 
                onClick={handleUnban}
                disabled={loading}
              >
                ✓ Unban User
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
