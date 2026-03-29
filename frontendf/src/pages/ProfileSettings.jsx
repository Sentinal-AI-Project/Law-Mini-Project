import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Camera, Edit2, ShieldAlert, Key, User, Download, Settings, Smartphone, Trash2, AlertTriangle } from 'lucide-react';
import CustomDropdown from '../components/CustomDropdown';

const ProfileSettings = () => {
  const notify = (msg) => window.alert(msg);

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--text-main)' }}>Profile Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your account information and preferences</p>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Column - Main Settings */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Profile Card */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=JohnAnderson" alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <button onClick={() => notify('Avatar upload is enabled in demo mode.')} style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem' }}>John Anderson</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>john.anderson@company.com</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px' }}>Manager</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: '#ecfdf5', color: '#059669', borderRadius: '20px' }}>Active</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>Last login: 2 hours ago</span>
                </div>
              </div>
            </div>
            <button onClick={() => notify('Profile editing enabled in demo mode.')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fff' }}>
              <Edit2 size={16} /> Edit Profile
            </button>
          </div>

          {/* Personal Information */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Personal Information</h3>
              <button onClick={() => notify('Inline edit mode is active.')} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.9rem', fontWeight: 600, display: 'flex', gap: '0.25rem', alignItems: 'center', cursor: 'pointer' }}>
                <Edit2 size={14} /> Edit
              </button>
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" defaultValue="John Anderson" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" defaultValue="john.anderson@company.com" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 123-4567" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                  <CustomDropdown options={['Analyst', 'Manager', 'Admin']} width="100%" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Department</label>
                  <input type="text" defaultValue="Analytics & Insights" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => notify('Profile changes saved (demo mode).')} className="btn btn-primary" style={{ background: '#4f46e5', color: '#fff' }}>Save Changes</button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Change Password</h3>
              <Lock size={18} color="#94a3b8" />
            </div>
            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Current Password</label>
                <input type="password" placeholder="Enter current password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                <input type="password" placeholder="Enter new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Must be at least 8 characters with uppercase, lowercase, and numbers</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input type="password" placeholder="Confirm new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => notify('Password update queued (demo mode).')} className="btn btn-primary" style={{ background: '#4f46e5', color: '#fff' }}>Update Password</button>
              </div>
            </form>
          </div>
          
        </div>

        {/* Right Column - Side Panels */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Account Activity */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem' }}>Account Activity</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Last Login</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>2 hours ago</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>IP: 192.168.1.1</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Key size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Password Changed</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>3 days ago</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <User size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Profile Updated</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>1 week ago</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldAlert size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Security Alert</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>2 weeks ago</div>
                </div>
              </div>
            </div>
            
            <button onClick={() => notify('Full activity feed will be available soon.')} style={{ width: '100%', marginTop: '1.5rem', padding: '0.75rem', background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>View All Activity</button>
          </div>

          {/* Danger Zone */}
          <div className="card" style={{ background: '#fff', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button onClick={() => notify('Account deletion is disabled in demo mode.')} className="btn" style={{ width: '100%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

// Required wrapper component to define missing icons
const CheckCircle = ({ size, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);
const Lock = ({ size, color }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;

export default ProfileSettings;
