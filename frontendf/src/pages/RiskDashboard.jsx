import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const RiskDashboard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '0.25rem' }}>Risk Dashboard</h1>
        <p style={{ color: '#64748b' }}>Monitor and manage critical risk alerts in real-time</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#fee2e2', padding: '10px', borderRadius: '8px' }}>
              <ShieldAlert size={20} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dc2626' }}>CRITICAL</span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>3</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Critical Risks</div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#d97706" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#d97706' }}>HIGH</span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>12</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>High Priority</div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}>
              <FileText size={20} color="#2563eb" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb' }}>ACTIVE</span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>8</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Reports Generated</div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981' }}>DONE</span>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>24</div>
            <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Completed Analysis</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Recent Activity</h2>
          <button onClick={() => navigate('/findings')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ShieldAlert size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>New critical risk detected in Network Security</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>2 minutes ago</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '1.5rem', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>Monthly compliance report generated</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>15 minutes ago</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>Data breach analysis completed successfully</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem' }}>1 hour ago</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskDashboard;
