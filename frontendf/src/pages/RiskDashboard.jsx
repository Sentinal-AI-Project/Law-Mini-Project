import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findingsAPI, reportsAPI, docsAPI } from '../services/api';
import { useComplianceData } from '../hooks/useComplianceData';

const RiskDashboard = () => {
  const navigate = useNavigate();

  const { stats: complianceStats, loading: complianceLoading } = useComplianceData(30000);
  const [miscStats, setMiscStats] = useState({
    reportsCount: 0,
    completedAnalysisCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          reportsData,
          completedDocs,
          recentFindings
        ] = await Promise.allSettled([
          reportsAPI.list({ limit: 1 }),
          docsAPI.list({ status: 'completed', limit: 1 }),
          findingsAPI.list({ limit: 3 })
        ]);

        setMiscStats({
          reportsCount: reportsData.status === 'fulfilled' ? (reportsData.value.total || 0) : 0,
          completedAnalysisCount: completedDocs.status === 'fulfilled' ? (completedDocs.value.total || 0) : 0,
        });

        if (recentFindings.status === 'fulfilled' && recentFindings.value.findings) {
          setRecentActivity(recentFindings.value.findings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const criticalCount = complianceStats?.findings?.by_severity?.find(s => s._id === 'critical')?.count || 0;
  const highCount = complianceStats?.findings?.by_severity?.find(s => s._id === 'high')?.count || 0;

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Risk Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and manage critical risk alerts in real-time</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '10px', borderRadius: '8px' }}>
              <ShieldAlert size={20} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-red)' }}>CRITICAL</span>
          </div>
          <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-red)', marginBottom: '0.25rem' }}>{complianceLoading ? '—' : criticalCount}</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Critical Risks</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '8px' }}>
              <AlertTriangle size={20} color="#d97706" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-orange)' }}>HIGH</span>
          </div>
          <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-orange)', marginBottom: '0.25rem' }}>{complianceLoading ? '—' : highCount}</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>High Priority</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '8px' }}>
              <FileText size={20} color="#2563eb" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-blue)' }}>ACTIVE</span>
          </div>
          <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{loading ? '—' : miscStats.reportsCount}</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Reports Generated</div>
          </div>
        </div>

        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(11, 220, 181, 0.1)', padding: '10px', borderRadius: '8px' }}>
              <CheckCircle2 size={20} color="#10b981" />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-teal)' }}>DONE</span>
          </div>
          <div>
              <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-teal)', marginBottom: '0.25rem' }}>{loading ? '—' : miscStats.completedAnalysisCount}</p>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Completed Analysis</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Recent Activity</h2>
          <button onClick={() => navigate('/findings')} style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
            View All <ArrowRight size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>Loading activity...</div>
          ) : recentActivity.length === 0 ? (
             <div style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'center' }}>No recent activity.</div>
          ) : (
             recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: idx === recentActivity.length - 1 ? 0 : '1.5rem', borderBottom: idx === recentActivity.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: activity.severity === 'critical' ? 'rgba(239, 68, 68, 0.15)' : (activity.severity === 'high' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'), color: activity.severity === 'critical' ? 'var(--accent-red)' : (activity.severity === 'high' ? 'var(--accent-orange)' : 'var(--accent-blue)'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {activity.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                   </div>
                   <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        {activity.severity === 'critical' ? `Critical risk: ${activity.description}` : `Risk detected in ${activity.document_id?.filename || 'Document'}`}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(activity.created_at).toLocaleString()}
                      </div>
                   </div>
                </div>
             ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiskDashboard;
