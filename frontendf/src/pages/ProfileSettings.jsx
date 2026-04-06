import React from 'react';
import { Camera, Edit2, ShieldAlert, Key, User, Smartphone, Trash2, AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI, userAPI } from '../services/api';

const ProfileSettings = () => {
  const { user, logout, updateUser } = useAuth();
  console.log('Current User State:', user);
  const [activityData, setActivityData] = React.useState({ items: [], needsMigration: false, error: null });
  const [loading, setLoading] = React.useState(true);
  const [passForm, setPassForm] = React.useState({ old: '', new: '', confirm: '' });
  
  // Real Profile State
  const [profileData, setProfileData] = React.useState({
    name: '',
    email: '',
    phone: '',
    department: ''
  });

  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || 'Compliance & Legal'
      });
    }
  }, [user]);

  const fetchActivity = React.useCallback(async () => {
    try {
      const data = await userAPI.getActivity();
      console.log('Activity Data Fetched:', data);
      setActivityData({
        items: data.activity || [],
        needsMigration: !!data.needsMigration,
        error: null
      });
    } catch (err) {
      console.error('Failed to fetch activity:', err);
      setActivityData(prev => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const resp = await userAPI.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        department: profileData.department
      });
      
      updateUser(resp.user);
      window.alert('Profile updated successfully!');
      fetchActivity(); // Refresh logs
    } catch (err) {
      window.alert(err.message || 'Failed to update profile.');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passForm.new !== passForm.confirm) {
        return window.alert('New passwords do not match.');
    }
    try {
        await authAPI.changePassword(passForm.old, passForm.new);
        window.alert('Password updated successfully!');
        setPassForm({ old: '', new: '', confirm: '' });
        fetchActivity();
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
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

          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem' }}>Personal Information</h3>
            
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" value={profileData.email} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Phone Number</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                  <input type="text" readOnly defaultValue={user?.role || 'analyst'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', textTransform: 'capitalize' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Department</label>
                  <input type="text" value={profileData.department} onChange={(e) => setProfileData({...profileData, department: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', color: '#fff' }}>Save Changes</button>
              </div>
            </form>
          </div>

          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#1e293b' }}>Change Password</h3>
              <Lock size={18} color="#94a3b8" />
            </div>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Current Password</label>
                <input type="password" required value={passForm.old} onChange={(e) => setPassForm({ ...passForm, old: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                <input type="password" required value={passForm.new} onChange={(e) => setPassForm({ ...passForm, new: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: '#475569', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input type="password" required value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ background: '#4f46e5', color: '#fff' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: '#fff', border: '1px solid #e2e8f0', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '1.5rem', flexShrink: 0 }}>Account Activity</h3>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {loading ? (
                  <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading activity...</div>
                ) : activityData.error ? (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <strong>Error fetching activity:</strong><br/>
                    {activityData.error}
                  </div>
                ) : activityData.needsMigration ? (
                  <div style={{ color: '#ef4444', fontSize: '0.8rem', background: '#fef2f2', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Database Update Required</div>
                    Please run the migration script to enable activity logging and profile updates.
                  </div>
                ) : activityData.items.length === 0 ? (
                  <div style={{ color: '#64748b', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No recent activity.</div>
                ) : (
                  activityData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx !== activityData.items.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={14} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.action}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(item.created_at).toLocaleString()}</div>
                        {item.details?.fields && (
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                            Updated: {item.details.fields.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <style>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #f1f5f9;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #cbd5e1;
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `}</style>

          <div className="card" style={{ background: '#fff', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Once you delete your account, there is no going back.
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
