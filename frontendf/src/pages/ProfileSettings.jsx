import React from 'react';
import { Camera, Edit2, ShieldAlert, Key, User, Download, Settings, Smartphone, Trash2, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

import CustomDropdown from '../components/CustomDropdown';
import { useAuth } from '../context/AuthContext';
import { authAPI, userAPI } from '../services/api';

const ProfileSettings = () => {
  const { user, logout } = useAuth();
  const [activity, setActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [passForm, setPassForm] = React.useState({ old: '', new: '', confirm: '' });

  const notify = (msg) => window.alert(msg);


  React.useEffect(() => {
    const fetchActivity = async () => {
      try {
        const data = await userAPI.getActivity();
        setActivity(data.activity || []);
      } catch (err) {
        console.error('Failed to fetch activity:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivity();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
      return window.alert('New passwords do not match.');
    }
    try {
      await authAPI.changePassword(passForm.old, passForm.new);
      window.alert('Password updated successfully!');
      setPassForm({ old: '', new: '', confirm: '' });
    } catch (err) {
      window.alert(err.message || 'Failed to update password.');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you absolutely sure? This action is irreversible.')) return;
    try {
      await authAPI.deleteAccount();
      window.alert('Account deleted.');
      logout();
    } catch (err) {
      window.alert('Failed to delete account.');
    }
  };


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
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`} alt="Profile" style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', border: '3px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                <button onClick={() => window.alert('Avatar upload is coming soon.')} style={{ position: 'absolute', bottom: 0, right: 0, width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: '#fff', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 style={{ fontSize: '1.5rem', color: '#1e293b', marginBottom: '0.25rem' }}>{user?.name || 'User'}</h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user?.email || 'email@example.com'}</p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: '#eff6ff', color: '#3b82f6', borderRadius: '20px', textTransform: 'capitalize' }}>{user?.role || 'analyst'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: '#ecfdf5', color: '#059669', borderRadius: '20px' }}>Active</span>
                </div>
              </div>
            </div>
          </div>


          {/* Personal Information */}
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Personal Information</h3>
            </div>

            
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" defaultValue={user?.name || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" defaultValue={user?.email || ''} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Phone Number</label>
                  <input type="tel" defaultValue="+1 (555) 000-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                  <input type="text" readOnly defaultValue={user?.role || 'analyst'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'capitalize' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Department</label>
                  <input type="text" defaultValue="Compliance & Legal" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
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
            
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Current Password</label>
                <input type="password" required value={passForm.old} onChange={(e) => setPassForm({ ...passForm, old: e.target.value })} placeholder="Enter current password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                <input type="password" required value={passForm.new} onChange={(e) => setPassForm({ ...passForm, new: e.target.value })} placeholder="Enter new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem' }}>Must be at least 8 characters with uppercase, lowercase, and numbers</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input type="password" required value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} placeholder="Confirm new password" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', color: '#fff' }}>Update Password</button>
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
              {loading ? (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading activity...</div>
              ) : activity.length === 0 ? (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No recent activity.</div>
              ) : (
                activity.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>{item.action}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{new Date(item.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Danger Zone */}
          <div className="card" style={{ background: '#fff', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button onClick={handleDeleteAccount} className="btn" style={{ width: '100%', background: '#dc2626', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} /> Delete Account
            </button>

          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;


