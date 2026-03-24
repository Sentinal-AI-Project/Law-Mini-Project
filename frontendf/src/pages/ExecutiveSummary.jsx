import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AlertCircle, Download, FileText, Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ExecutiveSummary = () => {
  const navigate = useNavigate();
  const [trendWindow, setTrendWindow] = useState('90D');

  const handleDownloadSummary = () => {
    const blob = new Blob(['Executive Summary\nOverall Risk Score: 72/100\nCompliance Rate: 87%\n'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'executive-summary.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#1e293b' }}>Executive Summary</h1>
          <p style={{ color: 'var(--text-muted)' }}>Risk oversight and compliance monitoring</p>
        </div>
        <select style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500 }}>
          <option>Last 90 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      <div style={{ background: '#dc2626', color: '#fff', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
            <AlertCircle size={32} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Critical Findings Alert</h2>
            <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1rem' }}>8 high-priority compliance violations require immediate attention</p>
            <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
              <span>Data Security (3)</span>
              <span>Financial Controls (2)</span>
              <span>SOX Compliance (3)</span>
            </div>
          </div>
        </div>
        <button onClick={() => navigate('/findings')} style={{ background: '#fff', color: '#dc2626', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Review Now</button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <button onClick={handleDownloadSummary} className="btn btn-primary" style={{ flex: 1, background: '#4f46e5', color: '#fff', gap: '0.75rem', padding: '1rem' }}>
          <Download size={20} /> Download Executive Summary
        </button>
        <button onClick={() => navigate('/reports')} className="btn btn-outline" style={{ flex: 1, background: '#fff', gap: '0.75rem', padding: '1rem' }}>
          <FileText size={20} /> View Full Report
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px' }}><Shield size={24} color="#3b82f6" /></div>
            <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.85rem' }}>-12%</span>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Overall Risk Score</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>72 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>/100</span></div>
          </div>
        </div>
        
        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#fef3c7', padding: '10px', borderRadius: '8px' }}><AlertTriangle size={24} color="#d97706" /></div>
            <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>-8%</span>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Open Violations</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>142</div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#ecfdf5', padding: '10px', borderRadius: '8px' }}><CheckCircle size={24} color="#10b981" /></div>
            <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>+15%</span>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Compliance Rate</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>87%</div>
          </div>
        </div>

        <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ background: '#f3e8ff', padding: '10px', borderRadius: '8px' }}><Clock size={24} color="#9333ea" /></div>
            <span style={{ color: '#d97706', fontWeight: 600, fontSize: '0.85rem' }}>+3 days</span>
          </div>
          <div>
            <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>Avg. Resolution Time</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>12 <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>d</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Trends Line Chart */}
        <div className="card" style={{ flex: 2, background: '#fff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Risk Trends Over Time</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>90-day risk trajectory analysis</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '8px' }}>
              <button onClick={() => setTrendWindow('30D')} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', background: trendWindow === '30D' ? '#fff' : 'transparent', color: trendWindow === '30D' ? '#3b82f6' : '#64748b', boxShadow: trendWindow === '30D' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', fontSize: '0.85rem', fontWeight: trendWindow === '30D' ? 600 : 500 }}>30D</button>
              <button onClick={() => setTrendWindow('90D')} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', background: trendWindow === '90D' ? '#fff' : 'transparent', color: trendWindow === '90D' ? '#3b82f6' : '#64748b', boxShadow: trendWindow === '90D' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', fontSize: '0.85rem', fontWeight: trendWindow === '90D' ? 600 : 500 }}>90D</button>
              <button onClick={() => setTrendWindow('1Y')} style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', background: trendWindow === '1Y' ? '#fff' : 'transparent', color: trendWindow === '1Y' ? '#3b82f6' : '#64748b', boxShadow: trendWindow === '1Y' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', fontSize: '0.85rem', fontWeight: trendWindow === '1Y' ? 600 : 500 }}>1Y</button>
            </div>
          </div>
          
          <div style={{ height: '300px', display: 'flex', alignItems: 'flex-end', gap: '1rem', position: 'relative', borderBottom: '1px solid #e2e8f0', paddingBottom: '2rem' }}>
            {/* Y axis */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            {/* SVG implementation for line chart approximation */}
            <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ marginLeft: '2rem', overflow: 'visible' }}>
               <path d="M 0 35 L 10 37 L 20 34 L 30 38 L 40 40 L 50 45 L 60 44 L 70 48 L 80 50 L 90 48 L 100 48" fill="none" stroke="#4f46e5" strokeWidth="2" />
               <path d="M 0 55 L 10 54 L 20 56 L 30 52 L 40 50 L 50 48 L 60 46 L 70 44 L 80 42 L 90 40 L 100 38" fill="none" stroke="#10b981" strokeWidth="2" />
               <path d="M 0 85 L 10 84 L 20 86 L 30 88 L 40 89 L 50 88 L 60 90 L 70 91 L 80 92 L 90 93 L 100 92" fill="none" stroke="#ef4444" strokeWidth="2" />
            </svg>
            <div style={{ position: 'absolute', bottom: '0.5rem', left: '2rem', right: 0, display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem' }}>
              <span>Week 1</span><span>Week 3</span><span>Week 5</span><span>Week 7</span><span>Week 9</span><span>Week 11</span>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '4px', background: '#4f46e5', borderRadius: '2px' }}></span> Overall Risk</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '4px', background: '#ef4444', borderRadius: '2px' }}></span> Critical Findings</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '4px', background: '#10b981', borderRadius: '2px' }}></span> Compliance Rate</span>
          </div>
        </div>

        {/* Top Recurring Violations */}
        <div className="card" style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem' }}>Top Recurring Violations</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>Most frequent compliance issues</p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {[
              { title: 'Access Control Violations', desc: 'Unauthorized system access', count: 34, color: '#ef4444', pct: '85%' },
              { title: 'Data Encryption Gaps', desc: 'Unencrypted sensitive data', count: 28, color: '#f59e0b', pct: '65%' },
              { title: 'Approval Workflow Issues', desc: 'Missing dual approvals', count: 22, color: '#f59e0b', pct: '50%' },
              { title: 'Documentation Deficiencies', desc: 'Incomplete audit trails', count: 19, color: '#3b82f6', pct: '40%' },
              { title: 'Password Policy Breaches', desc: 'Weak or expired passwords', count: 15, color: '#3b82f6', pct: '30%' }
            ].map((v, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem' }}>{v.title}</span>
                  <span style={{ color: v.color, fontWeight: 700, fontSize: '0.9rem' }}>{v.count}</span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{v.desc}</div>
                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: v.pct, height: '100%', background: v.color, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Department Risk Comparison */}
      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Department Risk Comparison</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Risk scores across organizational units</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', background: '#4f46e5', borderRadius: '4px' }}></span> Current Period</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span style={{ width: '12px', height: '12px', background: '#cbd5e1', borderRadius: '4px' }}></span> Previous Period</span>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', height: '250px', paddingBottom: '2.5rem', position: 'relative', borderBottom: '1px solid #e2e8f0' }}>
            {/* Y axis */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>100</span>
              <span>80</span>
              <span>60</span>
              <span>40</span>
              <span>20</span>
              <span>0</span>
            </div>
            
            {[
              { name: 'IT Security', current: 85, prev: 78 },
              { name: 'Finance', current: 72, prev: 76 },
              { name: 'HR', current: 68, prev: 71 },
              { name: 'Operations', current: 71, prev: 74 },
              { name: 'Legal', current: 64, prev: 68 },
              { name: 'Sales', current: 69, prev: 72 },
              { name: 'Marketing', current: 66, prev: 70 },
              { name: 'R&D', current: 70, prev: 73 }
            ].map((dept, i) => (
              <div key={i} style={{ display: 'flex', gap: '4px', height: '100%', alignItems: 'flex-end', position: 'relative' }}>
                <div style={{ width: '24px', height: `${dept.current}%`, background: '#4f46e5', borderRadius: '4px 4px 0 0' }}></div>
                <div style={{ width: '24px', height: `${dept.prev}%`, background: '#cbd5e1', borderRadius: '4px 4px 0 0' }}></div>
                <span style={{ position: 'absolute', bottom: '-2rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap' }}>{dept.name}</span>
              </div>
            ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExecutiveSummary;
