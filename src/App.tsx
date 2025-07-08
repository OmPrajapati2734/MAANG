import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Layout/Header';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import Practice from './pages/Practice';
import Mentor from './pages/Mentor';
import Resources from './pages/Resources';
import ResetPassword from './pages/ResetPassword';
import MockInterview from './pages/MockInterview';
import SuccessStories from './pages/SuccessStories';
import SystemDesign from './pages/SystemDesign';
import ResumeReview from './pages/ResumeReview';
import Profile from './pages/Profile';

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Header />}
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
        <Route path="/system-design" element={
          <ProtectedRoute>
            <SystemDesign />
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
        <Route path="/resume-review" element={
          <ProtectedRoute>
            <ResumeReview />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;