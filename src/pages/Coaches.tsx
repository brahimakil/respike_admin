import { Layout } from '../components/Layout';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  MdSearch, 
  MdPersonAdd, 
  MdVisibility, 
  MdEdit, 
  MdBlock, 
  MdCheckCircle, 
  MdRefresh, 
  MdEmail, 
  MdPhone, 
  MdPerson, 
  MdCake, 
  MdLocationOn, 
  MdHome, 
  MdBadge, 
  MdAccessTime, 
  MdDescription, 
  MdBusiness,
  MdDelete,
  MdWarning,
  MdCancel,
  MdPeople
} from 'react-icons/md';
import './Coaches.css';

interface Coach {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  city: string;
  country: string;
  status: 'pending' | 'approved' | 'rejected' | 'banned' | 'completely_rejected';
  submittedAt: string;
  profilePhotoUrl: string;
  idFrontPhotoUrl: string;
  idBackPhotoUrl: string;
  dateOfBirth: string;
  postalCode: string;
  address: string;
  idType: string;
  yearsOfExperience: string;
  description: string;
  defaultCommissionPercentage?: number;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export const Coaches = () => {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [userFilter, setUserFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      setLoading(true);
      const response = await api.get('/coaches');
      setCoaches(response.data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-success';
      case 'pending':
        return 'badge-warning';
      case 'rejected':
        return 'badge-danger';
      case 'completely_rejected':
        return 'badge-dark';
      case 'banned':
        return 'badge-dark';
      default:
        return 'badge-secondary';
    }
  };

  // Filter coaches based on status, user assignment, and search
  const filteredCoaches = coaches.filter(coach => {
    // Filter by status
    const matchesFilter = filter === 'all' || coach.status === filter;
    
    // Filter by user assignment
    let matchesUserFilter = true;
    if (userFilter === 'with_users') {
      matchesUserFilter = (coach as any).userCount > 0;
    } else if (userFilter === 'without_users') {
      matchesUserFilter = !(coach as any).userCount || (coach as any).userCount === 0;
    }
    
    // Filter by search term
    const matchesSearch = searchTerm === '' || 
      coach.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.phoneNumber.includes(searchTerm) ||
      coach.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesUserFilter && matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredCoaches.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCoaches = filteredCoaches.slice(startIndex, endIndex);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, userFilter, searchTerm]);

  return (
    <Layout>
      <div className="page-content">
        {/* Header Actions */}
        <div className="page-header">
          <div className="search-bar">
            <MdSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.25rem' }} />
            <input
              type="text"
              placeholder="Search coaches by name, email, phone, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>
          <div className="header-actions">
            <button
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              <MdPersonAdd style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Add New Coach
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs" style={{ marginBottom: '1rem' }}>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({coaches.length})
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({coaches.filter(c => c.status === 'pending').length})
          </button>
          <button
            className={`filter-tab ${filter === 'approved' ? 'active' : ''}`}
            onClick={() => setFilter('approved')}
          >
            Approved ({coaches.filter(c => c.status === 'approved').length})
          </button>
          <button
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Needs Changes ({coaches.filter(c => c.status === 'rejected').length})
          </button>
          <button
            className={`filter-tab ${filter === 'completely_rejected' ? 'active' : ''}`}
            onClick={() => setFilter('completely_rejected')}
          >
            Completely Rejected ({coaches.filter(c => c.status === 'completely_rejected').length})
          </button>
          <button
            className={`filter-tab ${filter === 'banned' ? 'active' : ''}`}
            onClick={() => setFilter('banned')}
          >
            Banned ({coaches.filter(c => c.status === 'banned').length})
          </button>
        </div>

        {/* User Assignment Filter */}
        <div className="coach-filter-section">
          <label>Filter by Users:</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="coach-filter-select"
          >
            <option value="all">All Coaches</option>
            <option value="with_users">With Assigned Users</option>
            <option value="without_users">Without Assigned Users</option>
          </select>
        </div>

        {/* Coaches Table */}
        {loading ? (
          <div className="loading-state">Loading coaches...</div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Location</th>
                  <th>Users</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCoaches.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="empty-state">
                      No coaches found
                    </td>
                  </tr>
                ) : (
                  paginatedCoaches.map((coach) => (
                    <tr key={coach.id}>
                      <td>
                        <img
                          src={coach.profilePhotoUrl}
                          alt={coach.fullName}
                          className="coach-avatar"
                        />
                      </td>
                      <td>{coach.fullName}</td>
                      <td>{coach.email}</td>
                      <td>{coach.phoneNumber}</td>
                      <td>{coach.city}, {coach.country}</td>
                      <td>
                        <button
                          className="user-count-badge clickable"
                          onClick={() => {
                            setSelectedCoach(coach);
                            setShowUsersModal(true);
                          }}
                          title="Click to view users"
                        >
                          {(coach as any).userCount || 0} <MdPeople style={{ verticalAlign: 'middle', marginLeft: '0.25rem' }} />
                        </button>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(coach.status)}`}>
                          {coach.status}
                        </span>
                      </td>
                      <td>{new Date(coach.submittedAt).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedCoach(coach);
                              setShowViewModal(true);
                            }}
                            title="View Details"
                          >
                            <MdVisibility />
                          </button>
                          
                          {/* Show Edit button for all statuses except completely_rejected */}
                          {coach.status !== 'completely_rejected' && (
                            <button
                              className="btn-icon"
                              onClick={() => {
                                setSelectedCoach(coach);
                                setShowEditModal(true);
                              }}
                              title="Edit Coach"
                            >
                              <MdEdit />
                            </button>
                          )}

                          {/* Recover button for completely_rejected */}
                          {coach.status === 'completely_rejected' && (
                            <button
                              className="btn-icon"
                              onClick={async () => {
                                if (!confirm(`Move ${coach.fullName} to "Needs Changes" for review?`)) return;
                                try {
                                  await api.post(`/coaches/${coach.id}/review`, {
                                    status: 'rejected',
                                    rejectionReason: coach.rejectionReason || 'Recovered from complete rejection for review.',
                                  });
                                  fetchCoaches();
                                } catch (error) {
                                  console.error('Error recovering coach:', error);
                                  alert('Failed to recover coach');
                                }
                              }}
                              title="Recover to Needs Changes"
                            >
                              <MdRefresh />
                            </button>
                          )}
                          
                          {coach.status === 'approved' && (
                            <button
                              className="btn-icon danger"
                              onClick={() => {
                                setSelectedCoach(coach);
                                setShowBanModal(true);
                              }}
                              title="Ban Coach"
                            >
                              <MdBlock />
                            </button>
                          )}
                          {coach.status === 'banned' && (
                            <button
                              className="btn-icon success"
                              onClick={async () => {
                                if (!confirm(`Unban ${coach.fullName}?`)) return;
                                try {
                                  await api.post(`/coaches/${coach.id}/unban`);
                                  fetchCoaches();
                                } catch (error) {
                                  console.error('Error unbanning coach:', error);
                                  alert('Failed to unban coach');
                                }
                              }}
                              title="Unban Coach"
                            >
                              <MdCheckCircle />
                            </button>
                          )}
                          
                          {/* Delete button */}
                          <button
                            className="btn-icon danger"
                            onClick={() => {
                              setSelectedCoach(coach);
                              setShowDeleteModal(true);
                            }}
                            title="Delete Coach"
                          >
                            <MdDelete />
                          </button>
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
        {!loading && filteredCoaches.length > 0 && (
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredCoaches.length)} of {filteredCoaches.length} coaches
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
                <option value={5}>5 per page</option>
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

                {/* Page numbers */}
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

        {/* Add Coach Modal */}
        {showAddModal && (
          <AddCoachModal
            onClose={() => setShowAddModal(false)}
            onSuccess={() => {
              setShowAddModal(false);
              fetchCoaches();
            }}
          />
        )}

        {/* View Coach Modal */}
        {showViewModal && selectedCoach && (
          <ViewCoachModal
            coach={selectedCoach}
            onClose={() => {
              setShowViewModal(false);
              setSelectedCoach(null);
            }}
            onUpdate={fetchCoaches}
          />
        )}

        {/* Edit Coach Modal */}
        {showEditModal && selectedCoach && (
          <EditCoachModal
            coach={selectedCoach}
            onClose={() => {
              setShowEditModal(false);
              setSelectedCoach(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedCoach(null);
              fetchCoaches();
            }}
          />
        )}

        {/* Users Modal */}
        {showUsersModal && selectedCoach && (
          <CoachUsersModal
            coach={selectedCoach}
            onClose={() => {
              setShowUsersModal(false);
              setSelectedCoach(null);
            }}
            onSuccess={() => {
              fetchCoaches();
            }}
          />
        )}

        {/* Ban Coach Modal */}
        {showBanModal && selectedCoach && (
          <BanCoachModal 
            coach={selectedCoach} 
            onClose={() => {
              setShowBanModal(false);
              setSelectedCoach(null);
            }} 
            onSuccess={() => {
              setShowBanModal(false);
              setSelectedCoach(null);
              fetchCoaches();
            }} 
          />
        )}

        {/* Delete Coach Modal */}
        {showDeleteModal && selectedCoach && (
          <DeleteCoachModal
            coach={selectedCoach}
            onClose={() => {
              setShowDeleteModal(false);
              setSelectedCoach(null);
            }}
            onSuccess={() => {
              setShowDeleteModal(false);
              setSelectedCoach(null);
              fetchCoaches();
            }}
          />
        )}
      </div>
    </Layout>
  );
};

// Add Coach Modal Component
const AddCoachModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    fullName: '',
    dateOfBirth: '',
    postalCode: '',
    city: '',
    country: '',
    address: '',
    idType: 'passport',
    yearsOfExperience: '',
    description: '',
  });
  const [files, setFiles] = useState<{
    profilePhoto: File | null;
    passportPhoto: File | null;
    nationalIdFront: File | null;
    nationalIdBack: File | null;
  }>({
    profilePhoto: null,
    passportPhoto: null,
    nationalIdFront: null,
    nationalIdBack: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate profile photo
    if (!files.profilePhoto) {
      setError('Please upload a profile photo');
      return;
    }

    // Validate ID documents based on type
    if (formData.idType === 'passport') {
      if (!files.passportPhoto) {
        setError('Please upload passport photo');
        return;
      }
    } else {
      if (!files.nationalIdFront || !files.nationalIdBack) {
        setError('Please upload both front and back of National ID');
        return;
      }
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append form fields
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append profile photo
      formDataToSend.append('profilePhoto', files.profilePhoto);
      
      // Append ID photos based on type
      if (formData.idType === 'passport') {
        formDataToSend.append('idFrontPhoto', files.passportPhoto!);
        // Send same photo for back (backend expects both)
        formDataToSend.append('idBackPhoto', files.passportPhoto!);
      } else {
        formDataToSend.append('idFrontPhoto', files.nationalIdFront!);
        formDataToSend.append('idBackPhoto', files.nationalIdBack!);
      }

      await api.post('/coaches', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Coach</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="coach-form">
          {/* Personal Information Section */}
          <div className="form-section-card">
            <h3 className="section-title"><MdPerson style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="coach@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="+1 234 567 8900"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information Section */}
          <div className="form-section-card">
            <h3 className="section-title">📍 Address Information</h3>
            
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street, Apt 4B"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="New York"
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder="10001"
                  required
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="United States"
                  required
                />
              </div>
            </div>
          </div>

          {/* Experience Section */}
          <div className="form-section-card">
            <h3 className="section-title"><MdBusiness style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Professional Experience</h3>
            
            <div className="form-group">
              <label>Years of Experience *</label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                placeholder="5"
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Professional Background & Skills *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your coaching experience, specializations, certifications, and skills..."
                rows={5}
                required
              />
            </div>
          </div>

          {/* Profile Photo Upload */}
          <div className="form-section-card">
            <h3 className="section-title">📸 Profile Photo</h3>
            
            <div className="upload-area">
              <input
                type="file"
                id="profilePhoto"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, profilePhoto: e.target.files?.[0] || null })}
                className="file-input"
                required
              />
              <label htmlFor="profilePhoto" className="upload-label">
                <div className="upload-icon">📷</div>
                <div className="upload-text">
                  <strong>Click to upload profile photo</strong>
                  <span>PNG, JPG up to 10MB</span>
                </div>
                {files.profilePhoto && (
                  <div className="file-name">✓ {files.profilePhoto.name}</div>
                )}
              </label>
            </div>
          </div>

          {/* ID Document Section */}
          <div className="form-section-card">
            <h3 className="section-title"><MdBadge style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Identity Verification</h3>
            
            <div className="form-group">
              <label>Document Type *</label>
              <div className="id-type-selector">
                <button
                  type="button"
                  className={`id-type-btn ${formData.idType === 'passport' ? 'active' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, idType: 'passport' });
                    setFiles({ ...files, nationalIdFront: null, nationalIdBack: null });
                  }}
                >
                  🛂 Passport
                </button>
                <button
                  type="button"
                  className={`id-type-btn ${formData.idType === 'national_id' ? 'active' : ''}`}
                  onClick={() => {
                    setFormData({ ...formData, idType: 'national_id' });
                    setFiles({ ...files, passportPhoto: null });
                  }}
                >
                  🪪 National ID
                </button>
              </div>
            </div>

            {/* Passport Upload */}
            {formData.idType === 'passport' && (
              <div className="upload-area">
                <input
                  type="file"
                  id="passportPhoto"
                  accept="image/*"
                  onChange={(e) => setFiles({ ...files, passportPhoto: e.target.files?.[0] || null })}
                  className="file-input"
                  required
                />
                <label htmlFor="passportPhoto" className="upload-label">
                  <div className="upload-icon">🛂</div>
                  <div className="upload-text">
                    <strong>Upload Passport Photo</strong>
                    <span>Clear photo of passport info page</span>
                  </div>
                  {files.passportPhoto && (
                    <div className="file-name">✓ {files.passportPhoto.name}</div>
                  )}
                </label>
              </div>
            )}

            {/* National ID Upload */}
            {formData.idType === 'national_id' && (
              <div className="id-uploads-grid">
                <div className="upload-area">
                  <input
                    type="file"
                    id="nationalIdFront"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, nationalIdFront: e.target.files?.[0] || null })}
                    className="file-input"
                    required
                  />
                  <label htmlFor="nationalIdFront" className="upload-label">
                    <div className="upload-icon">🪪</div>
                    <div className="upload-text">
                      <strong>ID Front Side</strong>
                      <span>Clear photo of front</span>
                    </div>
                    {files.nationalIdFront && (
                      <div className="file-name">✓ {files.nationalIdFront.name}</div>
                    )}
                  </label>
                </div>

                <div className="upload-area">
                  <input
                    type="file"
                    id="nationalIdBack"
                    accept="image/*"
                    onChange={(e) => setFiles({ ...files, nationalIdBack: e.target.files?.[0] || null })}
                    className="file-input"
                    required
                  />
                  <label htmlFor="nationalIdBack" className="upload-label">
                    <div className="upload-icon">🪪</div>
                    <div className="upload-text">
                      <strong>ID Back Side</strong>
                      <span>Clear photo of back</span>
                    </div>
                    {files.nationalIdBack && (
                      <div className="file-name">✓ {files.nationalIdBack.name}</div>
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Adding...' : 'Add Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Coach Modal Component
const ViewCoachModal = ({ 
  coach, 
  onClose, 
  onUpdate 
}: { 
  coach: Coach; 
  onClose: () => void; 
  onUpdate: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectedFields, setRejectedFields] = useState<string[]>([]);

  const handleApprove = async () => {
    if (!confirm('Are you sure you want to approve this coach?')) return;
    
    setLoading(true);
    try {
      await api.post(`/coaches/${coach.id}/review`, {
        status: 'approved',
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error approving coach:', error);
      alert('Failed to approve coach');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (type: 'changes_required' | 'completely_rejected') => {
    if (type === 'changes_required' && rejectedFields.length === 0) {
      alert('Please select at least one field with issues');
      return;
    }
    
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    const confirmMessage = type === 'completely_rejected' 
      ? '⚠️ Are you sure you want to COMPLETELY REJECT this coach? This is final and they cannot resubmit.'
      : 'Send rejection feedback to coach for corrections?';

    if (!confirm(confirmMessage)) return;

    setLoading(true);
    try {
      let fullRejectionMessage = rejectionReason;
      
      if (type === 'changes_required' && rejectedFields.length > 0) {
        fullRejectionMessage = `**Fields with issues:** ${rejectedFields.join(', ')}\n\n**Details:**\n${rejectionReason}`;
      }
      
      const status = type === 'completely_rejected' ? 'completely_rejected' : 'rejected';
      
      await api.post(`/coaches/${coach.id}/review`, {
        status,
        rejectionReason: fullRejectionMessage,
        rejectedFields: type === 'changes_required' ? rejectedFields : undefined,
      });
      
      setShowRejectModal(false);
      setRejectedFields([]);
      setRejectionReason('');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error rejecting coach:', error);
      alert('Failed to reject coach');
    } finally {
      setLoading(false);
    }
  };

  const toggleRejectedField = (field: string) => {
    setRejectedFields(prev => 
      prev.includes(field) 
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleBan = () => {
    setShowBanModal(true);
  };

  const handleBanSuccess = () => {
    setShowBanModal(false);
    onUpdate();
    onClose();
  };

  const handleUnban = async () => {
    if (!confirm('Are you sure you want to UNBAN this coach?')) return;
    
    setLoading(true);
    try {
      await api.post(`/coaches/${coach.id}/unban`);
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error unbanning coach:', error);
      alert('Failed to unban coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content xlarge" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Coach Details</h2>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          <div className="coach-details">
            {/* Status Badge */}
            <div className="status-section">
              <span className={`badge large ${
                coach.status === 'approved' ? 'badge-success' :
                coach.status === 'pending' ? 'badge-warning' :
                coach.status === 'rejected' ? 'badge-danger' :
                'badge-dark'
              }`}>
                {coach.status.toUpperCase()}
              </span>
            </div>

            {/* Profile Photo */}
            <div className="photo-section">
              <h3>Profile Photo</h3>
              <img src={coach.profilePhotoUrl} alt="Profile" className="detail-photo large" />
            </div>

            {/* Personal Information */}
            <div className="info-section">
              <h3>Personal Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name:</label>
                  <span>{coach.fullName}</span>
                </div>
                <div className="info-item">
                  <label>Email:</label>
                  <span>{coach.email}</span>
                </div>
                <div className="info-item">
                  <label>Phone Number:</label>
                  <span>{coach.phoneNumber}</span>
                </div>
                <div className="info-item">
                  <label>Date of Birth:</label>
                  <span>{new Date(coach.dateOfBirth).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="info-section">
              <h3>Address Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Address:</label>
                  <span>{coach.address}</span>
                </div>
                <div className="info-item">
                  <label>City:</label>
                  <span>{coach.city}</span>
                </div>
                <div className="info-item">
                  <label>Postal Code:</label>
                  <span>{coach.postalCode}</span>
                </div>
                <div className="info-item">
                  <label>Country:</label>
                  <span>{coach.country}</span>
                </div>
              </div>
            </div>

            {/* Professional Experience */}
            <div className="info-section">
              <h3>Professional Experience</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Years of Experience:</label>
                  <span>{coach.yearsOfExperience} years</span>
                </div>
                <div className="info-item full-width">
                  <label>Professional Background & Skills:</label>
                  <div className="description-box">{coach.description}</div>
                </div>
              </div>
            </div>

            {/* ID Document Information */}
            <div className="info-section">
              <h3>ID Document Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Document Type:</label>
                  <span>{coach.idType === 'passport' ? 'Passport' : 'National ID'}</span>
                </div>
              </div>
            </div>

            {/* ID Photos */}
            <div className="photo-section">
              <h3>ID Document Photos</h3>
              {coach.idType === 'passport' ? (
                <div className="single-photo-container">
                  <h4>Passport</h4>
                  <img src={coach.idFrontPhotoUrl} alt="Passport" className="detail-photo" />
                </div>
              ) : (
                <div className="photo-grid">
                  <div>
                    <h4>ID Front</h4>
                    <img src={coach.idFrontPhotoUrl} alt="ID Front" className="detail-photo" />
                  </div>
                  <div>
                    <h4>ID Back</h4>
                    <img src={coach.idBackPhotoUrl} alt="ID Back" className="detail-photo" />
                  </div>
                </div>
              )}
            </div>

            {/* Submission Info */}
            <div className="info-section">
              <h3>Submission Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <label>Submitted At:</label>
                  <span>{new Date(coach.submittedAt).toLocaleString()}</span>
                </div>
                {coach.reviewedAt && (
                  <div className="info-item">
                    <label>Reviewed At:</label>
                    <span>{new Date(coach.reviewedAt).toLocaleString()}</span>
                  </div>
                )}
                {coach.rejectionReason && (
                  <div className="info-item full-width">
                    <label>Rejection Reason:</label>
                    <span className="rejection-reason">{coach.rejectionReason}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-footer">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            
            {coach.status === 'pending' && (
              <>
                <button 
                  className="btn-success" 
                  onClick={handleApprove}
                  disabled={loading}
                >
                  ✓ Approve
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => setShowRejectModal(true)}
                  disabled={loading}
                >
                  ✗ Reject
                </button>
              </>
            )}

            {coach.status === 'rejected' && (
              <>
                <button 
                  className="btn-primary" 
                  onClick={async () => {
                    if (!confirm('Mark this application as pending for re-review?')) return;
                    
                    setLoading(true);
                    try {
                      await api.post(`/coaches/${coach.id}/review`, {
                        status: 'pending',
                      });
                      onUpdate();
                      onClose();
                    } catch (error) {
                      console.error('Error resubmitting coach:', error);
                      alert('Failed to resubmit for review');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <MdRefresh style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Move to Pending for Review
                </button>
                <button 
                  className="btn-danger" 
                  onClick={async () => {
                    if (!confirm('⚠️ COMPLETELY REJECT this coach? This is final and cannot be undone.')) return;
                    
                    setLoading(true);
                    try {
                      await api.post(`/coaches/${coach.id}/review`, {
                        status: 'completely_rejected',
                        rejectionReason: coach.rejectionReason || 'Application completely rejected.',
                      });
                      onUpdate();
                      onClose();
                    } catch (error) {
                      console.error('Error completely rejecting coach:', error);
                      alert('Failed to completely reject coach');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <MdCancel style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Completely Reject
                </button>
              </>
            )}

            {coach.status === 'completely_rejected' && (
              <>
                <div style={{ padding: '1rem', background: 'var(--danger)', color: 'white', borderRadius: 'var(--border-radius-sm)', textAlign: 'center', fontWeight: '600', marginBottom: '1rem' }}>
                  ⛔ This coach has been completely rejected.
                </div>
                <button 
                  className="btn-warning" 
                  onClick={async () => {
                    if (!confirm('Move this coach to "Needs Changes" status? They will be able to fix issues and resubmit.')) return;
                    
                    setLoading(true);
                    try {
                      await api.post(`/coaches/${coach.id}/review`, {
                        status: 'rejected',
                        rejectionReason: coach.rejectionReason || 'Recovered from complete rejection for review.',
                      });
                      onUpdate();
                      onClose();
                    } catch (error) {
                      console.error('Error recovering coach:', error);
                      alert('Failed to recover coach');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading}
                >
                  <MdRefresh style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Recover to "Needs Changes"
                </button>
              </>
            )}

            {coach.status === 'approved' && (
              <button 
                className="btn-danger" 
                onClick={handleBan}
                disabled={loading}
              >
                <MdBlock style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Ban Coach
              </button>
            )}

            {coach.status === 'banned' && (
              <button 
                className="btn-success" 
                onClick={handleUnban}
                disabled={loading}
              >
                ✓ Unban Coach
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(false)}>
          <div className="modal-content rejection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><MdCancel style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Reject Coach Application</h2>
              <button className="modal-close" onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            
            <div className="rejection-modal-body">
              {/* Field Selection */}
              <div className="form-group">
                <label className="rejection-label">
                  Select Fields with Issues *
                </label>
                <p className="rejection-help-text">
                  Check all fields that need to be corrected by the coach
                </p>
                
                <div className="rejection-fields-grid">
                  {[
                    { key: 'email', label: 'Email Address' },
                    { key: 'phoneNumber', label: 'Phone Number' },
                    { key: 'fullName', label: 'Full Name' },
                    { key: 'dateOfBirth', label: 'Date of Birth' },
                    { key: 'postalCode', label: 'Postal Code' },
                    { key: 'city', label: 'City' },
                    { key: 'country', label: 'Country' },
                    { key: 'address', label: 'Address' },
                    { key: 'idType', label: 'ID Type' },
                    { key: 'profilePhoto', label: 'Profile Photo' },
                    { key: 'idDocuments', label: 'ID Documents (Passport/National ID)' },
                    { key: 'yearsOfExperience', label: 'Years of Experience' },
                    { key: 'description', label: 'Professional Background' },
                  ].map(({ key, label }) => (
                    <div
                      key={key}
                      className={`field-checkbox ${rejectedFields.includes(key) ? 'checked' : ''}`}
                      onClick={() => toggleRejectedField(key)}
                    >
                      <input
                        type="checkbox"
                        checked={rejectedFields.includes(key)}
                        onChange={() => toggleRejectedField(key)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>

                {rejectedFields.length > 0 && (
                  <div className="selected-fields-summary">
                    <strong>Selected fields ({rejectedFields.length}):</strong>
                    <div className="selected-fields-tags">
                      {rejectedFields.map(field => (
                        <span key={field} className="field-tag">
                          {field}
                          <button onClick={() => toggleRejectedField(field)}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rejection Reason */}
              <div className="form-group">
                <label className="rejection-label">
                  Detailed Rejection Reason *
                </label>
                <p className="rejection-help-text">
                  Explain specifically what's wrong with the selected fields and how to fix them
                </p>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Example: The ID document photo is blurry and the text is not readable. Please upload a clear, high-quality photo where all text and details are visible."
                  className="rejection-textarea"
                  required
                />
              </div>
            </div>

            <div className="modal-footer" style={{ gap: '1rem', justifyContent: 'space-between' }}>
              <button className="btn-secondary" onClick={() => {
                setShowRejectModal(false);
                setRejectedFields([]);
                setRejectionReason('');
              }}>
                Cancel
              </button>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  className="btn-warning" 
                  onClick={() => handleReject('changes_required')} 
                  disabled={loading}
                  title="Coach can fix the issues and resubmit"
                >
                  {loading ? 'Processing...' : `📝 Request Changes ${rejectedFields.length > 0 ? `(${rejectedFields.length} fields)` : ''}`}
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => handleReject('completely_rejected')} 
                  disabled={loading}
                  title="Permanently reject - coach cannot resubmit"
                >
                  {loading ? 'Processing...' : '⛔ Completely Reject (Final)'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Coach Modal */}
      {showBanModal && (
        <BanCoachModal 
          coach={coach}
          onClose={() => setShowBanModal(false)}
          onSuccess={handleBanSuccess}
        />
      )}
    </>
  );
};

// Coach Users Modal Component
const CoachUsersModal = ({
  coach,
  onClose,
  onSuccess,
}: {
  coach: Coach;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  interface User {
    id: string;
    uid: string;
    displayName: string;
    email: string;
    phoneNumber?: string;
    assignedCoachId?: string;
    coachCommissionOverride?: number;
    status: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [commissionValue, setCommissionValue] = useState<string>('');

  useEffect(() => {
    fetchCoachUsers();
  }, []);

  const fetchCoachUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const coachUsers = response.data.filter(
        (user: User) => user.assignedCoachId === coach.id
      );
      setUsers(coachUsers);
    } catch (error) {
      console.error('Error fetching coach users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommission = async (_userId: string, uid: string) => {
    try {
      const commissionPercentage = commissionValue === '' ? null : parseFloat(commissionValue);
      
      if (commissionPercentage !== null && (commissionPercentage < 0 || commissionPercentage > 100)) {
        alert('Commission must be between 0 and 100%');
        return;
      }

      await api.patch(`/users/${uid}/commission`, {
        coachCommissionOverride: commissionPercentage,
      });

      alert('✅ Commission updated successfully!');
      setEditingUserId(null);
      fetchCoachUsers();
      onSuccess();
    } catch (error: any) {
      console.error('Error updating commission:', error);
      alert(error.response?.data?.message || 'Failed to update commission');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal coach-users-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><MdPeople style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Users Assigned to {coach.fullName}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="coach-info-box">
            <p><strong>Coach:</strong> {coach.fullName}</p>
            <p><strong>Default Commission:</strong> {coach.defaultCommissionPercentage || 30}%</p>
            <p className="help-text">
              Set per-user commission overrides below. Leave empty to use coach's default.
            </p>
          </div>

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="empty-state">
              <p>No users assigned to this coach yet.</p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Commission %</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.displayName || 'N/A'}</td>
                      <td>{user.email}</td>
                      <td>{user.phoneNumber || 'N/A'}</td>
                      <td>
                        {editingUserId === user.id ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={commissionValue}
                            onChange={(e) => setCommissionValue(e.target.value)}
                            placeholder={`Default: ${coach.defaultCommissionPercentage || 30}%`}
                            className="commission-input"
                            autoFocus
                          />
                        ) : (
                          <span className={user.coachCommissionOverride ? 'commission-override' : 'commission-default'}>
                            {user.coachCommissionOverride !== undefined && user.coachCommissionOverride !== null
                              ? `${user.coachCommissionOverride}% (override)`
                              : `${coach.defaultCommissionPercentage || 30}% (default)`}
                          </span>
                        )}
                      </td>
                      <td>
                        {editingUserId === user.id ? (
                          <div className="action-buttons">
                            <button
                              className="btn-icon save"
                              onClick={() => handleUpdateCommission(user.id, user.uid)}
                              title="Save"
                            >
                              ✓
                            </button>
                            <button
                              className="btn-icon cancel"
                              onClick={() => {
                                setEditingUserId(null);
                                setCommissionValue('');
                              }}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn-icon edit"
                            onClick={() => {
                              setEditingUserId(user.id);
                              setCommissionValue(
                                user.coachCommissionOverride !== undefined && user.coachCommissionOverride !== null
                                  ? user.coachCommissionOverride.toString()
                                  : ''
                              );
                            }}
                            title="Edit Commission"
                          >
                            ✏️
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

const BanCoachModal = ({
  coach,
  onClose,
  onSuccess,
}: {
  coach: Coach;
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
      await api.post(`/coaches/${coach.id}/ban`, { banReason: banReason.trim() });
      onSuccess();
    } catch (error: any) {
      console.error('Error banning coach:', error);
      setError(error.response?.data?.message || 'Failed to ban coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ban-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><MdBlock style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Ban Coach</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="ban-modal-body">
            {error && (
              <div className="error-message" style={{ marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <div className="ban-coach-info">
              <img 
                src={coach.profilePhotoUrl || 'https://via.placeholder.com/60'} 
                alt={coach.fullName}
                className="ban-coach-avatar"
              />
              <div>
                <h3>{coach.fullName}</h3>
                <p>{coach.email}</p>
                <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '0.25rem' }}>
                  {coach.yearsOfExperience} years experience
                </p>
              </div>
            </div>

            <div className="form-group">
              <label className="ban-label">
                Ban Reason *
              </label>
              <p className="ban-help-text">
                Explain why this coach is being banned. This will be recorded in the system.
              </p>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Example: Violated coaching guidelines, inappropriate conduct with clients..."
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
              {loading ? 'Banning...' : <><MdBlock style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Ban Coach</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Delete Coach Modal Component
const DeleteCoachModal = ({
  coach,
  onClose,
  onSuccess,
}: {
  coach: Coach;
  onClose: () => void;
  onSuccess: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    fetchActiveUsers();
  }, []);

  const fetchActiveUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get(`/coaches/${coach.id}/active-users`);
      setActiveUsers(response.data);
    } catch (error) {
      console.error('Error fetching active users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText.trim().toLowerCase() !== coach.fullName.trim().toLowerCase()) {
      alert('Please type the coach name exactly to confirm deletion');
      return;
    }

    if (!confirm(`⚠️ FINAL CONFIRMATION: Permanently delete ${coach.fullName}? This CANNOT be undone!`)) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/coaches/${coach.id}`);
      alert('✅ Coach deleted successfully');
      onSuccess();
    } catch (error: any) {
      console.error('Error deleting coach:', error);
      alert(error.response?.data?.message || 'Failed to delete coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2><MdWarning style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#dc2626' }} /> Delete Coach</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="warning-box">
            <MdWarning style={{ fontSize: '2rem', color: '#dc2626' }} />
            <div>
              <h3>⚠️ Warning: Permanent Deletion</h3>
              <p>This action will permanently delete this coach and all associated data. This cannot be undone!</p>
            </div>
          </div>

          <div className="delete-user-info">
            <img 
              src={coach.profilePhotoUrl || 'https://via.placeholder.com/60'} 
              alt={coach.fullName}
              className="delete-user-avatar"
            />
            <div>
              <h3>{coach.fullName}</h3>
              <p><MdEmail style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {coach.email}</p>
              <p><MdPhone style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {coach.phoneNumber}</p>
              <p><MdBusiness style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> {coach.yearsOfExperience} years experience</p>
            </div>
          </div>

          {loadingUsers ? (
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div className="spinner"></div>
              <p>Checking for assigned users...</p>
            </div>
          ) : (
            <>
              {activeUsers.length > 0 && (
                <div className="warning-box" style={{ backgroundColor: '#fef2f2', borderColor: '#fca5a5' }}>
                  <MdWarning style={{ fontSize: '1.5rem', color: '#dc2626' }} />
                  <div>
                    <h4 style={{ color: '#dc2626', margin: '0 0 0.5rem 0' }}>
                      ⚠️ This coach has {activeUsers.length} assigned user(s)
                    </h4>
                    <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                      {activeUsers.slice(0, 5).map((user: any) => (
                        <li key={user.id}>
                          <strong>{user.displayName || user.email}</strong> - {user.email}
                        </li>
                      ))}
                      {activeUsers.length > 5 && (
                        <li>... and {activeUsers.length - 5} more user(s)</li>
                      )}
                    </ul>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                      These users will lose their coach assignment if you proceed.
                    </p>
                  </div>
                </div>
              )}

              <div className="info-box">
                <h4>What will be deleted:</h4>
                <ul>
                  <li><MdCancel style={{ verticalAlign: 'middle', marginRight: '0.25rem', color: '#dc2626' }} /> Coach profile and all personal information</li>
                  <li><MdCancel style={{ verticalAlign: 'middle', marginRight: '0.25rem', color: '#dc2626' }} /> All uploaded documents (photos, ID verification)</li>
                  <li><MdCancel style={{ verticalAlign: 'middle', marginRight: '0.25rem', color: '#dc2626' }} /> Coach assignments from all users</li>
                  <li><MdCancel style={{ verticalAlign: 'middle', marginRight: '0.25rem', color: '#dc2626' }} /> Historical records and audit trail</li>
                </ul>
              </div>

              <div className="confirmation-section">
                <label>
                  <strong>Type the coach's full name to confirm:</strong>
                  <span style={{ color: '#dc2626', marginLeft: '0.5rem' }}>{coach.fullName}</span>
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Type coach name here..."
                  className="confirm-input"
                />
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            type="button" 
            className="btn-danger" 
            onClick={handleDelete}
            disabled={loading || loadingUsers || confirmText.trim().toLowerCase() !== coach.fullName.trim().toLowerCase()}
          >
            {loading ? 'Deleting...' : <><MdDelete style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Delete Coach Permanently</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Coach Modal Component
const EditCoachModal = ({ 
  coach, 
  onClose, 
  onSuccess 
}: { 
  coach: Coach; 
  onClose: () => void; 
  onSuccess: () => void;
}) => {
  const [formData, setFormData] = useState({
    phoneNumber: coach.phoneNumber,
    fullName: coach.fullName,
    dateOfBirth: coach.dateOfBirth,
    postalCode: coach.postalCode,
    city: coach.city,
    country: coach.country,
    address: coach.address,
    yearsOfExperience: coach.yearsOfExperience,
    description: coach.description,
    defaultCommissionPercentage: coach.defaultCommissionPercentage || 30,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/coaches/${coach.id}`, formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update coach');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Edit Coach</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="coach-form">
          {/* Current Photos Preview */}
          <div className="form-section-card">
            <h3 className="section-title">📸 Current Photos</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <label>Profile Photo</label>
                <img src={coach.profilePhotoUrl} alt="Profile" className="preview-image" />
              </div>
              <div className="preview-item">
                <label>{coach.idType === 'passport' ? 'Passport' : 'ID Front'}</label>
                <img src={coach.idFrontPhotoUrl} alt="ID Front" className="preview-image" />
              </div>
              {coach.idType === 'national_id' && (
                <div className="preview-item">
                  <label>ID Back</label>
                  <img src={coach.idBackPhotoUrl} alt="ID Back" className="preview-image" />
                </div>
              )}
            </div>
          </div>

          {/* Personal Information */}
          <div className="form-section-card">
            <h3 className="section-title"><MdPerson style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Personal Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email (Read-only)</label>
                <input
                  type="email"
                  value={coach.email}
                  disabled
                  className="readonly-input"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="form-section-card">
            <h3 className="section-title">📍 Address Information</h3>
            
            <div className="form-group">
              <label>Street Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Postal Code *</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Professional Experience */}
          <div className="form-section-card">
            <h3 className="section-title"><MdBusiness style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Professional Experience</h3>
            
            <div className="form-group">
              <label>Years of Experience *</label>
              <input
                type="number"
                value={formData.yearsOfExperience}
                onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                min="0"
                required
              />
            </div>

            <div className="form-group">
              <label>Professional Background & Skills *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={5}
                required
              />
            </div>

            <div className="form-group">
              <label>Default Commission Percentage *</label>
              <input
                type="number"
                value={formData.defaultCommissionPercentage}
                onChange={(e) => setFormData({ ...formData, defaultCommissionPercentage: parseFloat(e.target.value) || 0 })}
                min="0"
                max="100"
                step="0.1"
                required
              />
              <small className="help-text">
                Default commission % for all users assigned to this coach. Can be overridden per user.
              </small>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Coach'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

