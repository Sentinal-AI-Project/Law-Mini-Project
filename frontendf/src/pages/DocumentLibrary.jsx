import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Filter, Plus, FileText, FileSpreadsheet, Eye, Download, CheckCircle, Clock } from 'lucide-react';
import { docsAPI } from '../services/api';
import { Link } from 'react-router-dom';

const DocumentLibrary = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await docsAPI.list({ limit: 50 });
        setDocuments(data.documents || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const filtered = documents.filter((d) =>
    d.filename?.toLowerCase().includes(search.toLowerCase())
  );

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
               <input
                type="text"
                placeholder="Search by document name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
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
          <h2 style={{ fontSize: '1.25rem', color: '#1e293b' }}>Documents <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 'normal' }}>({filtered.length} total)</span></h2>
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
            {loading && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading documents…</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#dc2626' }}>{error}</td></tr>
            )}
            {!loading && !error && filtered.length === 0 && (
              <tr><td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No documents found. <Link to="/upload" style={{ color: '#2563eb' }}>Upload your first document.</Link></td></tr>
            )}
            {!loading && filtered.map((doc, idx) => (
               <tr key={doc._id || idx} style={{ borderBottom: '1px solid #e2e8f0', color: '#1e293b' }}>
                 <td style={{ padding: '1.25rem 1.5rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                     <FileText color="#ef4444" />
                     <div>
                       <div style={{ fontWeight: 500 }}>{doc.filename}</div>
                       <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{doc.doc_type}</div>
                     </div>
                   </div>
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem' }}>
                   <span style={{ padding: '0.25rem 0.5rem', background: '#f1f5f9', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                     {doc.filename?.split('.').pop()?.toUpperCase() || '—'}
                   </span>
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>—</td>
                 <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.9rem', color: '#475569' }}>
                   {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : '—'}
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem' }}>
                   {doc.status === 'analyzed' ? (
                     <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#ecfdf5', color: '#059669', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                       <CheckCircle size={14} /> Completed
                     </span>
                   ) : (
                     <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.75rem', background: '#fef3c7', color: '#d97706', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 500 }}>
                       <Clock size={14} /> {doc.status || 'Pending'}
                     </span>
                   )}
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500 }}>—</td>
                 <td style={{ padding: '1.25rem 1.5rem' }}>
                   <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: '#f1f5f9', color: '#64748b' }}>—</span>
                 </td>
                 <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                   <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', color: '#94a3b8' }}>
                     <button style={{ background: 'none', color: 'inherit', cursor: 'pointer' }}><Eye size={18} /></button>
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
