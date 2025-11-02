import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import api from '../services/api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { 
  MdDashboard, 
  MdAssessment, 
  MdAttachMoney, 
  MdPeople, 
  MdSchool, 
  MdSubscriptions,
  MdBusiness,
  MdAccountBalance,
  MdTrendingUp,
  MdBolt,
  MdPersonAdd,
  MdTrackChanges,
  MdWallet,
  MdCreditCard,
  MdEmojiEvents
} from 'react-icons/md';
import './Dashboard.css';

interface DashboardStats {
  overview: any;
  financial: any;
  users: any;
  coaches: any;
  subscriptions: any;
  charts: any;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="dashboard-loading">
          <div className="spinner-large"></div>
          <p>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="dashboard-error">
          <p>Failed to load dashboard data</p>
          <button onClick={fetchDashboardStats} className="btn-primary">Retry</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="dashboard-content">
        <div className="dashboard-inner">
          {/* Header */}
          <div className="dashboard-header">
          <div>
            <h1><MdDashboard style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Admin Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back! Here's what's happening with your platform today.</p>
          </div>
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <MdAssessment style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Overview
            </button>
            <button
              className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <MdTrendingUp style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Analytics
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card revenue">
                <div className="metric-icon"><MdAttachMoney /></div>
                <div className="metric-content">
                  <p className="metric-label">Total Revenue</p>
                  <h2 className="metric-value">${stats.financial.totalRevenue.toFixed(2)}</h2>
                  <p className="metric-subtitle">{stats.overview.totalSubscriptions} subscriptions</p>
                </div>
              </div>

              <div className="metric-card users">
                <div className="metric-icon"><MdPeople /></div>
                <div className="metric-content">
                  <p className="metric-label">Total Users</p>
                  <h2 className="metric-value">{stats.users.total}</h2>
                  <p className="metric-subtitle">{stats.users.active} active</p>
                </div>
              </div>

              <div className="metric-card coaches">
                <div className="metric-icon"><MdSchool /></div>
                <div className="metric-content">
                  <p className="metric-label">Total Coaches</p>
                  <h2 className="metric-value">{stats.coaches.total}</h2>
                  <p className="metric-subtitle">{stats.coaches.approved} approved</p>
                </div>
              </div>

              <div className="metric-card subscriptions">
                <div className="metric-icon"><MdSubscriptions /></div>
                <div className="metric-content">
                  <p className="metric-label">Active Subscriptions</p>
                  <h2 className="metric-value">{stats.subscriptions.active}</h2>
                  <p className="metric-subtitle">of {stats.subscriptions.total} total</p>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className="financial-overview">
              <h3 className="section-title"><MdAccountBalance style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Financial Overview</h3>
              <div className="financial-grid">
                <div className="financial-card">
                  <div className="financial-header">
                    <span className="financial-icon"><MdBusiness /></span>
                    <h4>System Earnings</h4>
                  </div>
                  <p className="financial-amount">${stats.financial.totalSystemEarnings.toFixed(2)}</p>
                </div>
                <div className="financial-card">
                  <div className="financial-header">
                    <span className="financial-icon"><MdSchool /></span>
                    <h4>Coach Earnings</h4>
                  </div>
                  <p className="financial-amount">${stats.financial.totalCoachEarnings.toFixed(2)}</p>
                </div>
                <div className="financial-card">
                  <div className="financial-header">
                    <span className="financial-icon"><MdAttachMoney /></span>
                    <h4>Platform Balance</h4>
                  </div>
                  <p className="financial-amount">${stats.financial.totalPlatformBalance.toFixed(2)}</p>
                </div>
                <div className="financial-card">
                  <div className="financial-header">
                    <span className="financial-icon"><MdTrendingUp /></span>
                    <h4>Avg. Subscription</h4>
                  </div>
                  <p className="financial-amount">${stats.financial.averageSubscriptionValue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
              <h3 className="section-title"><MdBolt style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Quick Actions</h3>
              <div className="quick-actions-grid">
                <button className="quick-action-card" onClick={() => navigate('/coaches')}>
                  <div className="action-icon blue"><MdSchool /></div>
                  <h4>Manage Coaches</h4>
                  <p>{stats.coaches.pending} pending approval</p>
                </button>
                <button className="quick-action-card" onClick={() => navigate('/users')}>
                  <div className="action-icon green"><MdPersonAdd /></div>
                  <h4>Manage Users</h4>
                  <p>{stats.users.total} total users</p>
                </button>
                <button className="quick-action-card" onClick={() => navigate('/strategies')}>
                  <div className="action-icon purple"><MdTrackChanges /></div>
                  <h4>Strategies</h4>
                  <p>{stats.overview.totalStrategies} strategies</p>
                </button>
                <button className="quick-action-card" onClick={() => navigate('/subscriptions')}>
                  <div className="action-icon orange"><MdSubscriptions /></div>
                  <h4>Subscriptions</h4>
                  <p>{stats.subscriptions.active} active</p>
                </button>
                <button className="quick-action-card" onClick={() => navigate('/system-wallet')}>
                  <div className="action-icon pink"><MdWallet /></div>
                  <h4>Wallets</h4>
                  <p>View all transactions</p>
                </button>
                <button className="quick-action-card" onClick={() => navigate('/payments-management')}>
                  <div className="action-icon cyan"><MdCreditCard /></div>
                  <h4>Payments</h4>
                  <p>Configure payment methods</p>
                </button>
              </div>
            </div>

            {/* Status Overview */}
            <div className="status-overview-grid">
              <div className="status-card">
                <h3 className="section-title"><MdPeople style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Users Status</h3>
                <div className="status-list">
                  <div className="status-item">
                    <span className="status-dot green"></span>
                    <span className="status-label">Active</span>
                    <span className="status-value">{stats.users.active}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot red"></span>
                    <span className="status-label">Banned</span>
                    <span className="status-value">{stats.users.banned}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot blue"></span>
                    <span className="status-label">With Coaches</span>
                    <span className="status-value">{stats.users.withCoaches}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot gray"></span>
                    <span className="status-label">Without Coaches</span>
                    <span className="status-value">{stats.users.withoutCoaches}</span>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <h3 className="section-title"><MdSchool style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Coaches Status</h3>
                <div className="status-list">
                  <div className="status-item">
                    <span className="status-dot green"></span>
                    <span className="status-label">Approved</span>
                    <span className="status-value">{stats.coaches.approved}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot yellow"></span>
                    <span className="status-label">Pending</span>
                    <span className="status-value">{stats.coaches.pending}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot orange"></span>
                    <span className="status-label">Rejected</span>
                    <span className="status-value">{stats.coaches.rejected}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot red"></span>
                    <span className="status-label">Banned</span>
                    <span className="status-value">{stats.coaches.banned}</span>
                  </div>
                </div>
              </div>

              <div className="status-card">
                <h3 className="section-title"><MdSubscriptions style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Subscriptions Status</h3>
                <div className="status-list">
                  <div className="status-item">
                    <span className="status-dot green"></span>
                    <span className="status-label">Active</span>
                    <span className="status-value">{stats.subscriptions.active}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot yellow"></span>
                    <span className="status-label">Pending</span>
                    <span className="status-value">{stats.subscriptions.pending}</span>
                  </div>
                  <div className="status-item">
                    <span className="status-dot red"></span>
                    <span className="status-label">Expired</span>
                    <span className="status-value">{stats.subscriptions.expired}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'analytics' && (
          <>
            {/* Charts Section */}
            <div className="charts-section">
              {/* Monthly Revenue Chart */}
              <div className="chart-card">
                <h3 className="chart-title"><MdTrendingUp style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Monthly Revenue (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.charts.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Revenue ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* User Growth Chart */}
              <div className="chart-card">
                <h3 className="chart-title"><MdPeople style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> User Growth (Last 7 Days)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.charts.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="New Users" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Strategy Distribution Chart */}
              {stats.charts.strategyDistribution.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title"><MdTrackChanges style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Strategy Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.charts.strategyDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name}: ${entry.value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.charts.strategyDistribution.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Top Coaches */}
              {stats.charts.topCoaches.length > 0 && (
                <div className="chart-card">
                  <h3 className="chart-title"><MdEmojiEvents style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Top 5 Coaches by Earnings</h3>
                  <div className="top-coaches-list">
                    {stats.charts.topCoaches.map((coach: any, index: number) => (
                      <div key={index} className="top-coach-item">
                        <div className="coach-rank">#{index + 1}</div>
                        <div className="coach-info">
                          <p className="coach-name">{coach.name}</p>
                          <p className="coach-balance">Balance: ${coach.balance.toFixed(2)}</p>
                        </div>
                        <div className="coach-earnings">${coach.earnings.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
        </div>
      </div>
    </Layout>
  );
};
