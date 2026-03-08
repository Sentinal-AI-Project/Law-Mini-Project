import React from 'react';
import {
  ShieldCheck,
  UploadCloud,
  BrainCircuit,
  Search,
  FileText,
  Eye,
  Network,
  Lightbulb,
  BarChart,
  Scale,
  Zap,
  Lock,
  Shield,
  UserCheck
} from 'lucide-react';
import './App.css';

function App() {
  return (
    <div className="app">
      {/* Navbar */}
      <nav className="container">
        <div className="navbar">
          <div className="nav-logo">
            <ShieldCheck size={28} className="text-teal" />
            <span>Sentinel-Law</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#security">Security</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="nav-actions">
            <a href="#login" className="text-muted" style={{ fontWeight: 500 }}>Login</a>
            <button className="btn btn-primary">Request Demo</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Passive AI <br />
            Compliance <br />
            Monitoring. <span className="text-teal">Zero <br /> Workflow <br /> Disruption.</span>
          </h1>
          <p className="hero-subtitle">
            Real-time document analysis with explainable audit findings. Monitor compliance across GDPR, HIPAA, and SOX frameworks without interrupting your team's workflow.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary">Request Demo</button>
            <button className="btn btn-outline" style={{ border: 'none', backgroundColor: '#1e293b' }}>Login</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">≤30 sec</span>
              <span className="stat-label">Document Analysis</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">≥90%</span>
              <span className="stat-label">Explainability Coverage</span>
            </div>
            <div className="stat-item">
              <span className="stat-value" style={{ color: '#fff' }}>Zero</span>
              <span className="stat-label">WCAG 2.1 AA Violations</span>
            </div>
          </div>
        </div>
        <div className="hero-image-wrapper">
          <img
            src="/dashboard.png"
            alt="Sentinel-Law Dashboard"
            className="hero-image"
          />
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Four simple steps to comprehensive compliance monitoring</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">
                <UploadCloud size={24} />
              </div>
              <h3 className="step-title">Upload Documents</h3>
              <p className="step-desc">Securely upload your organizational documents for passive monitoring</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <BrainCircuit size={24} />
              </div>
              <h3 className="step-title">AI Clause Extraction</h3>
              <p className="step-desc">NLP-based segmentation identifies critical clauses and provisions</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <Search size={24} />
              </div>
              <h3 className="step-title">Risk Detection</h3>
              <p className="step-desc">Map findings to compliance frameworks with risk scoring</p>
            </div>
            <div className="step-card">
              <div className="step-icon">
                <FileText size={24} />
              </div>
              <h3 className="step-title">Generate Reports</h3>
              <p className="step-desc">Comprehensive audit reports with explainable findings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header" style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="section-title">Enterprise-Grade Features</h2>
            <p className="section-subtitle">Built for compliance teams who need reliable, explainable AI monitoring</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon"><Eye size={24} /></div>
              <h3 className="feature-title">Read-Only Ingestion</h3>
              <p className="feature-desc">Non-invasive document analysis that never modifies your original files</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Network size={24} /></div>
              <h3 className="feature-title">NLP Clause Segmentation</h3>
              <p className="feature-desc">Advanced natural language processing for precise clause identification</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Lightbulb size={24} /></div>
              <h3 className="feature-title">Explainable Findings</h3>
              <p className="feature-desc">Clear validation and reasoning behind every compliance assessment</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><BarChart size={24} /></div>
              <h3 className="feature-title">Risk Scoring</h3>
              <p className="feature-desc">Categorized risk levels: Low, Medium, High, and Critical assessments</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Scale size={24} /></div>
              <h3 className="feature-title">Multi-Framework Support</h3>
              <p className="feature-desc">Comprehensive coverage for GDPR, HIPAA, SOX, and other frameworks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon"><Zap size={24} /></div>
              <h3 className="feature-title">Real-Time Analysis</h3>
              <p className="feature-desc">Instant document processing with sub-30 second analysis times</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security">
        <div className="container">
          <div className="security-grid">
            <div className="security-content">
              <h2 className="section-title" style={{ marginBottom: '1rem' }}>Security & Privacy First</h2>
              <p className="section-subtitle" style={{ textAlign: 'left', marginBottom: '2rem' }}>
                Enterprise-grade security architecture designed for the most sensitive compliance environments.
              </p>
              <div className="security-list">
                <div className="security-item">
                  <div className="security-item-icon"><Lock size={20} /></div>
                  <div className="security-item-content">
                    <h4>Read-Only Architecture</h4>
                    <p>Zero write permissions ensure your documents remain completely unmodified</p>
                  </div>
                </div>
                <div className="security-item">
                  <div className="security-item-icon"><ShieldCheck size={20} /></div>
                  <div className="security-item-content">
                    <h4>Encrypted Storage</h4>
                    <p>End-to-end encryption with enterprise-grade key management</p>
                  </div>
                </div>
                <div className="security-item">
                  <div className="security-item-icon"><UserCheck size={20} /></div>
                  <div className="security-item-content">
                    <h4>Zero Modification Policy</h4>
                    <p>Passive monitoring maintains complete document integrity</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="security-illustration">
              {/* Decorative empty placeholder box matching the image */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <ShieldCheck size={28} className="text-teal" />
                <span>Sentinel-Law</span>
              </div>
              <p className="footer-tagline" style={{ maxWidth: '80%' }}>
                The Shadow AI & Compliance Auditor
              </p>
            </div>
            <div className="footer-col">
              <h4>Product</h4>
              <div className="footer-links">
                <a href="#">Features</a>
                <a href="#">How it Works</a>
                <a href="#">Security</a>
                <a href="#">Pricing</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <div className="footer-links">
                <a href="#">About</a>
                <a href="#">Documentation</a>
                <a href="#">Privacy Policy</a>
                <a href="#">Contact</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Contact</h4>
              <div className="footer-links">
                <a href="mailto:support@sentinel-law.com" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Shield size={16} /> support@sentinel-law.com
                </a>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <Zap size={16} /> +1 (555) 123-4567
                </span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Sentinel-Law. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
