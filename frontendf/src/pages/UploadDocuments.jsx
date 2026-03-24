import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Info, UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, Play, X } from 'lucide-react';
import { docsAPI } from '../services/api';

const UploadDocuments = () => {
  const [framework, setFramework] = useState('');
  const [files, setFiles] = useState([]); // [{ file, status, docId, error, progress }]
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newEntries = selected.map((f) => ({ file: f, status: 'uploading', docId: null, error: null, progress: 0 }));
    setFiles((prev) => [...prev, ...newEntries]);

    for (let i = 0; i < selected.length; i++) {
      const file = selected[i];
      try {
        const data = await docsAPI.upload(file, 'contract');
        setFiles((prev) =>
          prev.map((entry) =>
            entry.file === file ? { ...entry, status: 'uploaded', docId: data.docId, progress: 100 } : entry
          )
        );
      } catch (err) {
        setFiles((prev) =>
          prev.map((entry) =>
            entry.file === file ? { ...entry, status: 'error', error: err.message } : entry
          )
        );
      }
    }
  };

  const handleRunAnalysis = async () => {
    const uploadedDocs = files.filter((f) => f.status === 'uploaded' && f.docId);
    if (!uploadedDocs.length) return;
    setAnalyzing(true);
    try {
      await Promise.all(uploadedDocs.map((f) => docsAPI.analyze(f.docId)));
      setFiles((prev) =>
        prev.map((entry) =>
          entry.status === 'uploaded' ? { ...entry, status: 'analyzing' } : entry
        )
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const statusIcon = (entry) => {
    if (entry.status === 'uploaded' || entry.status === 'analyzing') return <CheckCircle2 size={16} />;
    if (entry.status === 'error') return <AlertTriangle size={16} />;
    return <AlertCircle size={16} />;
  };

  const statusColor = (entry) => {
    if (entry.status === 'uploaded') return '#059669';
    if (entry.status === 'analyzing') return '#2563eb';
    if (entry.status === 'error') return '#dc2626';
    return '#d97706';
  };

  const statusLabel = (entry) => {
    if (entry.status === 'uploading') return 'Uploading…';
    if (entry.status === 'uploaded') return 'Uploaded';
    if (entry.status === 'analyzing') return 'Analyzing';
    if (entry.status === 'error') return entry.error || 'Error';
    return entry.status;
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: '#1e293b' }}>Upload Documents</h1>
              <p style={{ color: 'var(--text-muted)' }}>Upload documents for compliance analysis</p>
            </div>
            <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={analyzing || !files.some((f) => f.status === 'uploaded')} style={{ background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: analyzing ? 0.7 : 1 }}>
              <Play size={18} fill="currentColor" /> {analyzing ? 'Analyzing…' : 'Run Analysis'}
            </button>
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Info size={20} color="#2563eb" />
            <span style={{ fontSize: '0.9rem', color: '#1e3a8a' }}>
              <span style={{ fontWeight: 700 }}>Note:</span> Documents are ingested in read-only mode. Your files will be analyzed for compliance without any modifications.
            </span>
          </div>

          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 600, color: '#1e293b', fontSize: '1.1rem' }}>Compliance Framework</label>
            <select
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.95rem', color: '#475569' }}
            >
               <option value="">Select Framework</option>
               <option value="SOC 2">SOC 2</option>
               <option value="GDPR">GDPR</option>
               <option value="HIPAA">HIPAA</option>
               <option value="ISO 27001">ISO 27001</option>
            </select>
          </div>

          <div
            className="card"
            onClick={() => fileInputRef.current?.click()}
            style={{ background: '#fff', border: '1px dashed #cbd5e1', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
          >
             <input ref={fileInputRef} type="file" multiple accept=".pdf,.doc,.docx,.txt,.csv" style={{ display: 'none' }} onChange={handleFileChange} />
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <UploadCloud size={32} color="#64748b" />
             </div>
             <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 600 }}>Drop files here or click to upload</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Support for contracts, invoices, emails, and policies</p>
             <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
               <span>PDF</span><span>DOCX</span><span>TXT</span><span>CSV</span>
             </div>
          </div>

          {/* Uploaded Files List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {files.length === 0 && (
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center' }}>No files selected yet.</p>
            )}
            {files.map((entry, idx) => (
              <div key={idx} style={{ background: entry.status === 'error' ? '#fef2f2' : entry.status === 'uploading' ? '#fffbeb' : '#ecfdf5', border: `1px solid ${entry.status === 'error' ? '#fee2e2' : entry.status === 'uploading' ? '#fde68a' : '#d1fae5'}`, borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: entry.status === 'error' ? '#fee2e2' : '#d1fae5', color: statusColor(entry), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{entry.file.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{(entry.file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: statusColor(entry), fontWeight: 500 }}>
                    {statusIcon(entry)} {statusLabel(entry)}
                  </span>
                  <X size={16} color="#94a3b8" style={{ cursor: 'pointer' }} onClick={() => removeFile(idx)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Sidebar - Upload History */}
        <div style={{ width: '380px', flexShrink: 0 }}>
           <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '1.5rem' }}>Upload History</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             {/* History Item 1 */}
             <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>GDPR Analysis #1247</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> Completed
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>3 documents • 2 hours ago</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}>View Report</button>
                  <button style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>Download</button>
                </div>
             </div>

             {/* History Item 2 */}
             <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>HIPAA Analysis #1248</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fef3c7', color: '#d97706', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertCircle size={12} /> Analyzing
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>5 documents • Started 15 min ago</div>
                <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: '40%', height: '100%', background: '#2563eb' }}></div>
                </div>
             </div>

             {/* History Item 3 */}
             <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>SOX Analysis #1246</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#fee2e2', color: '#dc2626', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <AlertTriangle size={12} /> Error
                  </span>
                </div>
                <div style={{ color: '#dc2626', fontSize: '0.85rem', marginBottom: '1rem' }}>Failed to process corrupted files</div>
                <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>Retry Analysis</button>
             </div>

             {/* History Item 4 */}
             <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 600, color: '#1e293b' }}>Internal Policy #1245</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                    <CheckCircle2 size={12} /> Completed
                  </span>
                </div>
                <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>2 documents • Yesterday</div>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  <button style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 500, cursor: 'pointer' }}>View Report</button>
                  <button style={{ background: 'none', border: 'none', color: '#64748b', fontWeight: 500, cursor: 'pointer' }}>Download</button>
                </div>
             </div>
             
             <button style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', border: 'none', background: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
               View All History
             </button>

           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UploadDocuments;
