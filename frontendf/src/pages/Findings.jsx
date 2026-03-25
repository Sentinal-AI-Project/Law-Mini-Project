import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, AlertTriangle, MessageSquare, Check, ExternalLink } from 'lucide-react';

const Findings = () => {
  return (
    <DashboardLayout>
      <div style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 120px)' }}>
        {/* Left Side - Findings List */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input type="text" placeholder="Search findings..." style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, background: '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer' }}>High Risk</button>
              <button style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}>Medium Risk</button>
              <button style={{ padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer' }}>Low Risk</button>
            </div>
          </div>
          
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', borderLeft: '4px solid #dc2626' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ color: '#dc2626' }}>Data Breach</span>
                <span style={{ color: '#64748b' }}>0.94</span>
              </div>
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>Unencrypted Personal Data Storage</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>Customer PII stored without encryption in violation of GDPR Article 32</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 500 }}>GDPR Article 32</span>
                <span style={{ color: '#94a3b8' }}>2 hours ago</span>
              </div>
            </div>
            
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
                <span style={{ color: '#d97706' }}>Policy Violation</span>
                <span style={{ color: '#64748b' }}>0.87</span>
              </div>
              <h4 style={{ color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>Inadequate Access Controls</h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem', lineHeight: 1.4 }}>Admin privileges granted without proper authorization workflow</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 500 }}>SOX Section 404</span>
                <span style={{ color: '#94a3b8' }}>4 hours ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Finding Details */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1rem' }}>
                <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.9rem' }}>Data Breach</span>
                <span style={{ color: '#475569', fontSize: '0.9rem' }}>Confidence: <span style={{ fontWeight: 700 }}>94%</span></span>
              </div>
              <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Unencrypted Personal Data Storage</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>Customer PII stored without encryption in violation of GDPR Article 32</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', background: '#f1f5f9', border: 'none' }}>
                <MessageSquare size={18} /> Add Note
              </button>
              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#2563eb', color: '#fff' }}>
                <Check size={18} /> Mark as Reviewed
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Identified Risk Clause</h3>
            <div style={{ background: '#fef9c3', padding: '1.5rem', borderRadius: '8px', border: '1px solid #fef08a', color: '#422006', lineHeight: 1.6 }}>
              "Personal data shall be processed in a manner that ensures appropriate security of the personal data, including protection against unauthorised or unlawful processing and against accidental loss, destruction or damage, using appropriate technical or organisational measures ('integrity and confidentiality')."
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Evidence</h3>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: '#1e293b', marginBottom: '0.5rem', fontSize: '1rem' }}>Database Configuration Analysis</h4>
                  <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '1rem' }}>Automated scan detected customer database "user_profiles" storing plaintext personal information including:</p>
                  <ul style={{ color: '#475569', fontSize: '0.95rem', paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li>Full names</li>
                    <li>Email addresses</li>
                    <li>Phone numbers</li>
                    <li>Home addresses</li>
                  </ul>
                  <div style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 500 }}>Location: /database/user_profiles/personal_data</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1rem' }}>Legal Reference</h3>
            <div style={{ background: '#eff6ff', borderRadius: '8px', padding: '1.5rem', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ color: '#1e40af', fontSize: '1rem', fontWeight: 600 }}>GDPR Article 32 - Security of Processing</h4>
                <ExternalLink size={16} color="#3b82f6" />
              </div>
              <p style={{ color: '#1e3a8a', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                Taking into account the state of the art, the costs of implementation and the nature, scope, context and purposes of processing as well as the risk of varying likelihood and severity for the rights and freedoms of natural persons, the controller and the processor shall implement appropriate technical and organisational measures...
              </p>
              <div style={{ display: 'flex', gap: '2rem', fontSize: '0.85rem', color: '#2563eb' }}>
                <span>Regulation: GDPR</span>
                <span>Article: 32</span>
                <span>Maximum Fine: €20M or 4% of revenue</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Findings;
