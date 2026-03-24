import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink } from 'lucide-react';
import { findingsAPI } from '../services/api';

const severityColor = (s) => {
  if (s === 'critical') return { bg: '#fee2e2', text: '#dc2626' };
  if (s === 'high') return { bg: '#fef3c7', text: '#d97706' };
  if (s === 'medium') return { bg: '#eff6ff', text: '#2563eb' };
  return { bg: '#ecfdf5', text: '#059669' };
};

const Findings = () => {
  const [findings, setFindings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [reviewedIds, setReviewedIds] = useState([]);

  useEffect(() => {
    const fetchFindings = async () => {
      try {
        const params = {};
        if (severityFilter) params.severity = severityFilter;
        const data = await findingsAPI.list(params);
        setFindings(data.findings || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFindings();
  }, [severityFilter]);

  const filtered = findings.filter((f) =>
    f.description?.toLowerCase().includes(search.toLowerCase()) ||
    f.severity?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddNote = () => {
    if (!selected) return;
    const note = window.prompt('Add a note for this finding:');
    if (note) {
      window.alert('Note saved in demo mode.');
    }
  };

  const handleMarkReviewed = () => {
    if (!selected) return;
    setReviewedIds((prev) => (prev.includes(selected._id) ? prev : [...prev, selected._id]));
  };

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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['high', 'medium', 'low'].map((s) => {
                const c = severityColor(s);
                const active = severityFilter === s;
                return (
                  <button
                    key={s}
                    onClick={() => setSeverityFilter(active ? '' : s)}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: active ? 600 : 500, background: active ? c.bg : '#f1f5f9', color: active ? c.text : '#64748b', border: 'none', cursor: 'pointer' }}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)} Risk
                  </button>
                );
              })}
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && <p style={{ padding: '1.5rem', color: '#94a3b8' }}>Loading findings…</p>}
            {!loading && error && <p style={{ padding: '1.5rem', color: '#dc2626' }}>{error}</p>}
            {!loading && !error && filtered.length === 0 && (
              <p style={{ padding: '1.5rem', color: '#94a3b8' }}>No findings yet.</p>
            )}
            {!loading && filtered.map((finding) => {
              const c = severityColor(finding.severity);
              const isActive = selected?._id === finding._id;
              return (
                <div
                  key={finding._id}
                  onClick={() => setSelected(finding)}
                  style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', borderLeft: `4px solid ${c.text}`, cursor: 'pointer', background: isActive ? '#f8fafc' : '#fff' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                    <span style={{ color: c.text, textTransform: 'capitalize' }}>{finding.severity}</span>
                    <span style={{ color: '#64748b' }}>{finding.confidence != null ? (finding.confidence * 100).toFixed(0) + '%' : '—'}</span>
                  </div>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>{finding.description || 'Finding'}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 500 }}>{finding.policy_ref_id?.framework || '—'}</span>
                    <span style={{ color: '#94a3b8' }}>{finding.created_at ? new Date(finding.created_at).toLocaleDateString() : '—'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Finding Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', overflowY: 'auto' }}>
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: '#94a3b8' }}>
              Select a finding to view details.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                    <span style={{ color: severityColor(selected.severity).text, fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{selected.severity}</span>
                    {selected.confidence != null && (
                      <span style={{ color: '#475569', fontSize: '0.9rem' }}>Confidence: <span style={{ fontWeight: 700 }}>{(selected.confidence * 100).toFixed(0)}%</span></span>
                    )}
                    {reviewedIds.includes(selected._id) && (
                      <span style={{ color: '#059669', fontWeight: 600, fontSize: '0.85rem' }}>Reviewed</span>
                    )}
                  </div>
                  <h1 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '0.5rem' }}>{selected.description || 'Finding'}</h1>
                  {selected.explanation && <p style={{ color: '#64748b', fontSize: '1rem' }}>{selected.explanation}</p>}
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={handleAddNote} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', background: '#f1f5f9', border: 'none' }}>
                    <MessageSquare size={18} /> Add Note
                  </button>
                  <button onClick={handleMarkReviewed} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: reviewedIds.includes(selected._id) ? '#059669' : '#2563eb', color: '#fff' }}>
                    <Check size={18} /> {reviewedIds.includes(selected._id) ? 'Reviewed' : 'Mark as Reviewed'}
                  </button>
                </div>
              </div>

              {selected.clause_id?.clause_text && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Identified Risk Clause</h3>
                  <div style={{ background: '#fef9c3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef08a', color: '#422006', lineHeight: 1.6 }}>
                    "{selected.clause_id.clause_text}"
                  </div>
                </div>
              )}

              {selected.policy_ref_id && (
                <div>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Legal Reference</h3>
                  <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ color: '#1e40af', fontSize: '1rem', fontWeight: 600 }}>{selected.policy_ref_id.name}</h4>
                      <ExternalLink size={16} color="#3b82f6" />
                    </div>
                    <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#2563eb' }}>
                      <span>Framework: {selected.policy_ref_id.framework}</span>
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
