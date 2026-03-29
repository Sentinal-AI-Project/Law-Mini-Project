import React from 'react';
import { ShieldCheck, ArrowRight, Zap, Lock, Shield, UploadCloud, BrainCircuit, Search, FileText, Network, Lightbulb, BarChart, Scale, UserCheck, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import dashboardImg from '../assets/minimalist_dashboard_ai.png';

const Home = () => {
  const navigate = useNavigate();

  const handleRequestDemo = () => {
    window.alert('Demo request received. Redirecting you to login for quick preview mode.');
    navigate('/login');
  };

  const handleFooterLink = (label) => {
    window.alert(`${label} will be available in the next release.`);
  };

  return (
    <div className="app">
      <nav className="container" style={{ padding: '1.5rem 2rem' }}>
        <div className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 800 }}>
            <ShieldCheck size={32} className="text-teal" />
            <span>Sentinel<span className="text-teal">-Law</span></span>
          </div>
          <div className="nav-links" style={{ display: 'flex', gap: '2rem' }}>
            <a href="#features" className="text-muted">Features</a>
            <a href="#how" className="text-muted">How It Works</a>
            <a href="#security" className="text-muted">Security</a>
            <a href="#contact" className="text-muted">Contact</a>
          </div>
          <div className="nav-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link to="/login" className="text-muted" style={{ fontWeight: 500 }}>Login</Link>
            <Link to="/register" className="btn btn-outline">Sign Up</Link>
            <button className="btn btn-primary" onClick={handleRequestDemo}>Request Demo</button>
          </div>
        </div>
      </nav>

      <section id="hero" className="container hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', padding: '6rem 2rem' }}>
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontSize: '4.5rem', lineHeight: 1.1, marginBottom: '2rem' }}>
            Passive AI <br />
            Compliance <br />
            Monitoring. <span className="text-teal">Zero <br /> Workflow <br /> Disruption.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '500px' }}>
            Real-time document analysis with explainable audit findings. Monitor compliance across GDPR, HIPAA, and SOX frameworks.
          </p>
          <div className="hero-actions" style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary" onClick={handleRequestDemo} style={{ padding: '1rem 2rem' }}>Request Demo <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} /></button>
            <Link to="/login" className="btn btn-outline" style={{ padding: '1rem 2rem' }}>Login</Link>
          </div>
          
          <div className="hero-stats" style={{ display: 'flex', gap: '3rem', marginTop: '4rem' }}>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>≤30 sec</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analysis Time</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>≥90%</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Zero</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Violations</div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
           initial={{ opacity: 0, scale: 0.8 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 1, delay: 0.2 }}
           style={{ position: 'relative' }}
        >
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(11,220,181,0.2) 0%, rgba(59,130,246,0.2) 100%)',
            borderRadius: '24px',
            padding: '1rem',
            position: 'relative',
            zIndex: 1
          }}>
             <img 
               src={dashboardImg}
               alt="Dashboard AI Compliance" 
               style={{ width: '100%', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
             />
          </div>
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, var(--accent-teal) 0%, transparent 70%)', opacity: 0.2, filter: 'blur(40px)' }}></div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" style={{ background: 'var(--bg-secondary)', padding: '8rem 2rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Enterprise-Grade Features</h2>
            <p className="text-muted">Built for compliance teams who need reliable, explainable AI monitoring</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
            {[
              { icon: Eye, title: "Read-Only Ingestion", desc: "Non-invasive analysis that never modifies original files" },
              { icon: Network, title: "NLP Segmentation", desc: "Advanced processing for precise clause identification" },
              { icon: Lightbulb, title: "Explainable Findings", desc: "Clear reasoning behind every compliance assessment" },
              { icon: BarChart, title: "Risk Scoring", desc: "Categorized risk levels: Low to Critical assessments" },
              { icon: Scale, title: "Multi-Framework", desc: "Covers GDPR, HIPAA, SOX, and more" },
              { icon: Zap, title: "Real-Time Analysis", desc: "Instant processing with sub-30 second times" }
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -10 }}
                className="card"
              >
                <div style={{ background: 'rgba(11,220,181,0.1)', color: 'var(--accent-teal)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                  <f.icon size={24} />
                </div>
                <h3 style={{ marginBottom: '0.75rem' }}>{f.title}</h3>
                <p className="text-muted">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" style={{ padding: '8rem 2rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>How Sentinel-Law Works</h2>
            <p className="text-muted">Three simple steps to automated compliance</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3rem', position: 'relative' }}>
             {[
               { icon: UploadCloud, title: "1. Secure Upload", desc: "Drag and drop your legal documents, NDAs, or contracts. They remain encrypted at rest and in transit." },
               { icon: BrainCircuit, title: "2. AI Analysis", desc: "Our proprietary NLP models scan for regulatory violations, risk markers, and missing clauses in seconds." },
               { icon: FileText, title: "3. Actionable Reports", desc: "Receive detailed, explainable audit findings with exact citations and recommended remediations." }
             ].map((step, i) => (
               <motion.div key={i} whileHover={{ y: -10 }} style={{ position: 'relative', background: 'var(--bg-secondary)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                 <div style={{ width: '80px', height: '80px', margin: '0 auto 2rem', background: 'linear-gradient(135deg, rgba(11,220,181,0.2) 0%, rgba(59,130,246,0.2) 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-teal)' }}>
                   <step.icon size={40} />
                 </div>
                 <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{step.title}</h3>
                 <p className="text-muted" style={{ lineHeight: 1.6 }}>{step.desc}</p>
               </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ background: 'var(--bg-secondary)', padding: '8rem 2rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', background: 'radial-gradient(circle, rgba(11,220,181,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', background: 'rgba(11,220,181,0.1)', color: 'var(--accent-teal)', borderRadius: '100px', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <Shield size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'text-bottom' }} /> Enterprise Security
            </div>
            <h2 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '2rem' }}>Zero-Trust <br/>Architecture.</h2>
            <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '2rem', maxWidth: '500px' }}>
              We treat your data with the highest level of security. Our models run on isolated instances, ensuring your documents are never used for training or shared across tenants.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {[
                 "SOC 2 Type II Certified",
                 "AES-256 Data Encryption",
                 "Role-Based Access Control (RBAC)",
                 "Comprehensive Audit Logging"
               ].map((item, i) => (
                 <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                   <div style={{ color: 'var(--accent-teal)' }}><ShieldCheck size={24} /></div>
                   {item}
                 </li>
               ))}
            </ul>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ background: 'linear-gradient(145deg, rgba(20,20,30,0.8) 0%, rgba(10,10,15,0.9) 100%)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', position: 'relative' }}
          >
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                  <Lock size={40} className="text-teal" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>E2E Encryption</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>In transit and at rest</p>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                  <UserCheck size={40} className="text-teal" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>SSO Ready</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>SAML & OAuth support</p>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                  <Shield size={40} className="text-teal" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>GDPR Compliant</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Strict data privacy protocols</p>
                </div>
                <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '24px' }}>
                  <Network size={40} className="text-teal" style={{ margin: '0 auto 1rem' }} />
                  <h4 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Isolated VPCs</h4>
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>Dedicated cloud infrastructure</p>
                </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '8rem 2rem' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Ready to Automate Compliance?</h2>
            <p className="text-muted">Get in touch with our security experts to see a live demo.</p>
          </div>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ background: 'var(--bg-secondary)', padding: '3rem', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '2rem' }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>First Name</label>
                <input type="text" placeholder="John" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Last Name</label>
                <input type="text" placeholder="Doe" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Work Email</label>
              <input type="email" placeholder="john@company.com" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Message</label>
              <textarea placeholder="How can we help you?" rows="4" style={{ width: '100%', padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '12px', color: 'var(--text-primary)', outline: 'none', resize: 'vertical' }}></textarea>
            </div>
            <button type="button" className="btn btn-primary" style={{ padding: '1.2rem', fontSize: '1.1rem', fontWeight: 600, width: '100%' }}>Send Message</button>
          </motion.form>
        </div>
      </section>

      <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <ShieldCheck size={24} className="text-teal" />
              <span>Sentinel-Law</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <button onClick={() => handleFooterLink('Documentation')} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="text-muted">Documentation</button>
              <button onClick={() => handleFooterLink('Privacy Policy')} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="text-muted">Privacy Policy</button>
              <button onClick={() => handleFooterLink('Contact Support')} style={{ background: 'none', border: 'none', cursor: 'pointer' }} className="text-muted">Contact Support</button>
            </div>
            <p className="text-muted">&copy; 2024 Sentinel-Law. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
