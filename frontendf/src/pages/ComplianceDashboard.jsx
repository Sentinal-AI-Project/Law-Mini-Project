import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, AlertTriangle, HelpCircle, Clock } from 'lucide-react';
import { complianceAPI, findingsAPI, docsAPI } from '../services/api';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import CustomDropdown from '../components/CustomDropdown';

const riskData = [
  { name: 'Low', value: 50.6, color: '#10b981' },
  { name: 'Medium', value: 31.5, color: '#f59e0b' },
  { name: 'High', value: 13.5, color: '#dc2626' },
  { name: 'Critical', value: 4.4, color: '#3b82f6' },
];

const ComplianceDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [dashData, findingStats, docsData] = await Promise.allSettled([
          complianceAPI.dashboard(),
          findingsAPI.stats(),
          docsAPI.list({ limit: 4 })
        ]);
        setStats({
          dashboard: dashData.status === 'fulfilled' ? dashData.value : null,
          findings: findingStats.status === 'fulfilled' ? findingStats.value : null,
        });
        if (docsData.status === 'fulfilled' && docsData.value.documents) {
          setRecentDocs(docsData.value.documents);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRiskData = () => {
    if (!stats?.findings?.severityStats || stats.findings.severityStats.length === 0) {
      return [{ name: 'No data', value: 1, color: '#e2e8f0' }];
    }
    const mapping = {
      low: { color: '#10b981' },
      medium: { color: '#f59e0b' },
      high: { color: '#dc2626' },
      critical: { color: '#3b82f6' }
    };
    return stats.findings.severityStats.map(s => ({
      name: s.severity.charAt(0).toUpperCase() + s.severity.slice(1),
      value: s.count,
      color: mapping[s.severity] || '#94a3b8'
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
        <CustomDropdown options={['SOX Framework', 'GDPR', 'HIPAA']} width="170px" />
      </div>

      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }}></div>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>System Status: Online</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Live</span>
        </div>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Queue Length</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>{loading ? '—' : processingDocs}</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Documents</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
               {loading ? '—' : totalDocs}
             </div>
             <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>All uploaded documents</div>
           </div>
           <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}><FileText size={20} color="#3b82f6" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Findings</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
               {loading ? '—' : (stats?.dashboard?.totalFindings ?? stats?.findings?.total ?? '—')}
             </div>
             <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>Across all documents</div>
           </div>
           <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px' }}><AlertTriangle size={20} color="#dc2626" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Compliance Score</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
               {loading ? '—' : (stats?.dashboard?.complianceScore != null ? `${stats.dashboard.complianceScore}%` : '—')}
             </div>
             <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>Overall score</div>
           </div>
           <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}><HelpCircle size={20} color="#10b981" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Processing</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>
               {loading ? '—' : processingDocs}
             </div>
             <div style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500 }}>Documents in queue</div>
           </div>
           <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px' }}><Clock size={20} color="#d97706" /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
         <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '2rem' }}>Risk Breakdown</h3>
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

         <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '2rem' }}>Analysis Status</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Completed</span>
                  <span style={{ color: '#64748b' }}>{completedDocs} documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                  <div style={{ width: `${completedPct}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Processing</span>
                  <span style={{ color: '#64748b' }}>{processingDocs} documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                  <div style={{ width: `${processingPct}%`, height: '100%', background: '#c7d2fe', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Active task pill */}
              {processingDocs > 0 && (
                <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#1e3a8a', fontWeight: 600 }}>Active Analyses</span>
                    <span style={{ color: '#2563eb', fontWeight: 600 }}>In Progress</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#bfdbfe', borderRadius: '4px', marginBottom: '0.5rem' }}>
                    <div style={{ width: '50%', height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Processing {processingDocs} documents...</div>
                </div>
              )}
            </div>
         </div>
      </div>

      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden' }}>
         <h3 style={{ fontSize: '1.25rem', color: '#1e293b', padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>Recent Uploads</h3>
         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
           <thead>
             <tr style={{ color: '#64748b', fontSize: '0.85rem' }}>
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
                 <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                   No recent uploads found.
                 </td>
               </tr>
             ) : (
               recentDocs.map((doc, i) => (
                 <tr key={doc.id || i} style={{ borderTop: '1px solid #e2e8f0' }}>
                   <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <FileText size={18} color="#ef4444" />
                      <span style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem' }}>{doc.filename || doc.name}</span>
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: doc.status === 'analyzed' ? '#10b981' : (doc.status === 'failed' ? '#ef4444' : '#2563eb'), fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                      {doc.status}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 500, textTransform: 'capitalize' }}>
                      {doc.risk_level || '-'}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>
                      {doc.findings_count != null ? doc.findings_count : '-'}
                   </td>
                   <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
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
