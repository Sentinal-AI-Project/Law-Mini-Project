import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink, DownloadCloud, X } from 'lucide-react';
import { findingsAPI, docsAPI } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useComplianceData } from '../hooks/useComplianceData';

const severityColor = (s) => {
  const lowS = (s || 'low').toLowerCase();
  if (lowS === 'critical' || lowS === 'high') return { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--accent-red)' };
  if (lowS === 'medium') return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--accent-orange)' };
  return { bg: 'rgba(11, 220, 181, 0.1)', text: 'var(--accent-teal)' };
};

const Findings = () => {
  const { refetch } = useComplianceData(0); // Only for refetch, disable polling here
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRisk, setActiveRisk] = useState('All');
  const [selectedFindingId, setSelectedFindingId] = useState(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showRemediation, setShowRemediation] = useState(false);

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
        const params = { min_confidence: 0.1, limit: 1000 };
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

  const [generatingFix, setGeneratingFix] = useState(false);

  const handleGenerateFix = async () => {
    if (!selectedFindingId) return;
    setGeneratingFix(true);
    try {
      const data = await findingsAPI.generateFix(selectedFindingId);
      const newFix = data.suggested_fix;
      
      // Update local state
      setFindings(prev => prev.map(f => 
        f._id === selectedFindingId ? { ...f, suggested_fix: newFix } : f
      ));
      
      setShowRemediation(true);
    } catch (err) {
      console.error('Failed to generate fix', err);
      window.alert('Failed to generate AI remediation. Please try again.');
    } finally {
      setGeneratingFix(false);
    }
  };

  const activeFinding = findings.find(f => f._id === selectedFindingId) || null;

  const handleToggleReview = async () => {
    if (!selectedFindingId) return;
    const isReviewed = activeFinding.status === 'reviewed';
    const newStatus = isReviewed ? 'pending' : 'reviewed';
    
    setFindings(prev => prev.map(f => f._id === selectedFindingId ? { ...f, status: newStatus } : f));
    
    try {
      await findingsAPI.update(selectedFindingId, { status: newStatus });
      // Refresh global stats so dashboard/executive summary updates immediately
      if (refetch) refetch();
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

  const handleExportPdf = () => {
    if (!findings.length) return;
    
    const doc = new jsPDF();
    const docName = docs.find(d => d.id === selectedDocId || d._id === selectedDocId)?.filename || 'All_Documents';
    
    // Header
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SENTINEL LAW', 20, 25);
    doc.setFontSize(10);
    doc.text('COMPLIANCE FINDINGS EXPORT', 20, 32);
    
    // Summary Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Compliance Findings Details', 20, 55);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Source: ${docName}`, 20, 65);
    doc.text(`Total Findings: ${findings.length}`, 20, 72);
    doc.text(`Export Date: ${new Date().toLocaleString()}`, 20, 79);
    
    // Findings Table
    const tableData = findings.map((f, i) => [
      i + 1,
      f.severity.toUpperCase(),
      f.risk_type || 'General',
      f.description,
      f.status || 'pending'
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [['#', 'Severity', 'Type', 'Description', 'Status']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 8, cellPadding: 3 }
    });
    
    doc.save(`Sentinel_Findings_${docName.replace(/\.[^/.]+$/, "")}.pdf`);
  };

  const handleExportCsv = () => {
    if (!findings.length) return;
    const headers = 'ID,Severity,Description,Type,Confidence,Status,Created At\n';
    const csvContent = findings.map(f => {
      const desc = (f.description || '').replace(/"/g, '""');
      return `"${f._id}","${f.severity}","${desc}","${f.risk_type}",${f.confidence},"${f.status}","${f.created_at}"`;
    }).join('\n');
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'compliance_findings_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
             <div style={{ display: 'flex', gap: '0.5rem' }}>
               <button onClick={handleExportPdf} style={{ background: 'var(--bg-card-hover)', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--accent-blue)', fontSize: '0.8rem' }}>
                  <DownloadCloud size={14} /> Export PDF
               </button>
               <button onClick={handleExportCsv} style={{ background: 'var(--bg-card-hover)', border: 'none', padding: '0.4rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  <DownloadCloud size={14} /> CSV
               </button>
             </div>
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
                        <span style={{ color: 'var(--accent-blue)', fontWeight: 600, flexShrink: 0 }}>
                          {finding.policy_ref_id?.framework || finding.risk_type || 'General'}
                        </span>
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
                  <h1 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.75rem', fontWeight: 500, textAlign: 'justify' }}>{activeFinding.description || 'Finding'}</h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textAlign: 'justify', lineHeight: 1.6 }}>{activeFinding.explanation || 'Detailed analysis of human-readable explanation of risk.'}</p>
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
                  <div style={{ background: 'var(--bg-card-hover)', padding: '1.25rem', borderRadius: '8px', border: '1px solid #fef08a', color: 'var(--text-main)', lineHeight: 1.6, textAlign: 'justify', fontSize: '0.9rem' }}>
                    "{activeFinding.evidence_snippet || activeFinding.clause_id?.clause_text}"
                  </div>
                  
                  {activeFinding.suggested_fix ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: '1.5rem' }}
                    >
                      <button 
                        onClick={() => setShowRemediation(!showRemediation)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          padding: '0.75rem 1.25rem', 
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: 'pointer', 
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        <MessageSquare size={18} />
                        {showRemediation ? 'Hide Suggested Fix' : 'View AI Suggested Fix'}
                      </button>

                      <AnimatePresence>
                        {showRemediation && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            style={{ overflow: 'hidden' }}
                          >
                            <div style={{ 
                              marginTop: '1rem', 
                              background: '#f8fafc', 
                              border: '1px solid #e2e8f0', 
                              borderRadius: '12px', 
                              padding: '1.5rem',
                              position: 'relative',
                              borderLeft: '4px solid #8b5cf6'
                            }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ color: '#4f46e5', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                  ✨ Recommended Compliant Clause
                                </h4>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(activeFinding.suggested_fix);
                                  }}
                                  style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                >
                                  Copy to Clipboard
                                </button>
                              </div>
                              <p style={{ color: '#1e293b', lineHeight: 1.7, fontSize: '0.95rem', fontStyle: 'italic', background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                                {activeFinding.suggested_fix}
                              </p>
                              <p style={{ marginTop: '1rem', color: '#64748b', fontSize: '0.8rem' }}>
                                <b>Note:</b> This suggestion is AI-generated based on best practices. Please review with your legal team before applying.
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{ marginTop: '1.5rem' }}
                    >
                      <button 
                        onClick={handleGenerateFix}
                        disabled={generatingFix}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '0.75rem', 
                          padding: '0.75rem 1.25rem', 
                          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', 
                          color: '#fff', 
                          border: 'none', 
                          borderRadius: '8px', 
                          cursor: generatingFix ? 'not-allowed' : 'pointer', 
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          opacity: generatingFix ? 0.7 : 1
                        }}
                        onMouseOver={(e) => !generatingFix && (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseOut={(e) => !generatingFix && (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        {generatingFix ? (
                          <>
                            <div className="spinner" style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            Generating AI Fix...
                          </>
                        ) : (
                          <>
                            <MessageSquare size={18} />
                            Generate AI Sample Clause
                          </>
                        )}
                      </button>
                      <style>{`
                        @keyframes spin {
                          to { transform: rotate(360deg); }
                        }
                      `}</style>
                    </motion.div>
                  )}
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
                      {(activeFinding.policy_ref_id?.framework || activeFinding.risk_type || 'Compliance')} guidelines for security and processing.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: 'var(--accent-blue)' }}>
                      <span>Framework: {activeFinding.policy_ref_id?.framework || activeFinding.risk_type || 'General'}</span>
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
