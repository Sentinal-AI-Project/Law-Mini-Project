import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Filter, Plus, FileText, FileSpreadsheet, Eye, Download, CheckCircle, Clock } from 'lucide-react';

const DocumentLibrary = () => {
  const documents = [
    { name: 'Security Policy 2024.pdf', size: '2.4 MB', type: 'PDF', user: 'John Smith', date: 'Mar 15, 2024', status: 'Completed', findings: 23, risk: 'Critical' },
    { name: 'Compliance Report Q1.docx', size: '1.8 MB', type: 'DOCX', user: 'Emily Davis', date: 'Mar 14, 2024', status: 'Processing', findings: '-', risk: 'Pending' },
    { name: 'Risk Assessment Matrix.xlsx', size: '945 KB', type: 'XLSX', user: 'Mike Wilson', date: 'Mar 13, 2024', status: 'Completed', findings: 8, risk: 'Medium' },
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#1e293b' }}>Document Library</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage and review your security documents</p>
        </div>
        <button className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Plus size={20} /> Upload Document
        </button>
      </div>

      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 2fr) 1fr 1fr', gap: '1.5rem' }}>
          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Search Documents</label>
             <div style={{ position: 'relative' }}>
               <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
               <input type="text" placeholder="Search by document name..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
             </div>
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Date Range</label>
             <select style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
               <option>All Time</option>
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
             </select>
          </div>
          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#475569', fontWeight: 500 }}>Risk Level</label>
             <select style={{ width: '100%', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: '#fff' }}>
               <option>All Levels</option>
               <option>Critical</option>
               <option>High</option>
             </select>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Documents <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 'normal' }}>(247 total)</span></h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>Show:</span>
            <select style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff' }}>
              <option>25</option>
              <option>50</option>
            </select>
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Document Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Type</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Uploaded By</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Upload Date</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Findings</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Risk Level</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {doc.type === 'PDF' && <FileText color="#ef4444" />}
                    {doc.type === 'DOCX' && <FileText color="#3b82f6" />}
                    {doc.type === 'XLSX' && <FileSpreadsheet color="#10b981" />}
                    <div>
                      <div style={{ fontWeight: 500 }}>{doc.name}</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{doc.size}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>{doc.type}</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.user}`} alt={doc.user} style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f1f5f9' }} />
                    <span style={{ fontSize: '0.9rem' }}>{doc.user}</span>
                  </div>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>{doc.date}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  {doc.status === 'Completed' ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                      <CheckCircle size={14} /> Completed
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                      <Clock size={14} /> Processing
                    </span>
                  )}
                </td>
                <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>{doc.findings}</td>
                <td style={{ padding: '1.25rem 1.5rem' }}>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    background: doc.risk === 'Critical' ? '#fee2e2' : doc.risk === 'Medium' ? '#fef3c7' : '#f1f5f9',
                    color: doc.risk === 'Critical' ? '#dc2626' : doc.risk === 'Medium' ? '#d97706' : '#64748b'
                  }}>{doc.risk}</span>
                </td>
                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', color: '#94a3b8' }}>
                    <button style={{ background: 'none', color: 'inherit', cursor: 'pointer' }}><Eye size={18} /></button>
                    <button style={{ background: 'none', color: 'inherit', cursor: 'pointer' }}><Download size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.9rem' }}>
          <div>Showing 1 to 25 of 247 results</div>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>{'<'}</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor', borderRadius: '6px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>1</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>2</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>3</button>
            <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#fff', cursor: 'pointer' }}>{'>'}</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentLibrary;
