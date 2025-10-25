import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5001', {
        auth: {
          token: token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setConnected(true);
        
        if (user.organization) {
          newSocket.emit('join-org', user.organization);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnected(false);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
        setConnected(false);
      }
    }
  }, [isAuthenticated, user]);

  const joinProject = (projectId) => {
    if (socket && user?.organization) {
      socket.emit('join-project', user.organization, projectId);
    }
  };

  const leaveProject = (projectId) => {
    if (socket && user?.organization) {
      socket.emit('leave-project', user.organization, projectId);
    }
  };

  const emitCardMoved = (data) => {
    if (socket) {
      socket.emit('card:moved', data);
    }
  };

  const emitChatMessage = (data) => {
    if (socket) {
      socket.emit('chat:message', data);
    }
  };

  const onCardMoved = (callback) => {
    if (socket) {
      socket.on('card:moved', callback);
      return () => socket.off('card:moved', callback);
    }
  };

  const onChatMessage = (callback) => {
    if (socket) {
      socket.on('chat:message', callback);
      return () => socket.off('chat:message', callback);
    }
  };

  const joinChannel = (channelId) => {
    if (socket && user?.organization) {
      socket.emit('join-channel', user.organization, channelId);
    }
  };

  const leaveChannel = (channelId) => {
    if (socket && user?.organization) {
      socket.emit('leave-channel', user.organization, channelId);
    }
  };

  const emitTaskUpdated = (data) => {
    if (socket) {
      socket.emit('task:updated', data);
    }
  };

  const emitProjectUpdated = (data) => {
    if (socket) {
      socket.emit('project:updated', data);
    }
  };

  const emitActivityCreated = (data) => {
    if (socket) {
      socket.emit('activity:created', data);
    }
  };

  const emitTypingStart = (channelId) => {
    if (socket && user?.organization) {
      socket.emit('typing:start', {
        orgId: user.organization,
        channelId
      });
    }
  };

  const emitTypingStop = (channelId) => {
    if (socket && user?.organization) {
      socket.emit('typing:stop', {
        orgId: user.organization,
        channelId
      });
    }
  };

  const emitPresenceUpdate = (status) => {
    if (socket && user?.organization) {
      socket.emit('presence:update', {
        orgId: user.organization,
        status
      });
    }
  };

  const onTaskUpdated = (callback) => {
    if (socket) {
      socket.on('task:updated', callback);
      return () => socket.off('task:updated', callback);
    }
  };

  const onProjectUpdated = (callback) => {
    if (socket) {
      socket.on('project:updated', callback);
      return () => socket.off('project:updated', callback);
    }
  };

  const onActivityCreated = (callback) => {
    if (socket) {
      socket.on('activity:created', callback);
      return () => socket.off('activity:created', callback);
    }
  };

  const onTypingStart = (callback) => {
    if (socket) {
      socket.on('typing:start', callback);
      return () => socket.off('typing:start', callback);
    }
  };

  const onTypingStop = (callback) => {
    if (socket) {
      socket.on('typing:stop', callback);
      return () => socket.off('typing:stop', callback);
    }
  };

  const onPresenceUpdated = (callback) => {
    if (socket) {
      socket.on('presence:updated', callback);
      return () => socket.off('presence:updated', callback);
    }
  };

  const onNotificationReceived = (callback) => {
    if (socket) {
      socket.on('notification:received', callback);
      return () => socket.off('notification:received', callback);
    }
  };

  // New event handlers for Phase 11

  // Subtask events
  const emitSubtaskCreated = (data) => {
    if (socket && user?.organization) {
      socket.emit('subtask:created', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const onSubtaskCreated = (callback) => {
    if (socket) {
      socket.on('subtask:created', callback);
      return () => socket.off('subtask:created', callback);
    }
  };

  const onSubtaskUpdated = (callback) => {
    if (socket) {
      socket.on('subtask:updated', callback);
      return () => socket.off('subtask:updated', callback);
    }
  };

  // Time tracking events
  const emitTimeLogged = (data) => {
    if (socket && user?.organization) {
      socket.emit('time:logged', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const onTimeLogged = (callback) => {
    if (socket) {
      socket.on('time:logged', callback);
      return () => socket.off('time:logged', callback);
    }
  };

  const onTimeUpdated = (callback) => {
    if (socket) {
      socket.on('time:updated', callback);
      return () => socket.off('time:updated', callback);
    }
  };

  const onTaskTimeUpdated = (callback) => {
    if (socket) {
      socket.on('task:time-updated', callback);
      return () => socket.off('task:time-updated', callback);
    }
  };

  // Budget events
  const emitBudgetUpdated = (data) => {
    if (socket && user?.organization) {
      socket.emit('budget:updated', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const emitExpenseLogged = (data) => {
    if (socket && user?.organization) {
      socket.emit('expense:logged', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const onBudgetUpdated = (callback) => {
    if (socket) {
      socket.on('budget:updated', callback);
      return () => socket.off('budget:updated', callback);
    }
  };

  const onExpenseLogged = (callback) => {
    if (socket) {
      socket.on('expense:logged', callback);
      return () => socket.off('expense:logged', callback);
    }
  };

  const onBudgetAlert = (callback) => {
    if (socket) {
      socket.on('budget:alert', callback);
      return () => socket.off('budget:alert', callback);
    }
  };

  // Task events
  const emitTaskCreated = (data) => {
    if (socket && user?.organization) {
      socket.emit('task:created', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const emitTaskDeleted = (data) => {
    if (socket && user?.organization) {
      socket.emit('task:deleted', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const onTaskCreated = (callback) => {
    if (socket) {
      socket.on('task:created', callback);
      return () => socket.off('task:created', callback);
    }
  };

  const onTaskDeleted = (callback) => {
    if (socket) {
      socket.on('task:deleted', callback);
      return () => socket.off('task:deleted', callback);
    }
  };

  const onTaskAssigned = (callback) => {
    if (socket) {
      socket.on('task:assigned', callback);
      return () => socket.off('task:assigned', callback);
    }
  };

  const onTaskDependencyAdded = (callback) => {
    if (socket) {
      socket.on('task:dependencyAdded', callback);
      return () => socket.off('task:dependencyAdded', callback);
    }
  };

  const onTaskDependencyRemoved = (callback) => {
    if (socket) {
      socket.on('task:dependencyRemoved', callback);
      return () => socket.off('task:dependencyRemoved', callback);
    }
  };

  // Project events
  const emitProjectCreated = (data) => {
    if (socket && user?.organization) {
      socket.emit('project:created', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const emitProjectDeleted = (data) => {
    if (socket && user?.organization) {
      socket.emit('project:deleted', {
        ...data,
        organizationId: user.organization
      });
    }
  };

  const onProjectCreated = (callback) => {
    if (socket) {
      socket.on('project:created', callback);
      return () => socket.off('project:created', callback);
    }
  };

  // Member Management Events
  const onMemberAdded = (callback) => {
    if (socket) {
      socket.on('member:added', callback);
      return () => socket.off('member:added', callback);
    }
  };

  const onMemberRemoved = (callback) => {
    if (socket) {
      socket.on('member:removed', callback);
      return () => socket.off('member:removed', callback);
    }
  };

  const onTeamLeaderChanged = (callback) => {
    if (socket) {
      socket.on('teamLeader:changed', callback);
      return () => socket.off('teamLeader:changed', callback);
    }
  };

  const onMemberSpecializationUpdated = (callback) => {
    if (socket) {
      socket.on('member:specializationUpdated', callback);
      return () => socket.off('member:specializationUpdated', callback);
    }
  };

  const onProjectDeleted = (callback) => {
    if (socket) {
      socket.on('project:deleted', callback);
      return () => socket.off('project:deleted', callback);
    }
  };

  const onProjectSettingsUpdated = (callback) => {
    if (socket) {
      socket.on('project:settingsUpdated', callback);
      return () => socket.off('project:settingsUpdated', callback);
    }
  };

  // User presence
  const onUserOnline = (callback) => {
    if (socket) {
      socket.on('user:online', callback);
      return () => socket.off('user:online', callback);
    }
  };

  const onUserOffline = (callback) => {
    if (socket) {
      socket.on('user:offline', callback);
      return () => socket.off('user:offline', callback);
    }
  };

  const value = {
    socket,
    connected,
    joinProject,
    leaveProject,
    joinChannel,
    leaveChannel,
    emitCardMoved,
    emitChatMessage,
    emitTaskUpdated,
    emitProjectUpdated,
    emitActivityCreated,
    emitTypingStart,
    emitTypingStop,
    emitPresenceUpdate,
    onCardMoved,
    onChatMessage,
    onTaskUpdated,
    onProjectUpdated,
    onActivityCreated,
    onTypingStart,
    onTypingStop,
    onPresenceUpdated,
    onNotificationReceived,
    // Phase 11 - New event handlers
    emitSubtaskCreated,
    onSubtaskCreated,
    onSubtaskUpdated,
    emitTimeLogged,
    onTimeLogged,
    onTimeUpdated,
    onTaskTimeUpdated,
    emitBudgetUpdated,
    emitExpenseLogged,
    onBudgetUpdated,
    onExpenseLogged,
    onBudgetAlert,
    emitTaskCreated,
    emitTaskDeleted,
    onTaskCreated,
    onTaskDeleted,
    onTaskAssigned,
    onTaskDependencyAdded,
    onTaskDependencyRemoved,
    emitProjectCreated,
    emitProjectDeleted,
    onProjectCreated,
    onProjectDeleted,
    onProjectSettingsUpdated,
    onUserOnline,
    onUserOffline,
    // Member management events
    onMemberAdded,
    onMemberRemoved,
    onTeamLeaderChanged,
    onMemberSpecializationUpdated
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;