import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, AlertTriangle, HelpCircle, Clock } from 'lucide-react';
import { complianceAPI, docsAPI } from '../services/api';
import { useComplianceData } from '../hooks/useComplianceData';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const riskData = [
  { name: 'Low', value: 50.6, color: 'var(--accent-teal)' },
  { name: 'Medium', value: 31.5, color: 'var(--accent-orange)' },
  { name: 'High', value: 13.5, color: 'var(--accent-red)' },
  { name: 'Critical', value: 4.4, color: 'var(--accent-blue)' },
];

const ComplianceDashboard = () => {
  const { stats, loading } = useComplianceData(30000);
  const [recentDocs, setRecentDocs] = useState([]);

  useEffect(() => {
    const fetchRecentDocs = async () => {
      try {
        const docsData = await docsAPI.list({ limit: 4 });
        if (docsData.documents) {
            setRecentDocs(docsData.documents);
        }
      } catch (err) {
        console.error('Failed to fetch recent docs', err);
      }
    };
    fetchRecentDocs();
  }, []);

  const getRiskData = () => {
    // findingsAPI.stats() returns { by_severity: [{_id, count}], ... }
    const bySev = stats?.findings?.by_severity || stats?.findings?.severityStats;
    if (!bySev || bySev.length === 0) {
      return [{ name: 'No data', value: 1, color: 'var(--border-color)' }];
    }
    const mapping = {
      low: { color: 'var(--accent-teal)' },
      medium: { color: 'var(--accent-orange)' },
      high: { color: 'var(--accent-red)' },
      critical: { color: 'var(--accent-blue)' }
    };
    return bySev.map(s => ({
      name: (s._id || s.severity || 'Unknown').charAt(0).toUpperCase() + (s._id || s.severity || 'Unknown').slice(1),
      value: s.count,
      color: mapping[(s._id || s.severity)?.toLowerCase()]?.color || 'var(--text-muted)'
    }));
  };

  const dynamicRiskData = getRiskData();

  const totalDocs = stats?.dashboard?.totalDocuments || 0;
  const processingDocs = stats?.dashboard?.processingCount || 0;
  const completedDocs = Math.max(0, totalDocs - processingDocs);
  const completedPct = totalDocs > 0 ? (completedDocs / totalDocs) * 100 : 0;
  const processingPct = totalDocs > 0 ? (processingDocs / totalDocs) * 100 : 0;

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Compliance Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor your compliance analysis in real-time</p>
        </div>
      </div>



      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Documents</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
               {loading ? '—' : totalDocs}
             </div>
             <div style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: 500 }}>All uploaded documents</div>
           </div>
           <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px' }}><FileText size={20} color="#3b82f6" /></div>
        </div>
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Findings</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
               {loading ? '—' : (stats?.dashboard?.totalFindings ?? stats?.findings?.total ?? '—')}
             </div>
             <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 500 }}>Across all documents</div>
           </div>
           <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}><AlertTriangle size={20} color="#dc2626" /></div>
        </div>
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Compliance Score</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
               {loading ? '—' : (stats?.dashboard?.complianceScore != null ? `${stats.dashboard.complianceScore}%` : '—')}
             </div>
             <div style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: 500 }}>Overall score</div>
           </div>
           <div style={{ background: 'rgba(11, 220, 181, 0.1)', padding: '12px', borderRadius: '8px' }}><HelpCircle size={20} color="#10b981" /></div>
        </div>
        <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Processing</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
               {loading ? '—' : processingDocs}
             </div>
             <div style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 500 }}>Documents in queue</div>
           </div>
           <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '8px' }}><Clock size={20} color="#d97706" /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
         <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Risk Breakdown</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dynamicRiskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={80}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    labelLine={false}
                  >
                    {dynamicRiskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => `${value}`}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
         </div>

         <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '2rem' }}>Analysis Status</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Completed</span>
                  <span style={{ color: 'var(--text-muted)' }}>{completedDocs} documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ width: `${completedPct}%`, height: '100%', background: 'var(--accent-teal)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Processing</span>
                  <span style={{ color: 'var(--text-muted)' }}>{processingDocs} documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px' }}>
                  <div style={{ width: `${processingPct}%`, height: '100%', background: 'var(--border-color)', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Active task pill */}
              {processingDocs > 0 && (
                <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', padding: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Active Analyses</span>
                    <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>In Progress</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#bfdbfe', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    <div style={{ width: '50%', height: '100%', background: 'var(--accent-blue)', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)' }}>Processing {processingDocs} documents...</div>
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden' }}>
         <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>Recent Uploads</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
             <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
               <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Document</th>
               <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
               <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Risk Level</th>
               <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Findings</th>
               <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Uploaded</th>
             </tr>
           </thead>
           <tbody>
             {recentDocs.length === 0 ? (
               <tr>
                 <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                   No recent uploads found.
                 </td>
               </tr>
             ) : (
               recentDocs.map((doc, i) => (
                 <tr key={doc.id || i} style={{ borderTop: '1px solid #e2e8f0' }}>
                   <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} color="#ef4444" />
                      <span style={{ fontWeight: 500, color: 'var(--text-main)', fontSize: '0.95rem' }}>{doc.filename || doc.name}</span>
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: doc.status === 'analyzed' ? 'var(--accent-teal)' : (doc.status === 'failed' ? 'var(--accent-red)' : 'var(--accent-blue)'), fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                      {doc.status}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                      {doc.risk_level || '-'}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                      {doc.findings_count != null ? doc.findings_count : '-'}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                   </td>
                 </tr>
               ))
             )}
           </tbody>
         </table>
      </div>

    </DashboardLayout>
  );
};

export default ComplianceDashboard;
