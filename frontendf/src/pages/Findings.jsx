import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink } from 'lucide-react';
import { findingsAPI } from '../services/api';

const severityColor = (s) => {
  const lowS = (s || 'low').toLowerCase();
  if (lowS === 'critical' || lowS === 'high') return { bg: '#fee2e2', text: '#dc2626' };
  if (lowS === 'medium') return { bg: '#fef3c7', text: '#d97706' };
  return { bg: '#ecfdf5', text: '#059669' };
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
  const [reviewedIds, setReviewedIds] = useState([]);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const data = await findingsAPI.list();
        const results = data.findings || [];
        setFindings(results);
        if (results.length > 0) {
          setSelectedFindingId(results[0]._id);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, []);

  const activeFinding = findings.find(f => f._id === selectedFindingId) || null;

  const handleToggleReview = () => {
    if (!selectedFindingId) return;
    setReviewedIds(prev => prev.includes(selectedFindingId) ? prev.filter(id => id !== selectedFindingId) : [...prev, selectedFindingId]);
  };

  const handleAddNote = () => {
    if (!noteText.trim() || !selectedFindingId) return;
    // In a real app we'd call an API here
    window.alert('Note saved in demo mode.');
    setNoteText('');
    setShowNoteInput(false);
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
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" 
                placeholder="Search findings..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} 
              />
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
                      background: isActive ? colors.bg : '#f1f5f9', 
                      color: isActive ? colors.text : '#64748b', 
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
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <p style={{ padding: '1.5rem', color: '#94a3b8' }}>Loading findings…</p>
            ) : error ? (
              <p style={{ padding: '1.5rem', color: '#dc2626' }}>{error}</p>
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
                      background: isSelected ? '#f8fafc' : '#fff', 
                      borderLeft: `4px solid ${colors.text}` 
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                      <span style={{ color: colors.text, textTransform: 'capitalize' }}>{finding.severity}</span>
                      <span style={{ color: '#64748b' }}>{finding.confidence != null ? (finding.confidence * 100).toFixed(0) + '%' : '—'}</span>
                    </div>
                    <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>{finding.description || 'Finding'}</h4>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                      <span style={{ color: '#3b82f6', fontWeight: 500 }}>{finding.policy_ref_id?.framework || '—'}</span>
                      <span style={{ color: '#94a3b8' }}>{finding.created_at ? new Date(finding.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>No findings match your filters.</div>
            )}
          </div>
        </div>

        {/* Right Side - Finding Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', overflowY: 'auto' }}>
          {!activeFinding ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
              Select a finding to view details.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <span style={{ color: severityColor(activeFinding.severity).text, fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{activeFinding.severity}</span>
                    <span style={{ color: '#475569', fontSize: '0.9rem' }}>Confidence: <span style={{ fontWeight: 700 }}>{activeFinding.confidence != null ? (activeFinding.confidence * 100).toFixed(0) : '—'}%</span></span>
                    {reviewedIds.includes(activeFinding._id) && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <Check size={14} /> Reviewed
                      </span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '0.5rem' }}>{activeFinding.description || 'Finding'}</h1>
                  <p style={{ color: '#475569', fontSize: '1rem' }}>{activeFinding.explanation || 'Detailed analysis of human-readable explanation of risk.'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => setShowNoteInput(!showNoteInput)} 
                    className="btn btn-outline" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', background: '#f1f5f9', border: 'none', cursor: 'pointer' }}
                  >
                    <MessageSquare size={18} /> Add Note
                  </button>
                  <button 
                    onClick={handleToggleReview} 
                    className="btn btn-primary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: reviewedIds.includes(activeFinding._id) ? '#10b981' : '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
                  >
                    <Check size={18} /> 
                    {reviewedIds.includes(activeFinding._id) ? 'Reviewed' : 'Mark as Reviewed'}
                  </button>
                </div>
              </div>

              {(activeFinding.evidence_snippet || activeFinding.clause_id?.clause_text) && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Identified Risk Clause</h3>
                  <div style={{ background: '#fef9c3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef08a', color: '#422006', lineHeight: 1.6 }}>
                    "{activeFinding.evidence_snippet || activeFinding.clause_id?.clause_text}"
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Evidence</h3>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                    <AlertTriangle size={20} color={severityColor(activeFinding.severity).text} style={{ flexShrink: 0 }} />
                    <div>
                      <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1rem' }}>Evidence Trace</h4>
                      <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem' }}>The system has identified specific matches within the document related to {activeFinding.risk_type || 'compliance issues'}.</p>
                      {activeFinding.evidence_snippet && (
                         <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500, fontStyle: 'italic' }}>Snippet: "{activeFinding.evidence_snippet.substring(0, 150)}..."</div>
                      )}
                      <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>Confidence Score: {activeFinding.confidence ? (activeFinding.confidence * 100).toFixed(1) + '%' : '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {showNoteInput && (
                <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                  <textarea 
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter your investigation notes or remediation details here..."
                    style={{ width: '100%', height: '100px', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '1rem', resize: 'vertical' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button onClick={() => setShowNoteInput(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontWeight: 500 }}>Cancel</button>
                    <button onClick={handleAddNote} style={{ padding: '0.5rem 1rem', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>Save Note</button>
                  </div>
                </div>
              )}

              {activeFinding.policy_ref_id && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Legal Reference</h3>
                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: '#1e40af', fontSize: '1rem', fontWeight: 600 }}>{activeFinding.policy_ref_id.name}</h4>
                      <ExternalLink size={16} color="#3b82f6" />
                    </div>
                    <p style={{ color: '#1e3a8a', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                      {activeFinding.policy_ref_id.framework} guidelines for security and processing.
                    </p>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#2563eb' }}>
                      <span>Framework: {activeFinding.policy_ref_id.framework}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Findings;
