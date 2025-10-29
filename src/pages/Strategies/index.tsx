import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import api from '../../services/api';
import type { Strategy } from './types';
import { StrategyCard } from './components/StrategyCard';
import { AddStrategyModal } from './components/AddStrategyModal'; 
import { ViewStrategyModal } from './components/ViewStrategyModal';
import { EditStrategyModal } from './components/EditStrategyModal';
import { StrategyUsersModal } from './components/StrategyUsersModal';
import './styles/strategies.css';

export const Strategies = () => {
  const navigate = useNavigate();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStrategies();
  }, []);

  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const response = await api.get('/strategies');
      setStrategies(response.data);
    } catch (error) {
      console.error('Error fetching strategies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddModal(false);
    fetchStrategies();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedStrategy(null);
    fetchStrategies();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this strategy?')) return;
    
    try {
      await api.delete(`/strategies/${id}`);
      fetchStrategies();
    } catch (error) {
      console.error('Error deleting strategy:', error);
      alert('Failed to delete strategy');
    }
  };

  const filteredStrategies = strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strategy.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    strategy.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading strategies...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="strategies-container">
        <div className="page-header">
          <div className="search-section">
            <input
              type="text"
              placeholder="🔍 Search strategies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            ➕ Add New Strategy
          </button>
        </div>

        {filteredStrategies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <h3>No Strategies Found</h3>
            <p>
              {searchTerm
                ? 'No strategies match your search criteria.'
                : 'Get started by creating your first strategy!'}
            </p>
            {!searchTerm && (
              <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                ➕ Create First Strategy
              </button>
            )}
          </div>
        ) : (
          <div className="strategies-grid">
            {filteredStrategies.map((strategy) => (
              <StrategyCard
                key={strategy.id}
                strategy={strategy}
                onView={() => {
                  setSelectedStrategy(strategy);
                  setShowViewModal(true);
                }}
                onEdit={() => {
                  setSelectedStrategy(strategy);
                  setShowEditModal(true);
                }}
                onDelete={() => handleDelete(strategy.id)}
                onManageVideos={() => navigate(`/strategies/${strategy.id}/videos`)}
                onViewUsers={() => {
                  setSelectedStrategy(strategy);
                  setShowUsersModal(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {showAddModal && (
          <AddStrategyModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddSuccess}
            nextNumber={strategies.length + 1}
          />
        )}

        {showViewModal && selectedStrategy && (
          <ViewStrategyModal
            strategy={selectedStrategy}
            onClose={() => {
              setShowViewModal(false);
              setSelectedStrategy(null);
            }}
            onEdit={() => {
              setShowViewModal(false);
              setShowEditModal(true);
            }}
          />
        )}

        {showEditModal && selectedStrategy && (
          <EditStrategyModal
            strategy={selectedStrategy}
            onClose={() => {
              setShowEditModal(false);
              setSelectedStrategy(null);
            }}
            onSuccess={handleEditSuccess}
          />
        )}

        {showUsersModal && selectedStrategy && (
          <StrategyUsersModal
            strategyId={selectedStrategy.id}
            strategyName={selectedStrategy.name}
            onClose={() => {
              setShowUsersModal(false);
              setSelectedStrategy(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

