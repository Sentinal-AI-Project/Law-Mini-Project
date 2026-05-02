import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, DownloadCloud, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import { reportsAPI, docsAPI } from '../services/api';
import CustomDropdown from '../components/CustomDropdown';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Shield } from 'lucide-react';

const AuditReport = () => {
  const [docs, setDocs] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [docStats, setDocStats] = useState(null);
  const [docFindings, setDocFindings] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dData = await docsAPI.list({ limit: 50, status: 'analyzed' });
        if (dData.documents) setDocs(dData.documents);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!selectedDoc) {
      setDocStats(null);
      return;
    }
    const fetchDocStats = async () => {
      setLoadingStats(true);
      try {
        const res = await docsAPI.findings(selectedDoc, { limit: 1000 });
        const sevMap = { low: 0, medium: 0, high: 0, critical: 0 };
        let resolvedCount = 0;
        res.findings.forEach((f) => {
          if (sevMap[f.severity] !== undefined) sevMap[f.severity]++;
          if (f.status === 'reviewed' || f.status === 'resolved') resolvedCount++;
        });
        const severityStats = Object.keys(sevMap).map(k => ({ severity: k, count: sevMap[k] }));
        setDocFindings(res.findings);
        setDocStats({ total: res.total, severityStats, resolvedCount });
      } catch (err) {
        console.error('Failed to fetch doc stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDocStats();
  }, [selectedDoc]);



  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!docStats || !selectedDoc) return;
    const docName = docs.find(d => d.id === selectedDoc || d._id === selectedDoc)?.filename || 'document';
    
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(31, 41, 55);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text('SENTINEL LAW', 20, 25);
    doc.setFontSize(10);
    doc.text('COMPLIANCE AUDIT REPORT', 20, 32);
    
    // Document Info
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Document Analysis Summary', 20, 55);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(`Filename: ${docName}`, 20, 65);
    doc.text(`Audit Scope: Comprehensive (All Frameworks)`, 20, 72);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 79);
    
    // Stats Cards
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 90, 40, 25);
    doc.rect(65, 90, 40, 25);
    doc.rect(110, 90, 40, 25);
    doc.rect(155, 90, 35, 25);
    
    doc.setFontSize(8);
    doc.text('TOTAL FINDINGS', 22, 98);
    doc.text('COMPLIANCE SCORE', 67, 98);
    doc.text('RESOLVED', 112, 98);
    doc.text('ACTIVE RISKS', 157, 98);
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(`${totalFindings}`, 22, 108);
    doc.text(`${compScore}%`, 67, 108);
    doc.text(`${docStats.resolvedCount}`, 112, 108);
    doc.text(`${activeFindings.length}`, 157, 108);
    
    // Findings Table
    doc.setFontSize(12);
    doc.text('Detailed Findings', 20, 130);
    
    const tableData = docFindings.map((f, i) => [
      i + 1,
      f.severity.toUpperCase(),
      f.risk_type || 'General',
      f.description,
      f.status || 'pending'
    ]);
    
    autoTable(doc, {
      startY: 135,
      head: [['#', 'Severity', 'Type', 'Description', 'Status']],
      body: tableData,
      headStyles: { fillColor: [79, 70, 229] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      styles: { fontSize: 8, cellPadding: 3 }
    });
    
    doc.save(`Sentinel_Audit_${docName.replace(/\.[^/.]+$/, "")}.pdf`);
  };

  const handleExportCsv = () => {
    if (!docFindings || !docFindings.length) return;
    const docName = docs.find(d => d.id === selectedDoc || d._id === selectedDoc)?.filename || 'document';
    let csv = `Severity,Risk Type,Description,Status,Confidence,Created At\n`;
    docFindings.forEach(f => {
      const desc = (f.description || '').replace(/"/g, '""');
      csv += `"${f.severity}","${f.risk_type}","${desc}","${f.status}",${f.confidence},"${f.created_at}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Audit_Findings_${docName.replace(/\.[^/.]+$/, "")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const getSeverityCount = (severity) => {
    return docStats?.severityStats?.find(s => s.severity === severity)?.count || 0;
  };

  const criticalCount = getSeverityCount('critical');
  const highCount = getSeverityCount('high');
  const mediumCount = getSeverityCount('medium');
  const lowCount = getSeverityCount('low');
  const totalFindings = docStats?.total || 0;

  // Exclude reviewed/resolved issues from the risk deduction to show improved score
  const activeFindings = docFindings.filter(f => f.status !== 'reviewed' && f.status !== 'resolved');
  const activeCritical = activeFindings.filter(f => f.severity === 'critical').length;
  const activeHigh = activeFindings.filter(f => f.severity === 'high').length;
  const activeMedium = activeFindings.filter(f => f.severity === 'medium').length;

  // Use a weighted percentage model consistent with the dashboard
  const totalWeightedRisk = docFindings.reduce((acc, f) => acc + (f.severity === 'critical' ? 12 : f.severity === 'high' ? 6 : f.severity === 'medium' ? 2 : 1), 0);
  const activeWeightedRisk = activeFindings.reduce((acc, f) => acc + (f.severity === 'critical' ? 12 : f.severity === 'high' ? 6 : f.severity === 'medium' ? 2 : 1), 0);
  
  const compScore = totalFindings === 0 && selectedDoc ? 100 : Math.max(2, Math.min(100, Math.round(100 - (activeWeightedRisk / Math.max(totalWeightedRisk, 1)) * 100)));
  
  // Real Confidence Aggregation
  const confidenceDistribution = (() => {
    if (!docFindings.length) return { veryHigh: 0, high: 0, medium: 0, low: 0 };
    return docFindings.reduce((acc, f) => {
      const c = f.confidence || 0;
      if (c >= 0.85) acc.veryHigh++;
      else if (c >= 0.7) acc.high++;
      else if (c >= 0.5) acc.medium++;
      else acc.low++;
      return acc;
    }, { veryHigh: 0, high: 0, medium: 0, low: 0 });
  })();

  const confData = [
    { label: 'Very High', value: confidenceDistribution.veryHigh, color: 'var(--accent-teal)' },
    { label: 'High', value: confidenceDistribution.high, color: '#0d9488' },
    { label: 'Medium', value: confidenceDistribution.medium, color: '#0284c7' },
    { label: 'Low', value: confidenceDistribution.low, color: 'var(--accent-blue)' }
  ];

  const maxConfValue = Math.max(...confData.map(d => d.value), 10);

  // Determine conic gradient for pie chart dynamically
  const getPieStyle = () => {
    if (totalFindings === 0) return { background: 'var(--border-color)' };
    const lowPct = (lowCount / totalFindings) * 100;
    const medPct = (mediumCount / totalFindings) * 100;
    const highPct = (highCount / totalFindings) * 100;
    const critPct = (criticalCount / totalFindings) * 100;
    
    const p1 = lowPct;
    const p2 = p1 + medPct;
    const p3 = p2 + highPct;
    
    return {
      background: `conic-gradient(#10b981 0% ${p1}%, #2563eb ${p1}% ${p2}%, #d97706 ${p2}% ${p3}%, #dc2626 ${p3}% 100%)`
    };
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>Compliance Audit Viewer</h1>
        <p style={{ color: 'var(--text-muted)' }}>View comprehensive compliance audit metrics and findings summary for your documents.</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Side - Configuration */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem', fontWeight: 600 }}>Report Configuration</h3>
            
            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>Select Document</label>
              <CustomDropdown
                options={['Select a document', ...docs.map(d => d.filename)]}
                width="100%"
                value={docs.find(d => (d.id === selectedDoc || d._id === selectedDoc))?.filename || 'Select a document'}
                onChange={(val) => {
                  const doc = docs.find(d => d.filename === val);
                  if (doc) setSelectedDoc(doc.id || doc._id);
                  else setSelectedDoc('');
                }}
              />
              {loading && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading documents…</p>}
            </div>

            <div style={{ background: 'rgba(59, 130, 246, 0.03)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                 <Shield size={18} color="var(--accent-blue)" />
                 <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>Audit Scope</span>
               </div>
               <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                 Your documents are analyzed against the full global compliance suite.
               </p>
               <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                 {['GDPR', 'SOC2', 'HIPAA', 'ISO'].map(tag => (
                   <span key={tag} style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)' }}>{tag}</span>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* Right Side - Preview */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', padding: '2rem', opacity: loadingStats ? 0.6 : 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Report Preview {selectedDoc ? '' : '(No doc selected)'}</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button onClick={handleExportPdf} className="btn" disabled={!selectedDoc} style={{ background: 'var(--accent-red)', color: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem', opacity: !selectedDoc ? 0.5 : 1 }}>
                   <DownloadCloud size={16} /> Export PDF
                </button>
                <button onClick={handleExportCsv} className="btn" disabled={!selectedDoc} style={{ background: 'var(--accent-teal)', color: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1rem', opacity: !selectedDoc ? 0.5 : 1 }}>
                   <FileText size={16} /> Export CSV
                </button>
              </div>
            </div>

            {/* Risk Cards */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ flex: 1, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #fee2e2', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Critical Risks</div>
                <div style={{ color: 'var(--accent-red)', fontSize: '2rem', fontWeight: 700 }}>{!selectedDoc ? '-' : criticalCount}</div>
                <AlertTriangle size={20} color="#dc2626" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: 'rgba(245, 158, 11, 0.1)', border: '1px solid #fef3c7', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: 'var(--accent-orange)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>High Risks</div>
                <div style={{ color: 'var(--accent-orange)', fontSize: '2rem', fontWeight: 700 }}>{!selectedDoc ? '-' : highCount}</div>
                <AlertCircle size={20} color="#d97706" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #dbeafe', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Medium Risks</div>
                <div style={{ color: 'var(--accent-blue)', fontSize: '2rem', fontWeight: 700 }}>{!selectedDoc ? '-' : mediumCount}</div>
                <Info size={20} color="#2563eb" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
              <div style={{ flex: 1, background: 'rgba(11, 220, 181, 0.1)', border: '1px solid #d1fae5', borderRadius: '8px', padding: '1.25rem', position: 'relative' }}>
                <div style={{ color: 'var(--accent-teal)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>Low Risks</div>
                <div style={{ color: 'var(--accent-teal)', fontSize: '2rem', fontWeight: 700 }}>{!selectedDoc ? '-' : lowCount}</div>
                <CheckCircle2 size={20} color="#059669" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.8 }} />
              </div>
            </div>

            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1rem' }}>Severity Breakdown</h4>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ 
                    width: '180px', height: '180px', borderRadius: '50%', marginBottom: '1.5rem',
                    ...getPieStyle()
                  }}></div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', flexWrap: 'wrap', justifyContent: 'center' }}>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: 'var(--accent-teal)', display: 'inline-block' }}></span> Low</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: 'var(--accent-blue)', display: 'inline-block' }}></span> Medium</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: 'var(--accent-orange)', display: 'inline-block' }}></span> High</span>
                     <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '10px', height: '10px', background: 'var(--accent-red)', display: 'inline-block' }}></span> Critical</span>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--bg-main)', padding: '1.5rem', borderRadius: '12px' }}>
                <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1rem' }}>Confidence Statistics</h4>
                <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '1rem', padding: '0 1rem', paddingBottom: '0.5rem', borderBottom: '1px solid #e2e8f0', position: 'relative' }}>
                  {[1, 0.75, 0.5, 0.25].map(p => (
                    <div key={p} style={{ position: 'absolute', bottom: `${p * 100}%`, left: 0, right: 0, borderTop: '1px dashed rgba(226, 232, 240, 0.5)', zIndex: 0, display: 'flex', alignItems: 'center' }}>
                      <span style={{ position: 'absolute', left: '-25px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{Math.round(maxConfValue * p)}</span>
                    </div>
                  ))}
                  {confData.map((bar, i) => (
                    <div key={i} style={{ flex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', zIndex: 1 }}>
                       <div 
                         style={{ 
                           width: '40px', 
                           height: `${Math.max(2, (bar.value / maxConfValue) * 100)}%`, 
                           background: bar.value === 0 ? 'var(--bg-main)' : bar.color, 
                           borderRadius: '4px 4px 0 0',
                           transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                           boxShadow: bar.value === 0 ? 'none' : `0 4px 12px ${bar.color}20`,
                           border: bar.value === 0 ? '1px dashed var(--border-color)' : 'none'
                         }} 
                       />
                       <div style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%', whiteSpace: 'nowrap' }}>{bar.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div style={{ background: 'var(--bg-main)', padding: '2rem', borderRadius: '12px', textAlign: 'center' }}>
               <h4 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1rem' }}>Total Findings Summary</h4>
               <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{!selectedDoc ? '-' : totalFindings}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Total Findings</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-blue)', lineHeight: 1 }}>{!selectedDoc ? '-' : `${compScore}%`}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Compliance Score</div>
                 </div>
                 <div>
                   <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-teal)', lineHeight: 1 }}>{!selectedDoc ? '-' : (docStats?.resolvedCount || 0)}</div>
                   <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>Resolved Issues</div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuditReport;
