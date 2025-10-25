import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Mail,
  Briefcase,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import './TeamMembersView.css';

const TeamMembersView = ({ projectId, project }) => {
  const [members, setMembers] = useState([]);
  const [teamLeader, setTeamLeader] = useState(null);
  const [projectManager, setProjectManager] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      // Use project data passed as prop
      setTeamLeader(project.teamLeader || null);
      setMembers(project.members || []);
      setProjectManager(project.manager || null);
      setLoading(false);
    } else if (projectId) {
      // Fetch from API if project not provided
      fetchTeamMembers();
    }
  }, [projectId, project]);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`/api/team-leader/projects/${projectId}/members`);
      const { teamLeader: tl, members: memberList, projectManager: pm } = response.data.data;
      
      setTeamLeader(tl);
      setMembers(memberList);
      setProjectManager(pm);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general' || spec === 'None') return null;
    return spec;
  };

  const getTaskCompletionColor = (percentage) => {
    if (percentage >= 80) return 'high';
    if (percentage >= 50) return 'medium';
    return 'low';
  };

  if (loading) {
    return (
      <div className="team-members-view">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="team-members-view">
      <div className="team-header">
        <div className="header-left">
          <Users size={24} />
          <h2>Team Members</h2>
        </div>
        <div className="read-only-badge">
          <AlertCircle size={16} />
          <span>Read-Only View</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Project Manager Section */}
      {projectManager && (
        <div className="pm-section">
          <div className="section-header">
            <Briefcase size={20} />
            <h3>Project Manager</h3>
          </div>
          <div className="pm-card">
            <div className="member-avatar pm-avatar">
              {projectManager.firstName?.[0]}{projectManager.lastName?.[0]}
            </div>
            <div className="member-info">
              <div className="member-name">
                {projectManager.firstName} {projectManager.lastName}
              </div>
              <div className="member-email">
                <Mail size={14} />
                {projectManager.email}
              </div>
            </div>
            <div className="member-badge pm-badge">
              <Briefcase size={18} />
              <span>PM</span>
            </div>
          </div>
        </div>
      )}

      {/* Team Leader Section */}
      <div className="team-leader-section">
        <div className="section-header">
          <Crown size={20} />
          <h3>Team Leader</h3>
        </div>

        {teamLeader ? (
          <div className="team-leader-card">
            <div className="member-avatar tl-avatar">
              {teamLeader.firstName?.[0]}{teamLeader.lastName?.[0]}
            </div>
            <div className="member-info">
              <div className="member-name">
                {teamLeader.firstName} {teamLeader.lastName}
              </div>
              <div className="member-email">
                <Mail size={14} />
                {teamLeader.email}
              </div>
              {getSpecializationDisplay(teamLeader.specialization) && (
                <div className="member-specialization">
                  <span className="badge badge-specialization">
                    {teamLeader.specialization}
                  </span>
                </div>
              )}
            </div>
            {teamLeader.taskStats && (
              <div className="task-stats">
                <div className="stat-item">
                  <span className="stat-value">{teamLeader.taskStats.total}</span>
                  <span className="stat-label">Tasks</span>
                </div>
                <div className="stat-item">
                  <div className={`completion-badge ${getTaskCompletionColor(teamLeader.taskStats.completion)}`}>
                    <CheckCircle size={14} />
                    {teamLeader.taskStats.completion}%
                  </div>
                </div>
              </div>
            )}
            <div className="member-badge tl-badge">
              <Crown size={18} />
              <span>Team Leader</span>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Crown size={48} />
            <p>No Team Leader assigned</p>
          </div>
        )}
      </div>

      {/* Team Members Section */}
      <div className="team-members-section">
        <div className="section-header">
          <Users size={20} />
          <h3>Team Members ({members.length})</h3>
        </div>

        {members.length > 0 ? (
          <div className="members-grid">
            {members.map((member) => (
              <div key={member._id} className="member-card">
                <div className="member-avatar">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
                <div className="member-info">
                  <div className="member-name">
                    {member.firstName} {member.lastName}
                  </div>
                  <div className="member-email">
                    <Mail size={14} />
                    {member.email}
                  </div>
                  {getSpecializationDisplay(member.specialization) && (
                    <div className="member-specialization">
                      <span className="badge badge-specialization">
                        {member.specialization}
                      </span>
                    </div>
                  )}
                  {member.role && (
                    <div className="member-role">
                      <span className="role-text">{member.role}</span>
                    </div>
                  )}
                </div>
                {member.taskStats && (
                  <div className="task-stats-vertical">
                    <div className="stat-row">
                      <Clock size={14} />
                      <span className="stat-text">
                        {member.taskStats.completed}/{member.taskStats.total} tasks
                      </span>
                    </div>
                    <div className="completion-bar">
                      <div 
                        className={`completion-fill ${getTaskCompletionColor(member.taskStats.completion)}`}
                        style={{ width: `${member.taskStats.completion}%` }}
                      ></div>
                    </div>
                    <div className="completion-percentage">
                      {member.taskStats.completion}% complete
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <p>No team members yet</p>
            <span>Team members will appear here when added to the project</span>
          </div>
        )}
      </div>

      {/* Info Note */}
      <div className="info-note">
        <AlertCircle size={16} />
        <div>
          <strong>Note:</strong> This is a read-only view. Only the Project Manager can add or remove team members.
        </div>
      </div>
    </div>
  );
};

export default TeamMembersView;

