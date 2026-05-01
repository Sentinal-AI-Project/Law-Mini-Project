import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink, DownloadCloud, X } from 'lucide-react';
import { findingsAPI, docsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

const severityColor = (s) => {
  const lowS = (s || 'low').toLowerCase();
  if (lowS === 'critical' || lowS === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--accent-red)' };
  if (lowS === 'medium') return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--accent-orange)' };
  return { bg: 'rgba(11, 220, 181, 0.1)', text: 'var(--accent-teal)' };
};

const Findings = () => {
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRisk, setActiveRisk] = useState('All');
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState(searchParams.get('document_id') || 'All');

  useEffect(() => {
    const initData = async () => {
      try {
        const dData = await docsAPI.list({ limit: 50 });
        setDocs(dData.documents || []);
      } catch (err) {
        console.error('Failed to fetch docs', err);
      }
    };
    initData();
  }, []);

  useEffect(() => {
    const fetchFindings = async () => {
      setLoading(true);
      try {
        const params = { min_confidence: 0.1 };
        if (selectedDocId !== 'All') params.document_id = selectedDocId;
        
        const data = await findingsAPI.list(params);
        const results = data.findings || [];
        setFindings(results);
        if (results.length > 0) {
          setSelectedFindingId(results[0]._id);
        } else {
          setSelectedFindingId(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, [selectedDocId]);

  const activeFinding = findings.find(f => f._id === selectedFindingId) || null;

  const handleToggleReview = async () => {
    if (!selectedFindingId) return;
    const isReviewed = activeFinding.status === 'reviewed';
    const newStatus = isReviewed ? 'pending' : 'reviewed';
    
    setFindings(prev => prev.map(f => f._id === selectedFindingId ? { ...f, status: newStatus } : f));
    
    try {
      await findingsAPI.update(selectedFindingId, { status: newStatus });
    } catch (err) {
      setFindings(prev => prev.map(f => f._id === selectedFindingId ? { ...f, status: isReviewed ? 'reviewed' : 'pending' } : f));
      console.error('Failed to update status', err);
    }
  };

  const handleShowNoteModal = () => {
    setNoteText(activeFinding?.notes || '');
    setShowNoteInput(true);
  };

  const handleAddNote = async () => {
    if (!selectedFindingId) return;
    const currentNote = noteText.trim();
    
    setFindings(prev => prev.map(f => f._id === selectedFindingId ? { ...f, notes: currentNote } : f));
    setShowNoteInput(false);
    setNoteText('');
    
    try {
      await findingsAPI.update(selectedFindingId, { notes: currentNote });
    } catch (err) {
      console.error('Failed to persist note', err);
      // alert could be too intrusive but we want them to know
      // window.alert('Note saved locally but failed to reach database. Please check your connection.');
    }
  };

  const handleExportCsv = () => {
    if (!findings.length) return;
    const headers = 'ID,Severity,Description,Explanation,Type,Confidence,Notes,Status,Created At\n';
    const csvContent = findings.map(f => {
      const desc = (f.description || '').replace(/"/g, '""');
      const expl = (f.explanation || '').replace(/"/g, '""');
      const notes = (f.notes || '').replace(/"/g, '""');
      return `"${f._id}","${f.severity}","${desc}","${expl}","${f.risk_type}",${f.confidence},"${notes}","${f.status}","${f.created_at}"`;
    }).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'compliance_findings_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredFindings = findings.filter(f => {
    const matchesSearch = (f.description || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (f.severity || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = activeRisk === 'All' || f.severity?.toLowerCase() === activeRisk.toLowerCase();
    return matchesSearch && matchesRisk;
  });

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
        {/* Left Side - Findings List */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', fontWeight: 600 }}>Findings</h3>
             <button onClick={handleExportCsv} style={{ background: 'var(--bg-card-hover)', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                <DownloadCloud size={14} /> Export
             </button>
          </div>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                placeholder="Search findings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <select
                value={selectedDocId}
                onChange={(e) => setSelectedDocId(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--bg-card)', fontSize: '0.85rem', color: 'var(--text-main)' }}
              >
                <option value="All">All Documents</option>
                {docs.map(doc => (
                  <option key={doc._id} value={doc._id}>{doc.filename}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['High', 'Medium', 'Low'].map(risk => {
                const isActive = activeRisk === risk;
                const colors = severityColor(risk);
                return (
                  <button 
                    key={risk}
                    onClick={() => setActiveRisk(isActive ? 'All' : risk)} 
                    style={{ 
                      padding: '0.4rem 0.8rem', 
                      borderRadius: '20px', 
                      fontSize: '0.85rem', 
                      fontWeight: isActive ? 700 : 500, 
                      background: isActive ? colors.bg : 'var(--bg-card-hover)', 
                      color: isActive ? colors.text : 'var(--text-muted)', 
                      border: 'none', 
                      cursor: 'pointer', 
                      transition: 'all 0.2s ease' 
                    }}
                  >
                    {risk} Risk
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="custom-scrollbar scroll-container" style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ padding: '1.5rem', color: 'var(--text-muted)' }}>Loading findings…</p>
            ) : error ? (
              <p style={{ padding: '1.5rem', color: 'var(--accent-red)' }}>{error}</p>
            ) : filteredFindings.length > 0 ? (
              filteredFindings.map((finding) => {
                const colors = severityColor(finding.severity);
                const isSelected = finding._id === selectedFindingId;
                return (
                  <div 
                    key={finding._id} 
                    onClick={() => setSelectedFindingId(finding._id)}
                    style={{ 
                      padding: '1.25rem', 
                      borderBottom: '1px solid #e2e8f0', 
                      cursor: 'pointer', 
                      background: isSelected ? 'var(--bg-main)' : 'var(--bg-card)', 
                      borderLeft: `4px solid ${colors.text}` 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: colors.text, textTransform: 'capitalize' }}>{finding.severity}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{finding.confidence != null ? (finding.confidence * 100).toFixed(0) + '%' : '—'}</span>
                    </div>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '1rem' }}>{finding.description || 'Finding'}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', overflow: 'hidden' }}>
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 600, flexShrink: 0 }}>{finding.policy_ref_id?.framework || '—'}</span>
                        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>• {finding.document_id?.filename || 'Unknown Doc'}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>{finding.created_at ? new Date(finding.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>No findings match your filters.</div>
            )}
          </div>
        </div>

        {/* Right Side - Finding Details */}
        <div className="custom-scrollbar scroll-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', overflowY: 'auto' }}>
          {!activeFinding ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
              Select a finding to view details.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <span style={{ color: severityColor(activeFinding.severity).text, fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{activeFinding.severity}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Confidence: <span style={{ fontWeight: 700 }}>{activeFinding.confidence != null ? (activeFinding.confidence * 100).toFixed(0) : '—'}%</span></span>
                    {activeFinding.status === 'reviewed' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(11, 220, 181, 0.1)', color: 'var(--accent-teal)', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Check size={14} /> Reviewed
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>{activeFinding.description || 'Finding'}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>{activeFinding.explanation || 'Detailed analysis of human-readable explanation of risk.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={handleShowNoteModal} 
                    className="btn btn-outline" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', border: 'none', cursor: 'pointer' }}
                  >
                    <MessageSquare size={18} /> {activeFinding.notes ? 'Edit Note' : 'Add Note'}
                  </button>
                  <button 
                    onClick={handleToggleReview} 
                    className="btn btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeFinding.status === 'reviewed' ? 'var(--accent-teal)' : 'var(--accent-blue)', color: 'var(--bg-card)', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <Check size={18} /> 
                    {activeFinding.status === 'reviewed' ? 'Reviewed' : 'Mark as Reviewed'}
                  </button>
                </div>
              </div>

              {(activeFinding.evidence_snippet || activeFinding.clause_id?.clause_text) && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Identified Risk Clause</h3>
                  <div style={{ background: 'var(--bg-card-hover)', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef08a', color: 'var(--text-main)', lineHeight: 1.6 }}>
                    "{activeFinding.evidence_snippet || activeFinding.clause_id?.clause_text}"
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Evidence</h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={20} color={severityColor(activeFinding.severity).text} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1rem' }}>Evidence Trace</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1rem' }}>The system has identified specific matches within the document related to {activeFinding.risk_type || 'compliance issues'}.</p>
                      {activeFinding.evidence_snippet && (
                         <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500, fontStyle: 'italic' }}>Snippet: "{activeFinding.evidence_snippet.substring(0, 150)}..."</div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 500 }}>Confidence Score: {activeFinding.confidence ? (activeFinding.confidence * 100).toFixed(1) + '%' : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {activeFinding.notes && !showNoteInput && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--bg-card-hover)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
                  <h4 style={{ color: 'var(--text-main)', marginBottom: '0.5rem', fontSize: '1rem' }}>Investigation Note</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>{activeFinding.notes}</p>
                </div>
              )}

              <AnimatePresence>
                {showNoteInput && (
                  <>
                    <motion.div 
                      key="overlay"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      exit={{ opacity: 0 }}
                      style={{ position: 'fixed', inset: 0, background: 'var(--bg-main)', zIndex: 1000 }}
                      onClick={() => setShowNoteInput(false)}
                    />
                    <motion.div 
                      key="modal"
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      style={{ 
                        position: 'fixed', 
                        top: '50%', 
                        left: '50%', 
                        transform: 'translate(-50%, -50%)', 
                        width: '500px', 
                        background: 'var(--bg-card)', 
                        borderRadius: '12px', 
                        padding: '2rem', 
                        zIndex: 1001,
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', fontWeight: 600 }}>Investigation Note</h3>
                        <button onClick={() => setShowNoteInput(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}><X size={20} color="#64748b" /></button>
                      </div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Enter internal notes, remediation steps, or evidence for this finding.</p>
                      <textarea 
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Type your notes here..."
                        autoFocus
                        style={{ width: '100%', height: '150px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1.5rem', resize: 'none', fontSize: '0.95rem' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button onClick={() => setShowNoteInput(false)} style={{ padding: '0.6rem 1.25rem', background: 'var(--bg-card-hover)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, color: 'var(--text-muted)' }}>Cancel</button>
                        <button onClick={handleAddNote} style={{ padding: '0.6rem 1.25rem', background: 'var(--accent-blue)', color: 'var(--bg-card)', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Save Note</button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              {activeFinding.policy_ref_id && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem' }}>Legal Reference</h3>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: 'var(--accent-blue)', fontSize: '1rem', fontWeight: 600 }}>{activeFinding.policy_ref_id.name}</h4>
                      <ExternalLink size={16} color="#3b82f6" />
                    </div>
                    <p style={{ color: 'var(--accent-blue)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {activeFinding.policy_ref_id.framework} guidelines for security and processing.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
                      <span>Framework: {activeFinding.policy_ref_id.framework}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 4px;
          border: 2px solid #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* Ensure parents use the class */
        .scroll-container {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default Findings;
