import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const closeSidebar = () => {
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Respike</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
        </div>

        <nav className="sidebar-nav">
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/dashboard'); closeSidebar(); }}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/coaches' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/coaches'); closeSidebar(); }}
          >
            <span className="nav-icon">🧑‍🏫</span>
            <span className="nav-text">Coaches</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/users' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/users'); closeSidebar(); }}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Users</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/strategies' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/strategies'); closeSidebar(); }}
          >
            <span className="nav-icon">📈</span>
            <span className="nav-text">Strategies</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/system-wallet' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/system-wallet'); closeSidebar(); }}
          >
            <span className="nav-icon">💰</span>
            <span className="nav-text">System Wallet</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/payments-management' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/payments-management'); closeSidebar(); }}
          >
            <span className="nav-icon">💳</span>
            <span className="nav-text">Payments Management</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/admin-management' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/admin-management'); closeSidebar(); }}
          >
            <span className="nav-icon">👨‍💼</span>
            <span className="nav-text">Admin Management</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/subscriptions' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/subscriptions'); closeSidebar(); }}
          >
            <span className="nav-icon">📋</span>
            <span className="nav-text">Subscriptions</span>
          </a>
          <a 
            href="#" 
            className={`nav-item ${location.pathname === '/settings' ? 'active' : ''}`} 
            onClick={(e) => { e.preventDefault(); navigate('/settings'); closeSidebar(); }}
          >
            <span className="nav-icon">⚙️</span>
            <span className="nav-text">Settings</span>
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button 
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>
            <h1>{getPageTitle(location.pathname)}</h1>
          </div>
          <div className="header-right">
            <div className="user-menu">
              <span className="user-name">{user?.email}</span>
              <button className="btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </div>
  );
};

function getPageTitle(pathname: string): string {
  switch (pathname) {
    case '/dashboard':
      return 'Dashboard';
    case '/coaches':
      return 'Coaches';
    case '/users':
      return 'Users';
    case '/strategies':
      return 'Strategies';
    case '/system-wallet':
      return 'System Wallet';
    case '/payments-management':
      return 'Payments Management';
    case '/admin-management':
      return 'Admin Management';
    case '/subscriptions':
      return 'Subscriptions';
    case '/settings':
      return 'Settings';
    default:
      return 'Dashboard';
  }
}

