import React from 'react';
import { ShieldCheck, Mail, Lock, CheckCircle2, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Login = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#fff' }}>
      {/* Left side - Blue Gradient */}
      <div style={{ 
        flex: 1, 
        background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)', 
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.5rem', fontWeight: 800, marginBottom: '4rem' }}>
          <div style={{ background: '#fff', padding: '6px', borderRadius: '8px' }}>
            <ShieldCheck size={28} color="#2563eb" />
          </div>
          <span>ComplianceAI</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Enterprise Compliance <br />
            AI Dashboard
          </h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '3rem', maxWidth: '500px' }}>
            Intelligent document analysis and compliance monitoring powered by advanced AI technology.
          </p>
          
          <div style={{ position: 'relative', marginTop: '1rem', minHeight: '300px' }}>
             <img 
               src="/ai-illustration.png" 
               alt="AI Illustration" 
               style={{ width: '100%', height: '100%', minHeight: '300px', objectFit: 'cover', borderRadius: '24px', opacity: 0.9, backgroundColor: 'rgba(255,255,255,0.1)' }}
             />
             {/* Read-only system badge matching image */}
             <div className="glass" style={{ 
               position: 'absolute', 
               bottom: '20px', 
               left: '20px', 
               right: '20px',
               padding: '1.5rem',
               borderRadius: '16px',
               display: 'flex',
               alignItems: 'center',
               gap: '1rem'
             }}>
               <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px', borderRadius: '8px' }}>
                 <Lock size={20} />
               </div>
               <div>
                  <div style={{ fontWeight: 700 }}>Read-Only System</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>We never modify your documents. Our AI only reads and analyzes for compliance insights.</div>
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '4rem', background: '#f8fafc' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ width: '100%', maxWidth: '440px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ color: '#1e293b', fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome Back</h2>
            <p style={{ color: '#64748b' }}>Sign in to access your compliance dashboard</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card" style={{ background: '#ecfdf5', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
              <div style={{ color: '#059669' }}><CheckCircle2 size={20} /></div>
              <span style={{ color: '#065f46', fontSize: '0.9rem', fontWeight: 500 }}>Secure Enterprise Login</span>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="email" 
                  placeholder="you@company.com" 
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ color: '#3b82f6', fontSize: '0.9rem', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="password" 
                  placeholder="Enter your password" 
                  style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="remember" />
              <label htmlFor="remember" style={{ color: '#64748b', fontSize: '0.9rem' }}>Remember me</label>
            </div>

            <Link to="/dashboard" className="btn btn-secondary" style={{ width: '100%', padding: '0.9rem' }}>Sign In</Link>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#94a3b8', fontSize: '0.8rem', margin: '1rem 0' }}>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
              <span>OR CONTINUE WITH</span>
              <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
            </div>

            <button className="btn btn-outline" style={{ width: '100%', color: '#1e293b', gap: '0.75rem' }}>
              <Building2 size={20} />
              Enterprise SSO
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
              Don't have an account? <a href="/#contact" style={{ color: '#3b82f6', fontWeight: 600 }}>Contact Sales</a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
