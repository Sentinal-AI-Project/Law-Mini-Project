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
      background: 'var(--bg-card)', border: '1px solid #e2e8f0',
      borderRadius: '10px', padding: '0.75rem 1rem',
      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontSize: '0.85rem'
    }}>
      <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.4rem' }}>{label}</div>
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
  const { stats, loading, refetch } = useComplianceData(30000); 
  const [trendLoading, setTrendLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const [trendData, setTrendData] = useState([]);

  const fetchTrends = useCallback(async () => {
    setTrendLoading(true);
    try {
      const days = WINDOW_DAYS[trendWindow] || 90;
      const res = await complianceAPI.trends(days);
      if (res?.trend) {
        const raw = res.trend;
        const step = Math.max(1, Math.floor(raw.length / 15));
        const sampled = raw.filter((_, i) => i % step === 0 || i === raw.length - 1);
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

  // Auto-refresh logic (hook handles stats, we handle trends)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTrends();
      setLastRefresh(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchTrends]);

  const handleDownloadSummary = () => {
    const score = stats?.dashboard?.complianceScore || 0;
    const blob = new Blob(
      [`Sentinel Law — Executive Summary\nGenerated: ${new Date().toLocaleString()}\n\nOverall Risk Score: ${100 - score}/100\nCompliance Rate: ${score}%\nTotal Violations: ${stats?.dashboard?.totalFindings || 0}\nDocuments Processed: ${stats?.dashboard?.completedDocs || stats?.dashboard?.totalDocuments || 0}\n`],
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

  // Determine if we have real trend data 
  const hasTrendData = trendData.some(d => d.riskScore > 0 || d.complianceRate < 100);

  // Build bar chart data from findings by severity
  const severityData = (() => {
    const bySev = stats?.dashboard?.findings?.by_severity || stats?.findings?.by_severity;
    if (!bySev?.length) return [];
    const map = { critical: 0, high: 0, medium: 0, low: 0 };
    for (const s of bySev) { map[s._id?.toLowerCase()] = s.count; }
    return [
      { name: 'Critical', count: map.critical, fill: 'var(--accent-red)' },
      { name: 'High', count: map.high, fill: 'var(--accent-orange)' },
      { name: 'Medium', count: map.medium, fill: 'var(--accent-blue)' },
      { name: 'Low', count: map.low, fill: 'var(--accent-teal)' },
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
               · Auto-refresh · Last: {lastRefresh.toLocaleTimeString()}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => { refetch(); fetchTrends(); }}
            style={{ background: 'var(--bg-main)', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            title="Refresh now"
          >
            <RefreshCw size={16} color="#64748b" />
          </button>
          <CustomDropdown options={['Last 90 Days', 'Last 30 Days', 'This Year']} width="160px" />
        </div>
      </div>

      {/* Critical alert banner */}
      {stats?.dashboard?.recent_critical?.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'var(--bg-card)', borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', boxShadow: '0 4px 15px rgba(220,38,38,0.3)' }}>
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '12px', borderRadius: '50%' }}>
              <AlertCircle size={32} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: 700 }}>Critical Findings Alert</h2>
              <p style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '1rem' }}>{stats.dashboard.recent_critical.length} high-priority compliance violations require immediate attention</p>
            </div>
          </div>
          <button onClick={() => navigate('/findings')} style={{ background: 'var(--bg-card)', color: 'var(--accent-red)', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Review Now</button>
        </div>
      )}


      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        <button
          onClick={handleDownloadSummary}
          style={{
            flex: 1, background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            color: 'var(--bg-card)', gap: '0.75rem', padding: '1rem', border: 'none', borderRadius: '12px',
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
            flex: 1, background: 'var(--bg-card)', color: 'var(--accent-purple)', gap: '0.75rem', padding: '1rem',
            border: '2px solid #eef2ff', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'var(--bg-card-hover)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <FileText size={20} /> View Full Report
        </button>
      </div>

      {/* KPI stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Overall Risk Score', value: loading ? '—' : `${100 - (stats?.dashboard?.complianceScore || 0)}`, suffix: '/100', icon: <Shield size={24} color="#3b82f6" />, bg: 'rgba(59, 130, 246, 0.1)' },
          { label: 'Open Violations', value: loading ? '—' : (stats?.dashboard?.totalFindings || 0), icon: <AlertTriangle size={24} color="#d97706" />, bg: 'rgba(245, 158, 11, 0.1)' },
          { label: 'Compliance Rate', value: loading ? '—' : `${stats?.dashboard?.complianceScore || 0}%`, icon: <CheckCircle size={24} color="#10b981" />, bg: 'rgba(11, 220, 181, 0.1)' },
          { label: 'Documents Processed', value: loading ? '—' : (stats?.dashboard?.completedDocs || stats?.dashboard?.totalDocuments || 0), icon: <Clock size={24} color="#9333ea" />, bg: 'var(--bg-card-hover)' },
        ].map(({ label, value, suffix, icon, bg }) => (
          <div key={label} className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: bg, padding: '10px', borderRadius: '8px' }}>{icon}</div>
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {value}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}>{suffix || ''}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Risk Trends + Violations row */}
      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Risk Trends Line Chart */}
        <div className="card" style={{ flex: 2, background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Risk Trends Over Time</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live daily risk trajectory analysis</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-main)', padding: '0.25rem', borderRadius: '8px' }}>
              {['30D', '90D', '1Y'].map(w => (
                <button
                  key={w}
                  onClick={() => setTrendWindow(w)}
                  style={{
                    padding: '0.25rem 0.75rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                    background: trendWindow === w ? 'var(--bg-card)' : 'transparent',
                    color: trendWindow === w ? 'var(--accent-blue)' : 'var(--text-muted)',
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
            <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={20} style={{ animation: 'spin 1s linear infinite', marginRight: '0.5rem' }} /> Loading trend data…
            </div>
          ) : !hasTrendData ? (
            <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
              <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '50%', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <Clock size={28} color="#94a3b8" />
              </div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.25rem' }}>No Risk Events Yet</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', maxWidth: '280px' }}>
                Upload and analyze documents to populate the risk trajectory chart.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
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
        <div className="card" style={{ flex: 1, background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Top Recurring Violations</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>Most frequent compliance issues</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {loading ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading violations...</div>
            ) : (!stats?.dashboard?.findings?.by_risk_type || stats.dashboard.findings.by_risk_type.length === 0) ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No violations found.</div>
            ) : (
              stats.dashboard.findings.by_risk_type.slice(0, 5).map((v, i) => {
                const total = stats.dashboard.totalFindings || 1;
                const pct = Math.round((v.count / total) * 100);
                const color = i === 0 ? 'var(--accent-red)' : (i < 3 ? 'var(--accent-orange)' : 'var(--accent-blue)');
                return (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize' }}>{v._id || 'Unknown'} Risks</span>
                      <span style={{ color, fontWeight: 700, fontSize: '0.9rem' }}>{v.count}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>Frequency: {pct}% of total</div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--bg-card-hover)', borderRadius: '3px', overflow: 'hidden' }}>
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
      <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Findings by Severity</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Live distribution from database</p>
        </div>
        {severityData.length === 0 ? (
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', background: 'var(--bg-main)', borderRadius: '10px', border: '2px dashed #e2e8f0' }}>
            No findings data yet — upload and analyze a document to see results.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={severityData} margin={{ top: 0, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
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
