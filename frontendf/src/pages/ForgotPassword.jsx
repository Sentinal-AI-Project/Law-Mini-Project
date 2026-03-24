import React from 'react';
import { Key, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ background: '#fff', padding: '3rem 2rem', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ background: '#dbeafe', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <Key size={32} color="#2563eb" />
            </div>
            <h1 style={{ color: '#1e293b', fontSize: '1.75rem', marginBottom: '0.5rem' }}>Forgot Password?</h1>
            <p style={{ color: '#64748b' }}>No worries, we'll send you reset instructions.</p>
          </div>

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Email address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="form-input"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none' }}
              />
            </div>

            <button type="button" className="btn btn-secondary" style={{ width: '100%', padding: '0.9rem' }}>
              Send Reset Link
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link to="/login" style={{ color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </motion.div>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
          Protected by reCAPTCHA and subject to the <br />
          <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Privacy Policy</a> and <a href="#" style={{ color: '#3b82f6', textDecoration: 'none' }}>Terms of Service</a>.
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
