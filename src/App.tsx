import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './store/authStore';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Coaches } from './pages/Coaches';
import { Users } from './pages/Users';
import { Strategies } from './pages/Strategies/index';
import { VideosManagement } from './pages/Strategies/VideosManagement';
import { SystemWallet } from './pages/SystemWallet';
import { AdminManagement } from './pages/AdminManagement';
import { Subscriptions } from './pages/Subscriptions/index';
import { Settings } from './pages/Settings/index';
import './App.css';

function App() {
  const { setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken();
        setUser(user);
        setToken(token);
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setToken, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coaches"
          element={
            <ProtectedRoute>
              <Coaches />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/strategies"
          element={
            <ProtectedRoute>
              <Strategies />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/strategies/:strategyId/videos"
          element={
            <ProtectedRoute>
              <VideosManagement />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/system-wallet"
          element={
            <ProtectedRoute>
              <SystemWallet />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admin-management"
          element={
            <ProtectedRoute>
              <AdminManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscriptions"
          element={
            <ProtectedRoute>
              <Subscriptions />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
