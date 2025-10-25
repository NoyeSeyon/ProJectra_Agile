import React, { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, TrendingUp } from 'lucide-react';
import { getPMTeam } from '../../services/pmService';
import './PMTeam.css';

const PMTeam = () => {
  const [teamData, setTeamData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const response = await getPMTeam();
      setTeamData(response.data);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="pm-loading"><div className="pm-spinner"></div></div>;
  }

  const { teamMembers = [], stats = {} } = teamData || {};

  return (
    <div className="pm-team">
      <div className="team-header">
        <h2>My Team</h2>
        <div className="team-stats-summary">
          <div className="stat-item">
            <Users size={20} />
            <span>{stats.totalMembers || 0} Members</span>
          </div>
          <div className="stat-item">
            <Briefcase size={20} />
            <span>{stats.totalProjects || 0} Projects</span>
          </div>
          <div className="stat-item">
            <TrendingUp size={20} />
            <span>{stats.averageWorkload || 0}% Avg Workload</span>
          </div>
        </div>
      </div>

      <div className="team-grid">
        {teamMembers.length > 0 ? (
          teamMembers.map(member => (
            <div key={member._id} className="team-member-card">
              <div className="member-avatar">
                {member.firstName?.[0]}{member.lastName?.[0]}
              </div>
              <h3>{member.firstName} {member.lastName}</h3>
              <p className="member-role">{member.role?.replace('_', ' ')}</p>
              <p className="member-email">
                <Mail size={14} />
                {member.email}
              </p>

              <div className="member-workload">
                <div className="workload-header">
                  <span>Workload</span>
                  <span className="workload-value">{member.workloadPercentage}%</span>
                </div>
                <div className="workload-bar">
                  <div
                    className="workload-fill"
                    style={{
                      width: `${Math.min(member.workloadPercentage, 100)}%`,
                      backgroundColor:
                        member.workloadPercentage > 90 ? '#ef4444' :
                        member.workloadPercentage > 70 ? '#f59e0b' : '#10b981'
                    }}
                  />
                </div>
              </div>

              <div className="member-projects">
                <h4>Projects ({member.projectCount})</h4>
                <div className="projects-list">
                  {member.projects?.slice(0, 3).map(project => (
                    <span key={project._id} className="project-tag">{project.name}</span>
                  ))}
                  {member.projectCount > 3 && (
                    <span className="more-projects">+{member.projectCount - 3} more</span>
                  )}
                </div>
              </div>

              {member.skills && member.skills.length > 0 && (
                <div className="member-skills">
                  {member.skills.slice(0, 3).map((skill, idx) => (
                    <span key={idx} className="skill-tag">{skill}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <p>No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PMTeam;

