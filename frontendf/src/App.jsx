import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import DocumentLibrary from './pages/DocumentLibrary';
import Findings from './pages/Findings';
import AuditReport from './pages/AuditReport';
import ExecutiveSummary from './pages/ExecutiveSummary';
import ProfileSettings from './pages/ProfileSettings';
import RiskDashboard from './pages/RiskDashboard';
import UploadDocuments from './pages/UploadDocuments';
import ComplianceDashboard from './pages/ComplianceDashboard';

/** Redirect unauthenticated users to /login */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Dashboard Routes — require authentication */}
        <Route path="/dashboard" element={<ProtectedRoute><ComplianceDashboard /></ProtectedRoute>} />
        <Route path="/upload" element={<ProtectedRoute><UploadDocuments /></ProtectedRoute>} />
        <Route path="/library" element={<ProtectedRoute><DocumentLibrary /></ProtectedRoute>} />
        <Route path="/findings" element={<ProtectedRoute><Findings /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><AuditReport /></ProtectedRoute>} />
        <Route path="/executive" element={<ProtectedRoute><ExecutiveSummary /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
        <Route path="/risk" element={<ProtectedRoute><RiskDashboard /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
