import React, { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink } from 'lucide-react';

const Findings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRisk, setActiveRisk] = useState('All');
  const [selectedFinding, setSelectedFinding] = useState(1);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');

  const [findingsData, setFindingsData] = useState([
    {
      id: 1,
      title: "Unencrypted Personal Data Storage",
      type: "Data Breach",
      confidence: 0.94,
      description: "Customer PII stored without encryption in violation of GDPR Article 32",
      regulation: "GDPR Article 32",
      time: "2 hours ago",
      risk: "High",
      isReviewed: false,
      notes: [],
      clause: "\"Personal data shall be processed in a manner that ensures appropriate security of the personal data, including protection against unauthorised or unlawful processing and against accidental loss, destruction or damage, using appropriate technical or organisational measures ('integrity and confidentiality').\"",
      evidenceTitle: "Database Configuration Analysis",
      evidenceDesc: "Automated scan detected customer database \"user_profiles\" storing plaintext personal information including:",
      evidenceList: ["Full names", "Email addresses", "Phone numbers", "Home addresses"],
      evidenceLocation: "Location: /database/user_profiles/personal_data",
      legalTitle: "GDPR Article 32 - Security of Processing",
      legalDesc: "Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing as well as the risk of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures...",
      legalMeta: ["Regulation: GDPR", "Article: 32", "Maximum Fine: €20M or 4% of revenue"]
    },
    {
      id: 2,
      title: "Inadequate Access Controls",
      type: "Policy Violation",
      confidence: 0.87,
      description: "Admin privileges granted without proper authorization workflow",
      regulation: "SOX Section 404",
      time: "4 hours ago",
      risk: "Medium",
      isReviewed: false,
      notes: [],
      clause: "\"Management is required to report on the effectiveness of the company's internal control over financial reporting.\"",
      evidenceTitle: "IAM Role Analysis",
      evidenceDesc: "Scan detected direct assignment of AdministratorAccess policies to individual user accounts rather than through defined groups/roles:",
      evidenceList: ["User: john.doe", "User: external_contractor", "User: service_account_dev"],
      evidenceLocation: "Location: AWS IAM Policy Assignments",
      legalTitle: "SOX Section 404 - Management Assessment of Internal Controls",
      legalDesc: "Requires management and the external auditor to report on the adequacy of the company's internal control over financial reporting (ICFR). Direct assignment of privileged roles without auditable workflow violates standard ICFR design.",
      legalMeta: ["Regulation: SOX", "Section: 404", "Enforcement: SEC/PCAOB"]
    },
    {
      id: 3,
      title: "Missing Audit Logs",
      type: "Configuration Issue",
      confidence: 0.92,
      description: "System audit logging is disabled for sensitive financial transactions",
      regulation: "PCI DSS Constraint",
      time: "1 day ago",
      risk: "Low",
      isReviewed: false,
      notes: [],
      clause: "\"Track and monitor all access to network resources and cardholder data.\"",
      evidenceTitle: "Server Configuration Analysis",
      evidenceDesc: "Payment processing gateway servers do not have transaction-level logging enabled for the primary database connections:",
      evidenceList: ["Server: db-pay-prod-01", "Server: db-pay-prod-02", "Config key: transaction_audit_level=0"],
      evidenceLocation: "Location: /etc/payment-gateway/config.yaml",
      legalTitle: "PCI DSS Requirement 10",
      legalDesc: "Logging mechanisms and the ability to track user activities are critical in preventing, detecting, or minimizing the impact of a data compromise. The presence of logs in all environments allows thorough tracking, alerting, and analysis...",
      legalMeta: ["Regulation: PCI DSS", "Requirement: 10", "Consequence: Loss of processing ability"]
    }
  ]);

  const activeFinding = findingsData.find(f => f.id === selectedFinding) || findingsData[0];

  const handleToggleReview = () => {
    setFindingsData(prev => prev.map(f => f.id === selectedFinding ? { ...f, isReviewed: !f.isReviewed } : f));
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    setFindingsData(prev => prev.map(f => f.id === selectedFinding ? { ...f, notes: [...f.notes, { text: noteText, date: new Date().toLocaleDateString() }] } : f));
    setNoteText('');
    setShowNoteInput(false);
  };

  const filteredFindings = findingsData.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || f.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = activeRisk === 'All' || f.risk === activeRisk;
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
              <button onClick={() => setActiveRisk(activeRisk === 'High' ? 'All' : 'High')} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: activeRisk === 'High' ? 700 : 500, background: activeRisk === 'High' ? '#fee2e2' : '#f1f5f9', color: activeRisk === 'High' ? '#dc2626' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>High Risk</button>
              <button onClick={() => setActiveRisk(activeRisk === 'Medium' ? 'All' : 'Medium')} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: activeRisk === 'Medium' ? 700 : 500, background: activeRisk === 'Medium' ? '#fef3c7' : '#f1f5f9', color: activeRisk === 'Medium' ? '#d97706' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>Medium Risk</button>
              <button onClick={() => setActiveRisk(activeRisk === 'Low' ? 'All' : 'Low')} style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: activeRisk === 'Low' ? 700 : 500, background: activeRisk === 'Low' ? '#ecfdf5' : '#f1f5f9', color: activeRisk === 'Low' ? '#059669' : '#64748b', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}>Low Risk</button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredFindings.length > 0 ? filteredFindings.map((finding) => (
              <div 
                key={finding.id} 
                onClick={() => setSelectedFinding(finding.id)}
                style={{ 
                  padding: '1.25rem', 
                  borderBottom: '1px solid #e2e8f0', 
                  cursor: 'pointer', 
                  background: finding.id === selectedFinding ? '#f8fafc' : '#fff', 
                  borderLeft: `4px solid ${finding.risk === 'High' ? '#dc2626' : finding.risk === 'Medium' ? '#d97706' : '#059669'}` 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                  <span style={{ color: finding.risk === 'High' ? '#dc2626' : finding.risk === 'Medium' ? '#d97706' : '#059669' }}>{finding.type}</span>
                  <span style={{ color: '#64748b' }}>{finding.confidence}</span>
                </div>
                <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>{finding.title}</h4>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>{finding.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <span style={{ color: '#3b82f6', fontWeight: 500 }}>{finding.regulation}</span>
                  <span style={{ color: '#94a3b8' }}>{finding.time}</span>
                </div>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.95rem' }}>No findings match your filters.</div>
            )}
          </div>
        </div>

        {/* Right Side - Finding Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                <span style={{ color: activeFinding.risk === 'High' ? '#dc2626' : activeFinding.risk === 'Medium' ? '#d97706' : '#059669', fontWeight: 600, fontSize: '0.9rem' }}>{activeFinding.type}</span>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Confidence: <span style={{ fontWeight: 700 }}>{(activeFinding.confidence * 100).toFixed(0)}%</span></span>
                {activeFinding.isReviewed && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                    <Check size={14} /> Reviewed
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '1.75rem', color: '#1e293b', marginBottom: '0.5rem' }}>{activeFinding.title}</h1>
              <p style={{ color: '#475569', fontSize: '1rem' }}>{activeFinding.description}</p>
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
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: activeFinding.isReviewed ? '#10b981' : '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', transition: 'all 0.2s ease' }}
              >
                {activeFinding.isReviewed ? <Check size={18} /> : <Check size={18} />} 
                {activeFinding.isReviewed ? 'Reviewed' : 'Mark as Reviewed'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Identified Risk Clause</h3>
            <div style={{ background: '#fef9c3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef08a', color: '#422006', lineHeight: 1.6 }}>
              {activeFinding.clause}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Evidence</h3>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <AlertTriangle size={20} color={activeFinding.risk === 'High' ? '#dc2626' : '#d97706'} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1rem' }}>{activeFinding.evidenceTitle}</h4>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem' }}>{activeFinding.evidenceDesc}</p>
                  <ul style={{ color: '#475569', fontSize: '0.95rem', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {activeFinding.evidenceList.map((item, id) => <li key={id}>{item}</li>)}
                  </ul>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>{activeFinding.evidenceLocation}</div>
                </div>
              </div>
            </div>
          </div>

          {activeFinding.notes.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Case Notes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {activeFinding.notes.map((note, idx) => (
                  <div key={idx} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem' }}>{note.date}</div>
                    <div style={{ color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.5 }}>{note.text}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Legal Reference</h3>
            <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#1e40af', fontSize: '1rem', fontWeight: 600 }}>{activeFinding.legalTitle}</h4>
                <ExternalLink size={16} color="#3b82f6" />
              </div>
              <p style={{ color: '#1e3a8a', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {activeFinding.legalDesc}
              </p>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#2563eb' }}>
                {activeFinding.legalMeta.map((meta, id) => <span key={id}>{meta}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Findings;
