import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { ShieldAlert, AlertTriangle, FileText, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { findingsAPI, reportsAPI, docsAPI } from '../services/api';

const RiskDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    criticalCount: 0,
    highCount: 0,
    reportsCount: 0,
    completedAnalysisCount: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          findingStats,
          reportsData,
          completedDocs,
          recentFindings
        ] = await Promise.allSettled([
          findingsAPI.stats(),
          reportsAPI.list({ limit: 1 }),
          docsAPI.list({ status: 'analyzed', limit: 1 }), // Or 'completed'
          findingsAPI.list({ limit: 3 })
        ]);

        let critical = 0;
        let high = 0;
        
        if (findingStats.status === 'fulfilled' && findingStats.value.by_severity) {
           critical = findingStats.value.by_severity.find(s => s._id === 'critical')?.count || 0;
           high = findingStats.value.by_severity.find(s => s._id === 'high')?.count || 0;
        }

        setStats({
          criticalCount: critical,
          highCount: high,
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

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Risk Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Monitor and manage critical risk alerts in real-time</p>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{loading ? '—' : stats.criticalCount}</div>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{loading ? '—' : stats.highCount}</div>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{loading ? '—' : stats.reportsCount}</div>
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
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{loading ? '—' : stats.completedAnalysisCount}</div>
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
          {loading ? (
             <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center' }}>Loading activity...</div>
          ) : recentActivity.length === 0 ? (
             <div style={{ padding: '1rem', color: '#64748b', textAlign: 'center' }}>No recent activity.</div>
          ) : (
             recentActivity.map((activity, idx) => (
                <div key={activity.id || idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: idx === recentActivity.length - 1 ? 0 : '1.5rem', borderBottom: idx === recentActivity.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                   <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: activity.severity === 'critical' ? '#fee2e2' : (activity.severity === 'high' ? '#fef3c7' : '#eff6ff'), color: activity.severity === 'critical' ? '#dc2626' : (activity.severity === 'high' ? '#d97706' : '#2563eb'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {activity.severity === 'critical' ? <ShieldAlert size={20} /> : <AlertTriangle size={20} />}
                   </div>
                   <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>
                        {activity.severity === 'critical' ? `Critical risk: ${activity.description}` : `Risk detected in ${activity.document_id?.filename || 'Document'}`}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>
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
