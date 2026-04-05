import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  AlertCircle, Download, FileText, Shield,
  AlertTriangle, CheckCircle, Clock, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomDropdown from '../components/CustomDropdown';
import { complianceAPI } from '../services/api';
import { useComplianceData } from '../hooks/useComplianceData';
import {
  LineChart, Line, BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';


const WINDOW_DAYS = { '30D': 30, '90D': 90, '1Y': 365 };

// Custom tooltip for the line chart
const TrendTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '10px', padding: '0.75rem 1rem',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '0.85rem'
    }}>
      <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, background: p.color, borderRadius: '50%', display: 'inline-block' }} />
          <span>{p.name}: <strong>{p.value}%</strong></span>
        </div>
      ))}
    </div>
  );
};

const ExecutiveSummary = () => {
  const navigate = useNavigate();
  const [trendWindow, setTrendWindow] = useState('90D');
  const { stats, loading } = useComplianceData(0); // We will manually manage refresh for trends, or use 0 for no polling just on stats
  const [trendLoading, setTrendLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [trendData, setTrendData] = useState([]);

  const fetchTrends = useCallback(async () => {
    setTrendLoading(true);
    try {
      const days = WINDOW_DAYS[trendWindow] || 90;
      const res = await complianceAPI.trends(days);
      if (res?.trend) {
        // Downsample to max ~15 data points for readability
        const raw = res.trend;
        const step = Math.max(1, Math.floor(raw.length / 15));
        const sampled = raw.filter((_, i) => i % step === 0 || i === raw.length - 1);
        // Format date labels
        const formatted = sampled.map(d => ({
          ...d,
          label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        }));
        setTrendData(formatted);
      }
    } catch (err) {
      console.error('Trend fetch error:', err);
      setTrendData([]);
    } finally {
      setTrendLoading(false);
      setLastRefresh(new Date());
    }
  }, [trendWindow]);

  // Initial fetch
  useEffect(() => { fetchTrends(); }, [fetchTrends]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    fetchTrends();

    const interval = setInterval(() => {
      fetchTrends();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTrends]);

  const handleDownloadSummary = () => {
    const score = stats?.complianceScore || 0;
    const blob = new Blob(
      [`Sentinel Law — Executive Summary\nGenerated: ${new Date().toLocaleString()}\n\nOverall Risk Score: ${100 - score}/100\nCompliance Rate: ${score}%\nTotal Violations: ${stats?.totalFindings || 0}\nDocuments Processed: ${stats?.documents?.completed || 0}\n`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `executive-summary-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Determine if we have real trend data (any day with a non-zero reading)
  const hasTrendData = trendData.some(d => d.riskScore > 0 || d.complianceRate < 100);

  // Build bar chart data from findings by severity
  const severityData = (() => {
    if (!stats?.findings?.by_severity?.length) return [];
    const map = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const s of stats.findings.by_severity) { map[s._id] = s.count; }
    return [
      { name: 'Critical', count: map.critical, fill: '#dc2626' },
      { name: 'High', count: map.high, fill: '#f59e0b' },
      { name: 'Medium', count: map.medium, fill: '#3b82f6' },
      { name: 'Low', count: map.low, fill: '#10b981' },
    ].filter(d => d.count > 0);
  })();

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Executive Summary</h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Risk oversight and compliance monitoring
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              · Auto-refresh every 30s · Last: {lastRefresh.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => { fetchDashboard(); fetchTrends(); }}
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Refresh now"
          >
            <RefreshCw size={16} color="#64748b" />
          </button>
          <CustomDropdown options={['Last 90 Days', 'Last 30 Days', 'This Year']} width="160px" />
        </div>
      </div>

      {/* Critical alert banner */}
      {stats?.recent_critical?.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
              <AlertCircle size={32} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Critical Findings Alert</h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1rem' }}>{stats.recent_critical.length} high-priority compliance violations require immediate attention</p>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', fontWeight: 500 }}>
                {stats.recent_critical.slice(0, 3).map(f => (
                  <span key={f.id}>{f.risk_type}</span>
                ))}
              </div>
            </div>
          </div>
          <button onClick={() => navigate('/findings')} style={{ background: '#fff', color: '#dc2626', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Review Now</button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <button
          onClick={handleDownloadSummary}
          style={{
            flex: 1, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: '#fff', gap: '0.75rem', padding: '1rem', border: 'none', borderRadius: '12px',
            fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center',
            justifyContent: 'center', transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Download size={20} /> Download Executive Summary
        </button>
        <button
          onClick={() => navigate('/reports')}
          style={{
            flex: 1, background: '#fff', color: '#4f46e5', gap: '0.75rem', padding: '1rem',
            border: '2px solid #eef2ff', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = '#f5f3ff'; e.currentTarget.style.borderColor = '#c7d2fe'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#eef2ff'; }}
        >
          <FileText size={20} /> View Full Report
        </button>
      </div>

      {/* KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Overall Risk Score', value: loading ? '—' : `${100 - (stats?.complianceScore || 0)}`, suffix: '/100', icon: <Shield size={24} color="#3b82f6" />, bg: '#eff6ff' },
          { label: 'Open Violations', value: loading ? '—' : (stats?.totalFindings || 0), icon: <AlertTriangle size={24} color="#d97706" />, bg: '#fef3c7' },
          { label: 'Compliance Rate', value: loading ? '—' : `${stats?.complianceScore || 0}%`, icon: <CheckCircle size={24} color="#10b981" />, bg: '#ecfdf5' },
          { label: 'Documents Processed', value: loading ? '—' : (stats?.documents?.completed || 0), icon: <Clock size={24} color="#9333ea" />, bg: '#f3e8ff' },
        ].map(({ label, value, suffix, icon, bg }) => (
          <div key={label} className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: bg, padding: '10px', borderRadius: '8px' }}>{icon}</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>
                {value}<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>{suffix || ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Trends + Violations row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Trends Line Chart */}
        <div className="card" style={{ flex: 2, background: '#fff', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Risk Trends Over Time</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live daily risk trajectory analysis</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: '#f8fafc', padding: '0.25rem', borderRadius: '8px' }}>
              {['30D', '90D', '1Y'].map(w => (
                <button
                  key={w}
                  onClick={() => setTrendWindow(w)}
                  style={{
                    padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: trendWindow === w ? '#fff' : 'transparent',
                    color: trendWindow === w ? '#3b82f6' : '#64748b',
                    boxShadow: trendWindow === w ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    fontSize: '0.85rem', fontWeight: trendWindow === w ? 600 : 500,
                    transition: 'all 0.2s'
                  }}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          {trendLoading ? (
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} /> Loading trend data…
            </div>
          ) : !hasTrendData ? (
            <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <div style={{ background: '#fff', padding: '14px', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <Clock size={28} color="#94a3b8" />
              </div>
              <h4 style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '0.25rem' }}>No Risk Events Yet</h4>
              <p style={{ color: '#94a3b8', fontSize: '0.82rem', textAlign: 'center', maxWidth: '280px' }}>
                Upload and analyze documents to populate the risk trajectory chart.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                />
                <Tooltip content={<TrendTooltip />} />
                <Legend
                  iconType="circle" iconSize={8}
                  wrapperStyle={{ fontSize: '0.82rem', paddingTop: '0.75rem' }}
                />
                <Line
                  type="monotone" dataKey="riskScore" name="Risk Score"
                  stroke="#ef4444" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone" dataKey="complianceRate" name="Compliance Rate"
                  stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Recurring Violations */}
        <div className="card" style={{ flex: 1, background: '#fff', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.5rem' }}>Top Recurring Violations</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '2rem' }}>Most frequent compliance issues</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {loading ? (
              <div style={{ color: '#64748b', textAlign: 'center' }}>Loading violations...</div>
            ) : (!stats?.findings?.by_risk_type || stats.findings.by_risk_type.length === 0) ? (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>No violations found.</div>
            ) : (
              stats.findings.by_risk_type.slice(0, 5).map((v, i) => {
                const total = stats.findings.total || 1;
                const pct = Math.round((v.count / total) * 100);
                const color = i === 0 ? '#ef4444' : (i < 3 ? '#f59e0b' : '#3b82f6');
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ color: '#1e293b', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{v._id || 'Unknown'} Risks</span>
                      <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>{v.count}</span>
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Frequency: {pct}% of total</div>
                    <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '3px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Severity Distribution Bar Chart */}
      <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Findings by Severity</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Live distribution from database</p>
        </div>
        {severityData.length === 0 ? (
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '10px', border: '2px dashed #e2e8f0' }}>
            No findings data yet — upload and analyze a document to see results.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={severityData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '0.85rem' }}
                formatter={(value) => [value, 'Findings']}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={60}>
                {severityData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
};

export default ExecutiveSummary;
