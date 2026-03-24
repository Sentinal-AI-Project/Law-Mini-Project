import React from 'react';
import { ShieldCheck, ArrowRight, Zap, Lock, Shield, UploadCloud, BrainCircuit, Search, FileText, Eye, Network, Lightbulb, BarChart, Scale, UserCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
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
            <button className="btn btn-primary">Request Demo</button>
          </div>
        </div>
      </nav>

      <section className="container hero" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', padding: '6rem 2rem' }}>
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
            <button className="btn btn-primary" style={{ padding: '1rem 2rem' }}>Request Demo <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} /></button>
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
               src="https://framerusercontent.com/images/8r9m9T8yYtJ724R6xK2W6Z0g.png" 
               alt="Dashboard" 
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

      <footer className="footer" style={{ borderTop: '1px solid var(--border-color)', padding: '4rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', fontWeight: 800 }}>
              <ShieldCheck size={24} className="text-teal" />
              <span>Sentinel-Law</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <a href="#" className="text-muted">Documentation</a>
              <a href="#" className="text-muted">Privacy Policy</a>
              <a href="#" className="text-muted">Contact Support</a>
            </div>
            <p className="text-muted">&copy; 2024 Sentinel-Law. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
