import React, { useState, useEffect } from 'react';
import { 
  User, Lock, Building2, Bell, Save, X, Camera, 
  Mail, Phone, Globe, Calendar, Languages, Briefcase 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar,
  getOrganizationSettings,
  updateOrganizationSettings
} from '../services/settingsService';
import './Settings.css';

const Settings = () => {
  const { user: authUser, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile tab state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    bio: '',
    specialization: 'general',
    skills: [],
    experience: 'intermediate',
    timezone: 'UTC',
    language: 'en'
  });

  // Password tab state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Organization tab state (admin only)
  const [orgData, setOrgData] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    size: '1-10',
    timezone: 'UTC',
    language: 'en'
  });

  // New skill input
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    loadProfile();
    if (authUser?.role === 'admin') {
      loadOrganizationSettings();
    }
  }, [authUser]);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      const userData = response.data.user;
      setProfileData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        bio: userData.bio || '',
        specialization: userData.specialization || 'general',
        skills: userData.skills || [],
        experience: userData.experience || 'intermediate',
        timezone: userData.timezone || 'UTC',
        language: userData.language || 'en'
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  const loadOrganizationSettings = async () => {
    try {
      const response = await getOrganizationSettings();
      const org = response.data.organization;
      setOrgData({
        name: org.name || '',
        description: org.description || '',
        website: org.website || '',
        industry: org.industry || '',
        size: org.size || '1-10',
        timezone: org.timezone || 'UTC',
        language: org.language || 'en'
      });
    } catch (err) {
      console.error('Failed to load organization settings:', err);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await updateProfile(profileData);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Update auth context
      if (updateUser) {
        updateUser(response.data.user);
      }

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      setLoading(false);
      return;
    }

    try {
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateOrganizationSettings(orgData);
      setMessage({ type: 'success', text: 'Organization settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.message || 'Failed to update organization settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
    // Placeholder for avatar upload
    // In production, this would use a file input and upload to cloud storage
    const avatarUrl = prompt('Enter avatar URL (temporary method):');
    if (avatarUrl) {
      try {
        await uploadAvatar(avatarUrl);
        setMessage({ type: 'success', text: 'Avatar updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to update avatar' });
      }
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData({
        ...profileData,
        skills: [...profileData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfileData({
      ...profileData,
      skills: profileData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    ...(authUser?.role === 'admin' ? [{ id: 'organization', label: 'Organization', icon: Building2 }] : [])
  ];

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences</p>
      </div>

      {message.text && (
        <div className={`settings-message ${message.type}`}>
          {message.type === 'success' ? '✅' : '❌'} {message.text}
        </div>
      )}

      <div className="settings-content">
        {/* Tabs Sidebar */}
        <div className="settings-sidebar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-main">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="form-section">
                <h2>Profile Information</h2>
                <p className="section-description">Update your personal information and preferences</p>

                {/* Avatar */}
                <div className="avatar-section">
                  <div className="avatar-preview">
                    {authUser?.avatar ? (
                      <img src={authUser.avatar} alt="Avatar" />
                    ) : (
                      <div className="avatar-placeholder">
                        {authUser?.firstName?.[0]}{authUser?.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <button type="button" onClick={handleAvatarUpload} className="avatar-upload-btn">
                    <Camera size={16} />
                    Change Avatar
                  </button>
                </div>

                {/* Name Fields */}
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">First Name *</label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="lastName">Last Name *</label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Email (readonly) */}
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <div className="input-with-icon">
                    <Mail size={18} />
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      disabled
                      className="input-disabled"
                    />
                  </div>
                  <small>Email cannot be changed</small>
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label htmlFor="phoneNumber">Phone Number</label>
                  <div className="input-with-icon">
                    <Phone size={18} />
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="form-group">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                    rows="4"
                    maxLength="500"
                  />
                  <small>{profileData.bio.length}/500 characters</small>
                </div>

                {/* Specialization */}
                {(authUser?.role === 'member' || authUser?.role === 'team_leader') && (
                  <div className="form-group">
                    <label htmlFor="specialization">
                      Specialization
                      {profileData.specialization && profileData.specialization !== 'general' && (
                        <span className="specialization-badge" style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          marginLeft: '0.5rem'
                        }}>
                          {profileData.specialization}
                        </span>
                      )}
                    </label>
                    <div className="input-with-icon">
                      <Briefcase size={18} />
                      <select
                        id="specialization"
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                      >
                        <option value="general">General / No Specialization</option>
                        <option value="UI/UX Designer">UI/UX Designer</option>
                        <option value="Software Engineer">Software Engineer</option>
                        <option value="QA Engineer">QA Engineer</option>
                        <option value="DevOps Engineer">DevOps Engineer</option>
                        <option value="Product Manager">Product Manager</option>
                        <option value="Business Analyst">Business Analyst</option>
                        <option value="Data Analyst">Data Analyst</option>
                        <option value="Marketing Specialist">Marketing Specialist</option>
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Full Stack Developer">Full Stack Developer</option>
                        <option value="Mobile Developer">Mobile Developer</option>
                        <option value="Database Administrator">Database Administrator</option>
                        <option value="System Administrator">System Administrator</option>
                        <option value="Security Engineer">Security Engineer</option>
                        <option value="AI/ML Engineer">AI/ML Engineer</option>
                        <option value="Data Scientist">Data Scientist</option>
                        <option value="Cloud Architect">Cloud Architect</option>
                        <option value="Technical Writer">Technical Writer</option>
                      </select>
                    </div>
                    <small>Your professional specialization helps with team assignments</small>
                  </div>
                )}

                {/* Skills */}
                <div className="form-group">
                  <label htmlFor="skills">Skills</label>
                  <div className="skills-input-row">
                    <input
                      type="text"
                      id="skills"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      placeholder="Add a skill (e.g., React, Node.js)"
                    />
                    <button type="button" onClick={addSkill} className="btn-add-skill">
                      Add
                    </button>
                  </div>
                  <div className="skills-list">
                    {profileData.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">
                        {skill}
                        <button type="button" onClick={() => removeSkill(skill)}>
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="form-group">
                  <label htmlFor="experience">Experience Level</label>
                  <div className="input-with-icon">
                    <Briefcase size={18} />
                    <select
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                </div>

                {/* Timezone */}
                <div className="form-group">
                  <label htmlFor="timezone">Timezone</label>
                  <div className="input-with-icon">
                    <Globe size={18} />
                    <select
                      id="timezone"
                      value={profileData.timezone}
                      onChange={(e) => setProfileData({ ...profileData, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">Eastern Time (GMT-5)</option>
                      <option value="America/Chicago">Central Time (GMT-6)</option>
                      <option value="America/Denver">Mountain Time (GMT-7)</option>
                      <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                      <option value="Europe/London">London (GMT+0)</option>
                      <option value="Europe/Paris">Paris (GMT+1)</option>
                      <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                      <option value="Australia/Sydney">Sydney (GMT+10)</option>
                    </select>
                  </div>
                </div>

                {/* Language */}
                <div className="form-group">
                  <label htmlFor="language">Language</label>
                  <div className="input-with-icon">
                    <Languages size={18} />
                    <select
                      id="language"
                      value={profileData.language}
                      onChange={(e) => setProfileData({ ...profileData, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="ja">Japanese</option>
                      <option value="zh">Chinese</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <div className="form-section">
                <h2>Change Password</h2>
                <p className="section-description">Update your password to keep your account secure</p>

                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      required
                      placeholder="Enter current password"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <div className="input-with-icon">
                    <Lock size={18} />
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      placeholder="Re-enter new password"
                    />
                  </div>
                </div>

                <div className="password-requirements">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li className={passwordData.newPassword.length >= 6 ? 'met' : ''}>
                      At least 6 characters
                    </li>
                    <li className={passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword ? 'met' : ''}>
                      Passwords match
                    </li>
                  </ul>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          )}

          {/* Organization Tab (Admin Only) */}
          {activeTab === 'organization' && authUser?.role === 'admin' && (
            <form onSubmit={handleOrganizationSubmit} className="settings-form">
              <div className="form-section">
                <h2>Organization Settings</h2>
                <p className="section-description">Manage your organization's information and preferences</p>

                <div className="form-group">
                  <label htmlFor="orgName">Organization Name *</label>
                  <div className="input-with-icon">
                    <Building2 size={18} />
                    <input
                      type="text"
                      id="orgName"
                      value={orgData.name}
                      onChange={(e) => setOrgData({ ...orgData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="orgDescription">Description</label>
                  <textarea
                    id="orgDescription"
                    value={orgData.description}
                    onChange={(e) => setOrgData({ ...orgData, description: e.target.value })}
                    placeholder="Describe your organization..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="orgWebsite">Website</label>
                  <div className="input-with-icon">
                    <Globe size={18} />
                    <input
                      type="url"
                      id="orgWebsite"
                      value={orgData.website}
                      onChange={(e) => setOrgData({ ...orgData, website: e.target.value })}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="orgIndustry">Industry</label>
                    <select
                      id="orgIndustry"
                      value={orgData.industry}
                      onChange={(e) => setOrgData({ ...orgData, industry: e.target.value })}
                    >
                      <option value="">Select industry</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="education">Education</option>
                      <option value="retail">Retail</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="orgSize">Organization Size</label>
                    <select
                      id="orgSize"
                      value={orgData.size}
                      onChange={(e) => setOrgData({ ...orgData, size: e.target.value })}
                    >
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501-1000">501-1000 employees</option>
                      <option value="1000+">1000+ employees</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="orgTimezone">Default Timezone</label>
                    <select
                      id="orgTimezone"
                      value={orgData.timezone}
                      onChange={(e) => setOrgData({ ...orgData, timezone: e.target.value })}
                    >
                      <option value="UTC">UTC (GMT+0)</option>
                      <option value="America/New_York">Eastern Time (GMT-5)</option>
                      <option value="America/Chicago">Central Time (GMT-6)</option>
                      <option value="America/Denver">Mountain Time (GMT-7)</option>
                      <option value="America/Los_Angeles">Pacific Time (GMT-8)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="orgLanguage">Default Language</label>
                    <select
                      id="orgLanguage"
                      value={orgData.language}
                      onChange={(e) => setOrgData({ ...orgData, language: e.target.value })}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  <Save size={18} />
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
