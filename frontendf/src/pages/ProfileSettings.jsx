import React from 'react';
import { Camera, AlertTriangle, CheckCircle, Lock, Loader, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { authAPI, userAPI } from '../services/api';

const ProfileSettings = () => {
  const { user, logout, updateUser } = useAuth();
  const avatarInputRef = React.useRef(null);

  const [localPreview, setLocalPreview] = React.useState(null);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const [avatarError, setAvatarError] = React.useState(null);

  const [activityData, setActivityData] = React.useState({ items: [], needsMigration: false, error: null });
  const [loading, setLoading] = React.useState(true);
  const [passForm, setPassForm] = React.useState({ old: '', new: '', confirm: '' });
  
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
      setActivityData({
        items: data.activity || [],
        needsMigration: !!data.needsMigration,
        error: null
      });
    } catch (err) {
      setActivityData(prev => ({ ...prev, error: err.message }));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // ── Avatar helpers ────────────────────────────────────────
  const currentAvatarSrc = localPreview
    || user?.avatar_url
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'default')}`;

  const handleAvatarClick = () => {
    setAvatarError(null);
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate on client side too
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file (JPG, PNG, GIF, WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be smaller than 5 MB.');
      return;
    }

    // Optimistic preview
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    setUploadingAvatar(true);
    setAvatarError(null);

    try {
      const resp = await userAPI.uploadAvatar(file);
      updateUser(resp.user);          // push new avatar_url into auth context
      setLocalPreview(null);          // let the context value take over
    } catch (err) {
      setAvatarError(err.message || 'Upload failed. Please try again.');
      setLocalPreview(null);          // revert preview on failure
    } finally {
      setUploadingAvatar(false);
      // Reset input so same file can be re-selected after an error
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  // ── Profile / password handlers ───────────────────────────
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
      fetchActivity();
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
          
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                {/* Hidden file input */}
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />

                {/* Avatar image */}
                <img
                  src={currentAvatarSrc}
                  alt="Profile"
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'var(--bg-card-hover)',
                    border: '3px solid #fff',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                    objectFit: 'cover',
                    opacity: uploadingAvatar ? 0.5 : 1,
                    transition: 'opacity 0.2s',
                  }}
                />

                {/* Spinner overlay while uploading */}
                {uploadingAvatar && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%',
                  }}>
                    <Loader size={22} color="#4f46e5" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                )}

                {/* Camera button */}
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  title="Change profile picture"
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: uploadingAvatar ? 'var(--text-muted)' : 'var(--accent-purple)',
                    color: 'var(--bg-card)', border: '2px solid #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <Camera size={14} />
                </button>
              </div>

              <div>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{user?.name || 'User'}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{user?.email || 'email@example.com'}</p>
                {/* Avatar error message */}
                {avatarError && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-red)', margin: '0 0 0.5rem' }}>{avatarError}</p>
                )}
                {uploadingAvatar && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-purple)', margin: '0 0 0.5rem' }}>Uploading avatar…</p>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', borderRadius: '20px', textTransform: 'capitalize' }}>{user?.role || 'analyst'}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.75rem', background: 'rgba(11, 220, 181, 0.1)', color: 'var(--accent-teal)', borderRadius: '20px' }}>Active</span>
                </div>
              </div>
            </div>
          </div>


          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem' }}>Personal Information</h3>
            
            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                  <input type="email" value={profileData.email} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--bg-main)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Phone Number</label>
                  <input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+1 (555) 000-0000" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Role</label>
                  <input type="text" readOnly defaultValue={user?.role || 'analyst'} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'var(--bg-main)', textTransform: 'capitalize' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Department</label>
                  <input type="text" value={profileData.department} onChange={(e) => setProfileData({...profileData, department: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-purple)', color: 'var(--bg-card)' }}>Save Changes</button>
              </div>
            </form>
          </div>

          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)' }}>Change Password</h3>
              <Lock size={18} color="#94a3b8" />
            </div>
            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Current Password</label>
                <input type="password" required value={passForm.old} onChange={(e) => setPassForm({ ...passForm, old: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                <input type="password" required value={passForm.new} onChange={(e) => setPassForm({ ...passForm, new: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input type="password" required value={passForm.confirm} onChange={(e) => setPassForm({ ...passForm, confirm: e.target.value })} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ background: 'var(--accent-purple)', color: 'var(--bg-card)' }}>Update Password</button>
              </div>
            </form>
          </div>
        </div>

        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #e2e8f0', height: '400px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1.5rem', flexShrink: 0 }}>Account Activity</h3>
            <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {loading ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading activity...</div>
                ) : activityData.error ? (
                  <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <strong>Error fetching activity:</strong><br/>
                    {activityData.error}
                  </div>
                ) : activityData.needsMigration ? (
                  <div style={{ color: 'var(--accent-red)', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid #fee2e2' }}>
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Database Update Required</div>
                    Please run the migration script to enable activity logging and profile updates.
                  </div>
                ) : activityData.items.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem' }}>No recent activity.</div>
                ) : (
                  activityData.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.75rem', paddingBottom: '0.75rem', borderBottom: idx !== activityData.items.length - 1 ? '1px dashed #f1f5f9' : 'none' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CheckCircle size={14} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.action}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.created_at).toLocaleString()}</div>
                        {item.details?.fields && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
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
            @keyframes spin {
              from { transform: rotate(0deg); }
              to   { transform: rotate(360deg); }
            }
          `}</style>

          <div className="card" style={{ background: 'var(--bg-card)', border: '1px solid #fee2e2' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-red)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} /> Danger Zone
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Once you delete your account, there is no going back.
            </p>
            <button onClick={handleDeleteAccount} className="btn" style={{ width: '100%', background: 'var(--accent-red)', color: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <Trash2 size={16} /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
