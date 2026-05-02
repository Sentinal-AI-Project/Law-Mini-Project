import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Info, UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, Play, X } from 'lucide-react';
import { docsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UploadDocuments = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]); // [{ file, status, docId, error, progress }]
  const [analyzing, setAnalyzing] = useState(false);
  const [historyDocs, setHistoryDocs] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await docsAPI.list({ limit: 4 });
        if (res.documents) setHistoryDocs(res.documents);
      } catch (err) {
        console.error('Failed to fetch history', err);
      }
    };
    fetchHistory();
  }, []);

  const handleFileChange = async (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'application/msword', 
      'text/plain', 
      'text/csv'
    ];

    const validFiles = [];
    const errors = [];

    selected.forEach(f => {
      if (f.size > MAX_SIZE) {
        errors.push(`${f.name}: File is too large (max 10MB)`);
      } else if (!ALLOWED_TYPES.includes(f.type) && !f.name.match(/\.(pdf|docx|doc|txt|csv)$/i)) {
        errors.push(`${f.name}: Unsupported file type`);
      } else {
        validFiles.push(f);
      }
    });

    if (errors.length) {
      window.alert(errors.join('\n'));
    }

    if (!validFiles.length) return;

    const newEntries = validFiles.map((f) => ({ 
      file: f, 
      status: 'uploading', 
      docId: null, 
      error: null, 
      progress: 0,
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: 'Document'
    }));
    setFiles((prev) => [...newEntries, ...prev]);

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      const fileName = `${Date.now()}-${file.name}`;
      
      try {
        const docTypeMapping = 'contract';
        const frameworksArr = [];

        // Upload and register via the Backend securely
        const data = await docsAPI.upload(file, docTypeMapping, frameworksArr);

        setFiles((prev) =>
          prev.map((entry) =>
            entry.file === file ? { ...entry, status: 'uploaded', docId: data.docId, progress: 100 } : entry
          )
        );
        
        // Refresh local history
        const res = await docsAPI.list({ limit: 4 });
        if (res.documents) setHistoryDocs(res.documents);

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

  const handleViewReport = () => navigate('/reports');
  const handleDownload = () => {
    const blob = new Blob(['Demo download content for upload history item.'], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'upload-history-report.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRetryAnalysis = () => {
    window.alert('Retry queued in demo mode.');
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: e.dataTransfer.files } });
    }
  };

  const statusIcon = (entry) => {
    if (entry.status === 'uploaded' || entry.status === 'analyzing' || entry.status === 'analyzed') return <CheckCircle2 size={16} />;
    if (entry.status === 'error' || entry.status === 'failed') return <AlertTriangle size={16} />;
    return <AlertCircle size={16} />;
  };

  const statusColor = (entry) => {
    if (entry.status === 'uploaded' || entry.status === 'analyzed') return 'var(--accent-teal)';
    if (entry.status === 'analyzing') return 'var(--accent-blue)';
    if (entry.status === 'error' || entry.status === 'failed') return 'var(--accent-red)';
    return 'var(--accent-orange)';
  };

  const statusLabel = (entry) => {
    if (entry.status === 'uploading') return 'Uploading…';
    if (entry.status === 'uploaded') return 'Uploaded';
    if (entry.status === 'analyzing') return 'Analyzing';
    if (entry.status === 'analyzed') return 'Completed';
    if (entry.status === 'error' || entry.status === 'failed') return entry.error || 'Error';
    return entry.status || 'Pending';
  };

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '2rem' }}>
        
        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Upload Documents</h1>
              <p style={{ color: 'var(--text-muted)' }}>Upload documents for compliance analysis</p>
            </div>
            <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={analyzing || !files.some((f) => f.status === 'uploaded')} style={{ background: 'var(--accent-blue)', color: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: analyzing || !files.some((f) => f.status === 'uploaded') ? 0.7 : 1 }}>
              <Play size={18} fill="currentColor" /> {analyzing ? 'Analyzing…' : 'Run Analysis'}
            </button>
          </div>

          <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Info size={20} color="#2563eb" />
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-blue)' }}>
              <span style={{ fontWeight: 700 }}>Note:</span> Documents are ingested in read-only mode. Your files will be analyzed for compliance without any modifications.
            </span>
          </div>



          <div 
            className="card" 
            style={{ background: 'var(--bg-card)', border: '1px dashed #cbd5e1', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
             <input type="file" multiple ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.txt,.csv" />
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <UploadCloud size={32} color="#64748b" />
             </div>
             <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.5rem', fontWeight: 600 }}>Drop files here or click to upload</h3>
             <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Support for contracts, invoices, emails, and policies</p>
             <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
               <span>PDF</span><span>DOCX</span><span>TXT</span><span>CSV</span>
             </div>
          </div>

          {/* Uploaded Files List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {files.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No files selected yet.</p>
            )}
            {files.map((entry, idx) => (
              <div key={idx} style={{ background: entry.status === 'error' ? 'rgba(239, 68, 68, 0.1)' : entry.status === 'uploading' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(11, 220, 181, 0.1)', border: `1px solid ${entry.status === 'error' ? 'rgba(239, 68, 68, 0.15)' : entry.status === 'uploading' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(11, 220, 181, 0.15)'}`, borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: entry.status === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(11, 220, 181, 0.15)', color: statusColor(entry), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{entry.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{entry.size} • {entry.type}</div>
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
           <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Upload History</h3>
           
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             
             {historyDocs.length === 0 && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No recent uploads.</div>
             )}

             {historyDocs.map((doc) => (
               <div key={doc.id || doc._id} className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{doc.filename || doc.name}</div>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', background: doc.status === 'analyzed' ? 'rgba(11, 220, 181, 0.1)' : doc.status === 'failed' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.1)', color: statusColor(doc), borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {statusIcon(doc)} <span style={{ textTransform: 'capitalize' }}>{statusLabel(doc)}</span>
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>Uploaded {new Date(doc.uploaded_at || doc.created_at).toLocaleDateString()}</div>
                  {doc.status === 'uploading' && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div style={{ width: '60%', height: '100%', background: 'var(--accent-blue)' }}></div>
                    </div>
                  )}
                  {(doc.status === 'analyzing' || doc.status === 'pending') && (
                    <div style={{ width: '100%', height: '4px', background: 'var(--border-color)', borderRadius: '2px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <div style={{ width: '85%', height: '100%', background: 'var(--accent-orange)', animation: 'pulse 2s infinite' }}></div>
                    </div>
                  )}

                  {doc.status === 'failed' && (
                    <>
                      <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', marginBottom: '1rem' }}>Failed to process</div>
                      <button onClick={handleRetryAnalysis} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer' }}>Retry Analysis</button>
                    </>
                  )}
                  {doc.status === 'analyzed' && (
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                      <button onClick={handleViewReport} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontWeight: 500, cursor: 'pointer' }}>View Report</button>
                      <button onClick={handleDownload} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 500, cursor: 'pointer' }}>Download</button>
                    </div>
                  )}
               </div>
             ))}
             
             <button onClick={() => navigate('/library')} style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', border: 'none', background: 'none', color: 'var(--accent-blue)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>
               View All History
             </button>

           </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default UploadDocuments;
