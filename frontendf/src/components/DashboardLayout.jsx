import React from 'react';
import { 
  LayoutDashboard, 
  UploadCloud, 
  Library, 
  FileSearch, 
  BarChart3, 
  FileText, 
  ShieldAlert, 
  User, 
  LogOut,
  Bell,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SidebarLink = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link to={to} className={`sidebar-link ${isActive ? 'active' : ''}`}>
      <Icon size={20} />
      <span>{label}</span>
      {isActive && (
        <motion.div 
          layoutId="sidebar-active"
          className="active-indicator"
          style={{ 
            position: 'absolute', 
            left: 0, 
            width: '4px', 
            height: '24px', 
            backgroundColor: 'var(--accent-teal)',
            borderRadius: '0 4px 4px 0'
          }}
        />
      )}
    </Link>
  );
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="flex" style={{ minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        borderRight: '1px solid var(--border-color)', 
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        backgroundColor: 'var(--bg-secondary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', paddingLeft: '1rem' }}>
          <div style={{ background: 'var(--accent-teal)', padding: '6px', borderRadius: '8px' }}>
            <CheckCircle2 size={24} color="#0b1120" />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Compliance<span style={{ color: 'var(--accent-teal)' }}>AI</span></span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/upload" icon={UploadCloud} label="Upload Documents" />
          <SidebarLink to="/library" icon={Library} label="Document Library" />
          <SidebarLink to="/findings" icon={FileSearch} label="Findings" />
          <SidebarLink to="/reports" icon={FileText} label="Reports" />
          <SidebarLink to="/risk" icon={ShieldAlert} label="Risk Dashboard" />
          <SidebarLink to="/executive" icon={BarChart3} label="Executive Summary" />
          
          <div style={{ margin: '2rem 0 1rem 1rem', fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</div>
          <SidebarLink to="/profile" icon={User} label="Profile Settings" />
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem' }}>
          <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ marginLeft: '260px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Topbar */}
        <header style={{ 
          height: '70px', 
          borderBottom: '1px solid var(--border-color)', 
          padding: '0 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(11, 17, 32, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search data, reports..." 
              style={{ 
                width: '100%', 
                backgroundColor: 'var(--bg-secondary)', 
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '0.6rem 1rem 0.6rem 2.5rem',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div className="flex items-center gap-4">
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', position: 'relative', padding: 0 }}>
              <Bell size={20} />
              <span style={{ position: 'absolute', top: -2, right: -2, width: '8px', height: '8px', background: 'var(--accent-red)', borderRadius: '50%' }}></span>
            </button>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
            <div className="flex items-center gap-2">
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>John Smith</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Compliance Analyst</div>
              </div>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" 
                alt="Avatar" 
                style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid var(--accent-teal)' }}
              />
            </div>
          </div>
        </header>

        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
