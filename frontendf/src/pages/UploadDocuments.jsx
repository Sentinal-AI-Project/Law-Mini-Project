import React, { useState, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Info, UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, Play, X } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

const UploadDocuments = () => {
  const [uploadedFiles, setUploadedFiles] = useState([
    { id: 1, name: 'privacy_policy_2024.pdf', size: '2.4 MB', type: 'Policy Document', status: 'Completed', progress: 100 },
    { id: 2, name: 'vendor_contract_acme.docx', size: '1.8 MB', type: 'Contract', status: 'In Progress', progress: 65 },
    { id: 3, name: 'large_file.xlsx', size: '12 MB', type: 'Spreadsheet', status: 'Error', progress: 0, error: 'File size exceeds 10MB limit' }
  ]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = files.map(file => ({
      id: Math.random(),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
      type: 'Document',
      status: 'Completed',
      progress: 100
    }));
    setUploadedFiles(prev => [...newFiles, ...prev]);
  };

  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newFiles = files.map(file => ({
        id: Math.random(),
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        type: 'Document',
        status: 'Completed',
        progress: 100
      }));
      setUploadedFiles(prev => [...newFiles, ...prev]);
    }
  };

  const removeFile = (id) => setUploadedFiles(prev => prev.filter(f => f.id !== id));

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
            <button className="btn btn-primary" style={{ background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} fill="currentColor" /> Run Analysis
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
            <CustomDropdown options={['Select Framework', 'SOC 2', 'GDPR', 'HIPAA', 'ISO 27001']} width="100%" />
          </div>

          <div 
            className="card" 
            style={{ background: '#fff', border: '1px dashed #cbd5e1', padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
             <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />
             <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
               <UploadCloud size={32} color="#64748b" />
             </div>
             <h3 style={{ fontSize: '1.25rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 600 }}>Drop files here or click to upload</h3>
             <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>Support for contracts, invoices, emails, and policies</p>
             <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 600 }}>
               <span>PDF</span><span>DOCX</span><span>TXT</span><span>MSG</span>
             </div>
          </div>

          {/* Uploaded Files List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {uploadedFiles.map(file => {
              if (file.status === 'Completed') {
                return (
                  <div key={file.id} style={{ background: '#ecfdf5', border: '1px solid #d1fae5', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FileText size={20} />
                       </div>
                       <div>
                         <div style={{ fontWeight: 600, color: '#065f46', fontSize: '0.95rem' }}>{file.name}</div>
                         <div style={{ fontSize: '0.8rem', color: '#059669' }}>{file.size} • {file.type}</div>
                       </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#059669', fontWeight: 500 }}>
                         <CheckCircle2 size={16} /> Uploaded
                       </span>
                       <X size={16} color="#059669" style={{ cursor: 'pointer' }} onClick={() => removeFile(file.id)} />
                     </div>
                  </div>
                );
              }
              if (file.status === 'In Progress') {
                return (
                  <div key={file.id} style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FileText size={20} />
                       </div>
                       <div>
                         <div style={{ fontWeight: 600, color: '#1e3a8a', fontSize: '0.95rem' }}>{file.name}</div>
                         <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>{file.size} • {file.type}</div>
                       </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '200px' }}>
                       <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                         <div style={{ width: '100%', height: '6px', background: '#dbeafe', borderRadius: '3px', overflow: 'hidden' }}>
                           <div style={{ width: `${file.progress}%`, height: '100%', background: '#2563eb' }}></div>
                         </div>
                         <span style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 600 }}>{file.progress}%</span>
                       </div>
                     </div>
                  </div>
                );
              }
              if (file.status === 'Error') {
                return (
                  <div key={file.id} style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <FileText size={20} />
                       </div>
                       <div>
                         <div style={{ fontWeight: 600, color: '#991b1b', fontSize: '0.95rem' }}>{file.name}</div>
                         <div style={{ fontSize: '0.8rem', color: '#dc2626' }}>{file.error}</div>
                       </div>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', color: '#dc2626', fontWeight: 500 }}>
                         <AlertTriangle size={16} /> Error
                       </span>
                       <X size={16} color="#dc2626" style={{ cursor: 'pointer' }} onClick={() => removeFile(file.id)} />
                     </div>
                  </div>
                );
              }
              return null;
            })}

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
