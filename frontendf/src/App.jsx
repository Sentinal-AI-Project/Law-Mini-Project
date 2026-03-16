import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<ComplianceDashboard />} />
        <Route path="/upload" element={<UploadDocuments />} />
        <Route path="/library" element={<DocumentLibrary />} />
        <Route path="/findings" element={<Findings />} />
        <Route path="/reports" element={<AuditReport />} />
        <Route path="/executive" element={<ExecutiveSummary />} />
        <Route path="/profile" element={<ProfileSettings />} />
        <Route path="/risk" element={<RiskDashboard />} />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
