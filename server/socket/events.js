/**
 * Socket.io Event Handlers
 * Centralized real-time event management
 */

const jwt = require('jsonwebtoken');

class SocketEvents {
  constructor(io) {
    this.io = io;
  }

  /**
   * Initialize all socket event handlers
   */
  initialize() {
    this.io.on('connection', (socket) => {
      console.log('🔌 New socket connection:', socket.id);

      // Authenticate socket connection
      this.authenticateSocket(socket);

      // Room management
      this.handleRoomJoining(socket);

      // Task events
      this.handleTaskEvents(socket);

      // Subtask events
      this.handleSubtaskEvents(socket);

      // Time tracking events
      this.handleTimeTrackingEvents(socket);

      // Budget events
      this.handleBudgetEvents(socket);

      // Project events
      this.handleProjectEvents(socket);

      // Chat and collaboration
      this.handleChatEvents(socket);
      this.handlePresenceEvents(socket);
      this.handleTypingEvents(socket);

      // Kanban events
      this.handleKanbanEvents(socket);

      // Member management events
      this.handleMemberManagementEvents(socket);

      // Notification events
      this.handleNotificationEvents(socket);

      // Disconnect
      this.handleDisconnect(socket);
    });
  }

  /**
   * Authenticate socket connection
   */
  authenticateSocket(socket) {
    const token = socket.handshake.auth.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        socket.userRole = decoded.role;
        socket.organizationId = decoded.organization;
        console.log(`✅ Socket authenticated: User ${decoded.id}`);
      } catch (error) {
        console.error('❌ Socket authentication failed:', error.message);
      }
    }
  }

  /**
   * Handle room joining
   */
  handleRoomJoining(socket) {
    // Join organization room
    socket.on('join-org', (orgId) => {
      socket.join(`org:${orgId}`);
      console.log(`👥 User joined org room: ${orgId}`);
    });

    // Join project room
    socket.on('join-project', (orgId, projectId) => {
      socket.join(`org:${orgId}`);
      socket.join(`project:${projectId}`);
      console.log(`📁 User joined project room: ${projectId}`);
    });

    // Leave project room
    socket.on('leave-project', (orgId, projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`📁 User left project room: ${projectId}`);
    });

    // Join channel room
    socket.on('join-channel', (orgId, channelId) => {
      socket.join(`channel:${channelId}`);
      console.log(`💬 User joined channel: ${channelId}`);
    });

    // Leave channel room
    socket.on('leave-channel', (orgId, channelId) => {
      socket.leave(`channel:${channelId}`);
      console.log(`💬 User left channel: ${channelId}`);
    });
  }

  /**
   * Handle task events
   */
  handleTaskEvents(socket) {
    // Task created
    socket.on('task:created', (data) => {
      console.log('📝 Task created:', data.taskId);
      
      // Broadcast to organization
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('task:created', {
          task: data.task,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }

      // Broadcast to project
      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('task:created', {
          task: data.task,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Task updated
    socket.on('task:updated', (data) => {
      console.log('✏️ Task updated:', data.taskId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('task:updated', {
          taskId: data.taskId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('task:updated', {
          taskId: data.taskId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Task deleted
    socket.on('task:deleted', (data) => {
      console.log('🗑️ Task deleted:', data.taskId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('task:deleted', {
          taskId: data.taskId,
          deletedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Task assigned
    socket.on('task:assigned', (data) => {
      console.log('👤 Task assigned:', data.taskId, 'to', data.assigneeId);
      
      // Notify assignee
      this.io.to(`org:${data.organizationId}`).emit('task:assigned', {
        taskId: data.taskId,
        assigneeId: data.assigneeId,
        assignedBy: socket.userId,
        timestamp: new Date()
      });

      // Send notification to assignee
      this.io.to(`org:${data.organizationId}`).emit('notification:received', {
        userId: data.assigneeId,
        type: 'task_assigned',
        message: 'You have been assigned a new task',
        taskId: data.taskId,
        timestamp: new Date()
      });
    });

    // Task dependency added
    socket.on('task:dependencyAdded', (data) => {
      console.log('🔗 Task dependency added:', data.taskId, '→', data.dependencyId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('task:dependencyAdded', {
          taskId: data.taskId,
          dependencyId: data.dependencyId,
          addedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('task:dependencyAdded', {
          taskId: data.taskId,
          dependencyId: data.dependencyId,
          addedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Task dependency removed
    socket.on('task:dependencyRemoved', (data) => {
      console.log('🔓 Task dependency removed:', data.taskId, '→', data.dependencyId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('task:dependencyRemoved', {
          taskId: data.taskId,
          dependencyId: data.dependencyId,
          removedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('task:dependencyRemoved', {
          taskId: data.taskId,
          dependencyId: data.dependencyId,
          removedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle subtask events
   */
  handleSubtaskEvents(socket) {
    // Subtask created
    socket.on('subtask:created', (data) => {
      console.log('📝 Subtask created:', data.subtaskId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('subtask:created', {
          mainTaskId: data.mainTaskId,
          subtask: data.subtask,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('subtask:created', {
          mainTaskId: data.mainTaskId,
          subtask: data.subtask,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Subtasks bulk created
    socket.on('subtasks:bulk-created', (data) => {
      console.log('📝 Multiple subtasks created:', data.subtasks.length);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('subtasks:bulk-created', {
          mainTaskId: data.mainTaskId,
          subtasks: data.subtasks,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Subtask updated
    socket.on('subtask:updated', (data) => {
      console.log('✏️ Subtask updated:', data.subtaskId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('subtask:updated', {
          mainTaskId: data.mainTaskId,
          subtaskId: data.subtaskId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle time tracking events
   */
  handleTimeTrackingEvents(socket) {
    // Time logged
    socket.on('time:logged', (data) => {
      console.log('⏱️ Time logged:', data.hours, 'hours');
      
      // Broadcast to organization
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('time:logged', {
          taskId: data.taskId,
          userId: socket.userId,
          hours: data.hours,
          timestamp: new Date()
        });
      }

      // Broadcast to project
      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('time:logged', {
          taskId: data.taskId,
          userId: socket.userId,
          hours: data.hours,
          timestamp: new Date()
        });
      }

      // Update task time tracking in real-time
      this.io.to(`org:${data.organizationId}`).emit('task:time-updated', {
        taskId: data.taskId,
        loggedHours: data.totalLoggedHours,
        timestamp: new Date()
      });
    });

    // Time log updated
    socket.on('time:updated', (data) => {
      console.log('✏️ Time log updated:', data.logId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('time:updated', {
          taskId: data.taskId,
          logId: data.logId,
          updates: data.updates,
          timestamp: new Date()
        });
      }
    });

    // Time log deleted
    socket.on('time:deleted', (data) => {
      console.log('🗑️ Time log deleted:', data.logId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('time:deleted', {
          taskId: data.taskId,
          logId: data.logId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle budget events
   */
  handleBudgetEvents(socket) {
    // Budget updated
    socket.on('budget:updated', (data) => {
      console.log('💰 Budget updated for project:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('budget:updated', {
          projectId: data.projectId,
          budget: data.budget,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }

      this.io.to(`project:${data.projectId}`).emit('budget:updated', {
        budget: data.budget,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Expense logged
    socket.on('expense:logged', (data) => {
      console.log('💸 Expense logged:', data.amount);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('expense:logged', {
          projectId: data.projectId,
          expense: data.expense,
          loggedBy: socket.userId,
          timestamp: new Date()
        });
      }

      this.io.to(`project:${data.projectId}`).emit('expense:logged', {
        expense: data.expense,
        loggedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Budget alert
    socket.on('budget:alert', (data) => {
      console.log('⚠️ Budget alert for project:', data.projectId);
      
      // Send alert to organization
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('budget:alert', {
          projectId: data.projectId,
          percentage: data.percentage,
          alertLevel: data.alertLevel, // 'warning' or 'critical'
          message: data.message,
          timestamp: new Date()
        });
      }

      // Send notification to project members
      this.io.to(`project:${data.projectId}`).emit('notification:received', {
        type: 'budget_alert',
        projectId: data.projectId,
        message: data.message,
        severity: data.alertLevel,
        timestamp: new Date()
      });
    });
  }

  /**
   * Handle project events
   */
  handleProjectEvents(socket) {
    // Project created
    socket.on('project:created', (data) => {
      console.log('📁 Project created:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('project:created', {
          project: data.project,
          createdBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Project updated
    socket.on('project:updated', (data) => {
      console.log('✏️ Project updated:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('project:updated', {
          projectId: data.projectId,
          updates: data.updates,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }

      this.io.to(`project:${data.projectId}`).emit('project:updated', {
        updates: data.updates,
        updatedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Project deleted
    socket.on('project:deleted', (data) => {
      console.log('🗑️ Project deleted:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('project:deleted', {
          projectId: data.projectId,
          deletedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Project settings updated
    socket.on('project:settingsUpdated', (data) => {
      console.log('⚙️ Project settings updated:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('project:settingsUpdated', {
          projectId: data.projectId,
          settings: data.settings,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }

      // Also broadcast to specific project room
      this.io.to(`project:${data.projectId}`).emit('project:settingsUpdated', {
        projectId: data.projectId,
        settings: data.settings,
        updatedBy: socket.userId,
        timestamp: new Date()
      });

      // Send notification to Team Leaders of this project
      if (data.settings.allowTeamLeaderSubtasks !== undefined) {
        const message = data.settings.allowTeamLeaderSubtasks
          ? 'Subtask creation has been enabled for this project'
          : 'Subtask creation has been disabled for this project';
        
        this.io.to(`project:${data.projectId}`).emit('notification:received', {
          type: 'project_settings_updated',
          message: message,
          projectId: data.projectId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle Kanban events
   */
  handleKanbanEvents(socket) {
    // Card moved
    socket.on('card:moved', (data) => {
      console.log('🔄 Card moved:', data.taskId, 'to', data.newStatus);
      
      if (data.organizationId) {
        // Broadcast to everyone except sender
        socket.to(`org:${data.organizationId}`).emit('card:moved', {
          taskId: data.taskId,
          newStatus: data.newStatus,
          movedBy: socket.userId,
          userName: data.userName,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        socket.to(`project:${data.projectId}`).emit('card:moved', {
          taskId: data.taskId,
          newStatus: data.newStatus,
          movedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });

    // Card dragging (show who is dragging)
    socket.on('card:dragging', (data) => {
      if (data.organizationId) {
        socket.to(`org:${data.organizationId}`).emit('card:dragging', {
          taskId: data.taskId,
          userId: socket.userId,
          userName: data.userName,
          timestamp: new Date()
        });
      }
    });

    // Card drag end
    socket.on('card:drag-end', (data) => {
      if (data.organizationId) {
        socket.to(`org:${data.organizationId}`).emit('card:drag-end', {
          taskId: data.taskId,
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle chat events
   */
  handleChatEvents(socket) {
    // Chat message
    socket.on('chat:message', (data) => {
      console.log('💬 Chat message in channel:', data.channelId);
      
      this.io.to(`channel:${data.channelId}`).emit('chat:message', {
        channelId: data.channelId,
        message: data.message,
        userId: socket.userId,
        timestamp: new Date()
      });
    });

    // Message edited
    socket.on('chat:message-edited', (data) => {
      this.io.to(`channel:${data.channelId}`).emit('chat:message-edited', {
        messageId: data.messageId,
        newContent: data.newContent,
        editedBy: socket.userId,
        timestamp: new Date()
      });
    });

    // Message deleted
    socket.on('chat:message-deleted', (data) => {
      this.io.to(`channel:${data.channelId}`).emit('chat:message-deleted', {
        messageId: data.messageId,
        deletedBy: socket.userId,
        timestamp: new Date()
      });
    });
  }

  /**
   * Handle typing events
   */
  handleTypingEvents(socket) {
    // Typing start
    socket.on('typing:start', (data) => {
      socket.to(`channel:${data.channelId}`).emit('typing:start', {
        userId: socket.userId,
        channelId: data.channelId,
        userName: data.userName
      });
    });

    // Typing stop
    socket.on('typing:stop', (data) => {
      socket.to(`channel:${data.channelId}`).emit('typing:stop', {
        userId: socket.userId,
        channelId: data.channelId
      });
    });
  }

  /**
   * Handle presence events
   */
  handlePresenceEvents(socket) {
    // User presence update
    socket.on('presence:update', (data) => {
      console.log('👤 Presence update:', socket.userId, data.status);
      
      if (data.organizationId || socket.organizationId) {
        const orgId = data.organizationId || socket.organizationId;
        this.io.to(`org:${orgId}`).emit('presence:updated', {
          userId: socket.userId,
          status: data.status, // 'online', 'away', 'busy', 'offline'
          timestamp: new Date()
        });
      }
    });

    // User online
    socket.on('user:online', (data) => {
      if (socket.organizationId) {
        this.io.to(`org:${socket.organizationId}`).emit('user:online', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle member management events
   */
  handleMemberManagementEvents(socket) {
    // Member added to project
    socket.on('member:added', (data) => {
      console.log('👥 Member added to project:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('member:added', {
          projectId: data.projectId,
          projectName: data.projectName,
          member: data.member,
          addedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('member:added', {
          member: data.member,
          addedBy: socket.userId,
          timestamp: new Date()
        });
      }

      // Send notification to added member
      this.io.to(`org:${data.organizationId}`).emit('notification:received', {
        userId: data.member.id,
        type: 'project_assigned',
        message: `You have been added to project: ${data.projectName}`,
        projectId: data.projectId,
        timestamp: new Date()
      });
    });

    // Member removed from project
    socket.on('member:removed', (data) => {
      console.log('👥 Member removed from project:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('member:removed', {
          projectId: data.projectId,
          projectName: data.projectName,
          memberId: data.member.id,
          tasksReassigned: data.tasksReassigned,
          removedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('member:removed', {
          memberId: data.member.id,
          tasksReassigned: data.tasksReassigned,
          removedBy: socket.userId,
          timestamp: new Date()
        });
      }

      // Send notification to removed member
      this.io.to(`org:${data.organizationId}`).emit('notification:received', {
        userId: data.member.id,
        type: 'project_unassigned',
        message: `You have been removed from project: ${data.projectName}`,
        projectId: data.projectId,
        timestamp: new Date()
      });
    });

    // Team leader changed
    socket.on('teamLeader:changed', (data) => {
      console.log('👤 Team leader changed for project:', data.projectId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('teamLeader:changed', {
          projectId: data.projectId,
          projectName: data.projectName,
          oldTeamLeader: data.oldTeamLeader,
          newTeamLeader: data.newTeamLeader,
          changedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('teamLeader:changed', {
          oldTeamLeader: data.oldTeamLeader,
          newTeamLeader: data.newTeamLeader,
          changedBy: socket.userId,
          timestamp: new Date()
        });
      }

      // Send notification to new team leader
      if (data.newTeamLeader && data.newTeamLeader.id) {
        this.io.to(`org:${data.organizationId}`).emit('notification:received', {
          userId: data.newTeamLeader.id,
          type: 'team_leader_assigned',
          message: `You are now the Team Leader for project: ${data.projectName}`,
          projectId: data.projectId,
          timestamp: new Date()
        });
      }

      // Send notification to old team leader (if exists)
      if (data.oldTeamLeader) {
        this.io.to(`org:${data.organizationId}`).emit('notification:received', {
          userId: data.oldTeamLeader,
          type: 'team_leader_unassigned',
          message: `You are no longer the Team Leader for project: ${data.projectName}`,
          projectId: data.projectId,
          timestamp: new Date()
        });
      }
    });

    // Member specialization updated
    socket.on('member:specializationUpdated', (data) => {
      console.log('🎨 Member specialization updated:', data.userId);
      
      if (data.organizationId) {
        this.io.to(`org:${data.organizationId}`).emit('member:specializationUpdated', {
          projectId: data.projectId,
          userId: data.userId,
          specialization: data.specialization,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }

      if (data.projectId) {
        this.io.to(`project:${data.projectId}`).emit('member:specializationUpdated', {
          userId: data.userId,
          specialization: data.specialization,
          updatedBy: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }

  /**
   * Handle notification events
   */
  handleNotificationEvents(socket) {
    // Send notification
    socket.on('notification:send', (data) => {
      console.log('🔔 Notification sent to:', data.userId);
      
      // Send to specific user (broadcast to all their connections)
      this.io.to(`org:${data.organizationId}`).emit('notification:received', {
        userId: data.userId,
        type: data.type,
        message: data.message,
        data: data.data,
        timestamp: new Date()
      });
    });

    // Mark notification as read
    socket.on('notification:read', (data) => {
      this.io.to(`org:${data.organizationId}`).emit('notification:read', {
        notificationId: data.notificationId,
        userId: socket.userId,
        timestamp: new Date()
      });
    });
  }

  /**
   * Handle disconnect
   */
  handleDisconnect(socket) {
    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected:', socket.id);
      
      // Broadcast user offline
      if (socket.organizationId) {
        this.io.to(`org:${socket.organizationId}`).emit('user:offline', {
          userId: socket.userId,
          timestamp: new Date()
        });
      }
    });
  }
}

module.exports = SocketEvents;

