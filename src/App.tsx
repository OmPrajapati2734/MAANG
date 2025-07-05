import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import Header from './components/Layout/Header';
import AdminHeader from './components/Layout/AdminHeader';
import AdminRoute from './components/Admin/AdminRoute';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Practice from './pages/Practice';
import Mentor from './pages/Mentor';
import Resources from './pages/Resources';
import ResetPassword from './pages/ResetPassword';
import MockInterview from './pages/MockInterview';
import SuccessStories from './pages/SuccessStories';
import AdminDashboard from './pages/Admin/AdminDashboard';
import QuestionManager from './pages/Admin/QuestionManager';
import QuizManager from './pages/Admin/QuizManager';
import ResourceManager from './pages/Admin/ResourceManager';
import CompanyManager from './pages/Admin/CompanyManager';
import Analytics from './pages/Admin/Analytics';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/" />;
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const { isAdmin } = useAdmin();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (isAdminRoute && isAdmin ? <AdminHeader /> : <Header />)}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/roadmap/:companyId" element={
          <ProtectedRoute>
            <Roadmap />
          </ProtectedRoute>
        } />
        <Route path="/practice" element={
          <ProtectedRoute>
            <Practice />
          </ProtectedRoute>
        } />
        <Route path="/mentor" element={
          <ProtectedRoute>
            <Mentor />
          </ProtectedRoute>
        } />
        <Route path="/resources" element={
          <ProtectedRoute>
            <Resources />
          </ProtectedRoute>
        } />
        <Route path="/mock-interview" element={
          <ProtectedRoute>
            <MockInterview />
          </ProtectedRoute>
        } />
        <Route path="/success-stories" element={
          <ProtectedRoute>
            <SuccessStories />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/questions" element={
          <AdminRoute>
            <QuestionManager />
          </AdminRoute>
        } />
        <Route path="/admin/quizzes" element={
          <AdminRoute>
            <QuizManager />
          </AdminRoute>
        } />
        <Route path="/admin/resources" element={
          <AdminRoute>
            <ResourceManager />
          </AdminRoute>
        } />
        <Route path="/admin/companies" element={
          <AdminRoute>
            <CompanyManager />
          </AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AdminProvider>
        <Router>
          <AppContent />
        </Router>
      </AdminProvider>
    </AuthProvider>
  );
}

export default App;