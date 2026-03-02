import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authApi from '../services/authApi';
import CipherLogo from './CipherLogo';
import '../styles/UserProfile.scss';

const UserProfile = () => {
  const { user, logout, deleteAccount, token } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (token) {
          const response = await authApi.getProfile(token);
          setProfile(response);
        }
      } catch {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: '80vh' }}>
        <CipherLogo size={64} className="pulse-anim" />
        <p className="loading-screen__text">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return <div className="user-profile"><p>Not authenticated</p></div>;
  }

  const progressStats = profile?.stats || { completedCount: 0, totalAttempts: 0, totalAssignmentsAttempted: 0 };
  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return '#3fb950';
    if (diff === 'Medium') return '#e3b341';
    if (diff === 'Hard') return '#f78166';
    return '#58a6ff';
  }

  return (
    <div className="user-profile">
      <div className="profile-container container">
        <button className="back-button btn-ghost" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="profile-header">
          <div className="profile-avatar">
            {user.firstName?.charAt(0) || user.email?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h1>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email.split('@')[0]}</h1>
            <p className="email">{user.email}</p>
            <p className="joined">
              Joined {new Date(user.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        {error && <div className="status-banner status-banner--error"><span className="status-banner__icon">⚠️</span><span className="status-banner__content">{error}</span></div>}

        <div className="stats-section">
          <h2>Your Progress</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-icon" style={{ background: 'rgba(63,185,80,0.1)', color: '#3fb950' }}>✓</span>
              <div className="stat-info">
                <h3>{progressStats.completedCount}</h3>
                <p>Solved</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: 'rgba(88,166,255,0.1)', color: '#58a6ff' }}>📄</span>
              <div className="stat-info">
                <h3>{progressStats.totalAssignmentsAttempted}</h3>
                <p>Attempted</p>
              </div>
            </div>
            <div className="stat-card">
              <span className="stat-icon" style={{ background: 'rgba(188,140,255,0.1)', color: '#bc8cff' }}>🔄</span>
              <div className="stat-info">
                <h3>{progressStats.totalAttempts}</h3>
                <p>Total Submissions</p>
              </div>
            </div>
          </div>
        </div>

        {profile?.progress && profile.progress.length > 0 && (
          <div className="assignments-section">
            <h2>Recent Submissions</h2>
            <div className="assignment-list">
              {profile.progress.slice(0, 10).map((prog) => (
                <div key={prog._id} className="assignment-item" onClick={() => navigate(`/assignment/${prog.assignmentId?._id}`)}>
                  <div className="assignment-content">
                    <div className="assignment-header">
                      <h3>{prog.assignmentId?.title || 'Unknown Assignment'}</h3>
                      <span className="difficulty-badge" style={{ 
                        color: getDifficultyColor(prog.assignmentId?.difficulty),
                        background: `${getDifficultyColor(prog.assignmentId?.difficulty)}1A`,
                        border: `1px solid ${getDifficultyColor(prog.assignmentId?.difficulty)}33`
                      }}>
                        {prog.assignmentId?.difficulty || 'Unknown'}
                      </span>
                    </div>
                    
                    <div className="assignment-meta">
                      <span className="attempts">
                        {prog.attemptCount} attempt{prog.attemptCount !== 1 ? 's' : ''}
                      </span>
                      <span className="last-attempt">
                        {new Date(prog.lastAttempt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="assignment-status">
                    {prog.isCompleted ? (
                      <span className="status-badge status-badge--success">Accepted</span>
                    ) : (
                      <span className="status-badge status-badge--warning">Attempted</span>
                    )}
                    <span className="arrow">→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="settings-section">
          <h2>Account Settings</h2>
          <div className="settings-actions">
            <button className="btn-ghost" onClick={handleLogout}>
              Logout
            </button>
            <button 
              className="btn-danger"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="delete-confirm-modal">
            <div className="modal-content">
              <h2>Delete Account</h2>
              <p>Are you sure you want to delete your account? All progress will be lost permanently.</p>
              <div className="modal-buttons">
                <button 
                  className="btn-ghost"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger"
                  onClick={handleDeleteAccount}
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
