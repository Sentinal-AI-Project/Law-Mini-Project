import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, AlertTriangle, HelpCircle, Clock } from 'lucide-react';

const ComplianceDashboard = () => {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Compliance Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor your compliance analysis in real-time</p>
        </div>
        <select style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.95rem' }}>
          <option>SOX Framework</option>
          <option>GDPR</option>
          <option>HIPAA</option>
        </select>
      </div>

      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' }}></div>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>System Status: Online</span>
          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Last updated 2 minutes ago</span>
        </div>
        <div style={{ display: 'flex', gap: '3rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>P95 Analysis Time</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>2.4s</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Queue Length</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1e293b' }}>3</div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Documents</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>1,247</div>
             <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>+12% from last month</div>
           </div>
           <div style={{ background: '#eff6ff', padding: '12px', borderRadius: '8px' }}><FileText size={20} color="#3b82f6" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Findings</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>89</div>
             <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 500 }}>+5 new findings</div>
           </div>
           <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px' }}><AlertTriangle size={20} color="#dc2626" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Compliance Score</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>94%</div>
             <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 500 }}>+2% improvement</div>
           </div>
           <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '8px' }}><HelpCircle size={20} color="#10b981" /></div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
             <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Processing</div>
             <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem' }}>7</div>
             <div style={{ color: '#3b82f6', fontSize: '0.85rem', fontWeight: 500 }}>Documents in queue</div>
           </div>
           <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px' }}><Clock size={20} color="#d97706" /></div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
         <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '2rem' }}>Risk Breakdown</h3>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px' }}>
               {/* CSS Pie Chart Approximation */}
               <div style={{ 
                 position: 'relative', width: '220px', height: '220px', borderRadius: '50%',
                 background: 'conic-gradient(#10b981 0% 50.6%, #f59e0b 50.6% 82.1%, #dc2626 82.1% 95.6%, #3b82f6 95.6% 100%)'
               }}>
                 {/* Labels */}
                 <div style={{ position: 'absolute', top: '50%', right: '-40px', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Low<br/>50.6%</div>
                 <div style={{ position: 'absolute', top: '20%', left: '-30px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Medium<br/>31.5%</div>
                 <div style={{ position: 'absolute', bottom: '20%', left: '-20px', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>High<br/>13.5%</div>
                 <div style={{ position: 'absolute', bottom: '-10px', left: '40%', fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>Critical<br/>4.4%</div>
               </div>
            </div>
         </div>

         <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '2rem' }}>Analysis Status</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Completed</span>
                  <span style={{ color: '#64748b' }}>1,240 documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                  <div style={{ width: '90%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Analyzing</span>
                  <span style={{ color: '#64748b' }}>4 documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                  <div style={{ width: '25%', height: '100%', background: '#c7d2fe', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500, color: '#1e293b' }}>Pending</span>
                  <span style={{ color: '#64748b' }}>3 documents</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px' }}>
                  <div style={{ width: '15%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>
              
              {/* Active task pill */}
              <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1rem', marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  <span style={{ color: '#1e3a8a', fontWeight: 600 }}>Current Analysis</span>
                  <span style={{ color: '#2563eb', fontWeight: 600 }}>73% complete</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#bfdbfe', borderRadius: '4px', marginBottom: '0.5rem' }}>
                  <div style={{ width: '73%', height: '100%', background: '#2563eb', borderRadius: '4px' }}></div>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>Financial_Report_Q3_2024.pdf</div>
              </div>
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
             {[
               { name: 'Financial_Report_Q3_2024.pdf', status: 'Analyzing', sColor: '#2563eb', risk: 'Medium', rColor: '#d97706', findings: '-', time: '2 minutes ago' },
               { name: 'Compliance_Policy_Update.docx', status: 'Completed', sColor: '#10b981', risk: 'Low', rColor: '#10b981', findings: '2', time: '1 hour ago' },
               { name: 'Risk_Assessment_Matrix.xlsx', status: 'Completed', sColor: '#10b981', risk: 'Critical', rColor: '#dc2626', findings: '7', time: '3 hours ago' },
               { name: 'Audit_Trail_October.pdf', status: 'Completed', sColor: '#10b981', risk: 'High', rColor: '#dc2626', findings: '4', time: '5 hours ago' }
             ].map((row, i) => (
               <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }}>
                 <td style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <FileText size={18} color="#ef4444" />
                    <span style={{ fontWeight: 500, color: '#1e293b', fontSize: '0.95rem' }}>{row.name}</span>
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem', color: row.sColor, fontSize: '0.9rem', fontWeight: 500 }}>{row.status}</td>
                 <td style={{ padding: '1.25rem 1.5rem', color: row.rColor, fontSize: '0.9rem', fontWeight: 500 }}>{row.risk}</td>
                 <td style={{ padding: '1.25rem 1.5rem', color: '#475569', fontSize: '0.95rem', fontWeight: 500 }}>{row.findings}</td>
                 <td style={{ padding: '1.25rem 1.5rem', color: '#64748b', fontSize: '0.9rem' }}>{row.time}</td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

    </DashboardLayout>
  );
};

export default ComplianceDashboard;
