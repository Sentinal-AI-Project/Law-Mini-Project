import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Calendar, FileText, DownloadCloud, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const AuditReport = () => {
  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Audit Report Generation</h1>
        <p style={{ color: 'var(--text-muted)' }}>Generate comprehensive compliance audit reports with risk analysis and findings summary.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Side - Configuration */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem', fontWeight: 600 }}>Report Configuration</h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Date Range</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="text" defaultValue="2024-01-01" style={{ width: '100%', padding: '0.6rem', paddingRight: '2rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                  <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input type="text" defaultValue="2024-03-01" style={{ width: '100%', padding: '0.6rem', paddingRight: '2rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.9rem' }} />
                  <Calendar size={16} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Compliance Framework</label>
              <select style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.9rem' }}>
                <option>SOX (Sarbanes-Oxley)</option>
                <option>GDPR</option>
                <option>HIPAA</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '1rem' }}>Select Documents</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { name: 'Financial Controls Policy', checked: true, type: 'docx' },
                  { name: 'Data Privacy Procedures', checked: true, type: 'docx' },
                  { name: 'Security Assessment Report', checked: false, type: 'pdf' },
                  { name: 'Risk Management Framework', checked: true, type: 'pdf' },
                  { name: 'Incident Response Plan', checked: false, type: 'docx' },
                ].map((doc, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input type="checkbox" defaultChecked={doc.checked} id={`doc-${i}`} style={{ width: '16px', height: '16px', accentColor: '#2563eb' }} />
                    <label htmlFor={`doc-${i}`} style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <FileText size={16} color={doc.checked ? '#3b82f6' : '#94a3b8'} />
                      <span>{doc.name}</span>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff', padding: '0.8rem' }}>
              <FileText size={18} /> Generate Report
            </button>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Report Preview</h2>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn" style={{ background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                   <DownloadCloud size={16} /> Export PDF
                </button>
                <button className="btn" style={{ background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                   <FileText size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Risk Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Critical Risks</div>
                <div style={{ color: '#dc2626', fontSize: '2rem', fontWeight: 700 }}>3</div>
                <AlertTriangle size={20} color="#dc2626" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: '#d97706', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>High Risks</div>
                <div style={{ color: '#d97706', fontSize: '2rem', fontWeight: 700 }}>12</div>
                <AlertCircle size={20} color="#d97706" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: '#eff6ff', border: '1px solid #dbeafe', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: '#2563eb', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Medium Risks</div>
                <div style={{ color: '#2563eb', fontSize: '2rem', fontWeight: 700 }}>28</div>
                <Info size={20} color="#2563eb" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: '#059669', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Low Risks</div>
                <div style={{ color: '#059669', fontSize: '2rem', fontWeight: 700 }}>45</div>
                <CheckCircle2 size={20} color="#059669" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1rem' }}>Severity Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* CSS Pie Chart simulation */}
                  <div style={{ 
                    width: '180px', height: '180px', borderRadius: '50%', marginBottom: '1.5rem',
                    background: 'conic-gradient(#10b981 0% 51.1%, #2563eb 51.1% 82.9%, #d97706 82.9% 96.5%, #dc2626 96.5% 100%)' 
                  }}></div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b', flexWrap: 'wrap', justifyContent: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#10b981', display: 'inline-block' }}></span> Low</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#2563eb', display: 'inline-block' }}></span> Medium</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#d97706', display: 'inline-block' }}></span> High</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: '#dc2626', display: 'inline-block' }}></span> Critical</span>
                  </div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1rem' }}>Confidence Statistics</h4>
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
                  {/* Grid Lines */}
                  {[30, 20, 10].map(y => (
                    <div key={y} style={{ position: 'absolute', bottom: `${(y/35)*100}%`, left: 0, right: 0, borderTop: '1px dashed #cbd5e1', zIndex: 0, display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '-20px', fontSize: '0.7rem', color: '#94a3b8' }}>{y}</span>
                    </div>
                  ))}
                  
                  {/* Bars */}
                  {[
                    { label: 'Very High', value: 32, color: '#059669' },
                    { label: 'High', value: 28, color: '#0d9488' },
                    { label: 'Medium', value: 18, color: '#0284c7' },
                    { label: 'Low', value: 7, color: '#3b82f6' }
                  ].map((bar, i) => (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                       <div style={{ width: '100%', height: `${(bar.value/35)*100}%`, background: bar.color, transition: 'height 0.3s' }}></div>
                       <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#64748b' }}>{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: '#f8fafc', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
               <h4 style={{ color: '#1e293b', marginBottom: '1.5rem', fontSize: '1rem' }}>Total Findings Summary</h4>
               <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>88</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Total Findings</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>92%</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Compliance Score</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>76</div>
                   <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.5rem' }}>Resolved Issues</div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditReport;
