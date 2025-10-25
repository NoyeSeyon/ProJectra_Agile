import React, { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, TrendingUp, Crown } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './MemberTeam.css';

const MemberTeam = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState([]);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      setLoading(true);

      // Load projects
      const projectsRes = await axios.get('/api/team-leader/projects');
      const projectsData = projectsRes.data.data.projects || [];
      setProjects(projectsData);

      // Collect unique team members (excluding current user)
      const membersMap = new Map();
      const currentUserId = user?._id || user?.id;

      projectsData.forEach(project => {
        project.members?.forEach(member => {
          // Skip if this is the current user
          if (member.user._id === currentUserId || member.user.id === currentUserId) {
            return;
          }

          if (!membersMap.has(member.user._id)) {
            membersMap.set(member.user._id, {
              ...member.user,
              projects: [],
              role: 'member'
            });
          }
          membersMap.get(member.user._id).projects.push(project.name);
        });

        // Add team leader (if not current user)
        if (project.teamLeader) {
          const tlId = project.teamLeader._id || project.teamLeader.id;
          
          // Skip if team leader is the current user
          if (tlId === currentUserId) {
            return;
          }

          if (!membersMap.has(tlId)) {
            membersMap.set(tlId, {
              ...project.teamLeader,
              projects: [],
              role: 'team_leader'
            });
          }
          membersMap.get(tlId).projects.push(`${project.name} (TL)`);
          membersMap.get(tlId).role = 'team_leader';
        }
      });

      setTeamMembers(Array.from(membersMap.values()));
    } catch (err) {
      console.error('Load team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSpecializationDisplay = (spec) => {
    if (!spec || spec === 'general') return 'General';
    return spec.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="loading-container">
        <LoadingSpinner size="lg" text="Loading team..." />
      </div>
    );
  }

  return (
    <div className="member-team">
      <div className="team-header">
        <h2>
          <Users size={28} />
          Team Members
        </h2>
        <div className="team-count">{teamMembers.length} members</div>
      </div>

      <div className="team-grid">
        {teamMembers.map((member) => (
          <div key={member._id} className="member-card">
            <div className="member-avatar">
              {member.avatar ? (
                <img src={member.avatar} alt={member.firstName} />
              ) : (
                <div className="avatar-placeholder">
                  {member.firstName?.[0]}{member.lastName?.[0]}
                </div>
              )}
            </div>

            <div className="member-info">
              <h3 className="member-name">
                {member.firstName} {member.lastName}
                {member.role === 'team_leader' && (
                  <Crown size={16} className="tl-icon" />
                )}
              </h3>

              <div className="member-details">
                {member.email && (
                  <div className="detail-item">
                    <Mail size={14} />
                    <span>{member.email}</span>
                  </div>
                )}

                <div className="detail-item">
                  <Briefcase size={14} />
                  <span>{getSpecializationDisplay(member.specialization)}</span>
                </div>

                {member.projects && member.projects.length > 0 && (
                  <div className="detail-item">
                    <TrendingUp size={14} />
                    <span>{member.projects.length} project(s)</span>
                  </div>
                )}
              </div>

              {member.projects && member.projects.length > 0 && (
                <div className="member-projects">
                  <strong>Projects:</strong>
                  <div className="project-tags">
                    {member.projects.map((proj, idx) => (
                      <span key={idx} className="project-tag">
                        {proj}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {teamMembers.length === 0 && (
        <div className="empty-state">
          <Users size={64} />
          <h3>No team members yet</h3>
          <p>Team members will appear here when you're assigned to projects</p>
        </div>
      )}
    </div>
  );
};

export default MemberTeam;

