import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import { FiUser, FiPhone, FiMail, FiLock, FiShield, FiCheck, FiEye, FiEyeOff, FiUpload, FiImage } from 'react-icons/fi';
import './MyProfile.css';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
];

const MyProfile = () => {
  const { user, updateUserState } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTabFromUrl = searchParams.get('tab') === 'password' ? 'password' : 'info';

  const [activeTab, setActiveTab] = useState(activeTabFromUrl);
  const [loading, setLoading] = useState(true);

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setName(data.name || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setAvatar(data.avatar || '');
        updateUserState(data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        return toast.warning('Image size should be less than 5MB');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        toast.info('Photo loaded! Click "Save Profile Details" to save.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.warning('Name is required');
    if (!email.trim()) return toast.warning('Email is required');
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name, email, phone, avatar });
      updateUserState(data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return toast.warning('Please enter current and new password');
    if (newPassword.length < 6) return toast.warning('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');

    setSavingPassword(true);
    try {
      await api.put('/auth/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <Loader />;

  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Account & Profile</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: 4 }}>
          Manage your personal details, profile picture, phone number, and security settings
        </p>
      </div>

      <div className="profile-tabs">
        <button
          className={`profile-tab-btn${activeTab === 'info' ? ' active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          <FiUser size={16} /> Personal Info
        </button>
        <button
          className={`profile-tab-btn${activeTab === 'password' ? ' active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          <FiLock size={16} /> Security & Password
        </button>
      </div>

      {activeTab === 'info' && (
        <div className="card profile-card">
          <form onSubmit={handleProfileSubmit}>
            <div className="profile-avatar-section">
              <div className="profile-avatar-preview">
                {avatar ? (
                  <img src={avatar} alt={name} />
                ) : (
                  <div className="profile-avatar-fallback">{userInitials}</div>
                )}
              </div>
              <div className="profile-avatar-controls">
                <h4>Profile Avatar</h4>
                <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 10 }}>
                  Upload a photo from your gallery or pick an avatar preset below
                </p>

                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div className="avatar-actions-row">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <FiUpload size={14} /> Choose from Gallery
                  </button>
                  <button
                    type="button"
                    className="avatar-reset-btn"
                    onClick={() => setAvatar('')}
                    title="Use Initials Avatar"
                  >
                    Reset Initials
                  </button>
                </div>

                <div className="avatar-presets" style={{ marginTop: 14 }}>
                  {AVATAR_PRESETS.map((preset, index) => (
                    <img
                      key={index}
                      src={preset}
                      alt={`Avatar ${index + 1}`}
                      className={`avatar-preset-chip${avatar === preset ? ' selected' : ''}`}
                      onClick={() => setAvatar(preset)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="profile-form-grid">
              <div className="field">
                <label><FiUser size={14} /> Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="field">
                <label><FiMail size={14} /> Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                />
              </div>

              <div className="field">
                <label><FiPhone size={14} /> Mobile Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="field">
                <label><FiShield size={14} /> Role & Department</label>
                <input
                  type="text"
                  value={`${(user?.role || 'employee').toUpperCase()} • ${user?.department?.name || 'Unassigned'}`}
                  disabled
                  style={{ opacity: 0.7 }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ marginTop: 16 }}>
              {savingProfile ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="card profile-card" style={{ maxWidth: 520 }}>
          <form onSubmit={handlePasswordSubmit}>
            <h3>Change Password</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginBottom: 20 }}>
              Ensure your account is using a long, random password to stay secure.
            </p>

            <div className="field">
              <label>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  style={{ paddingRight: 40, width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  {showCurrent ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  style={{ paddingRight: 40, width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                >
                  {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={savingPassword} style={{ marginTop: 12 }}>
              {savingPassword ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
