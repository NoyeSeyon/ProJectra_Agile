/**
 * AI Assistant Service
 * Intelligent response system with NLP-like capabilities
 */

// Command patterns for intent recognition
const commandPatterns = {
  createTask: /create\s+(a\s+)?(task|todo).*?(?:for|about|titled?)\s+(.+?)(?:\s+(?:with|at|for)\s+(?:priority\s+)?(low|medium|high|urgent))?(?:\s+(?:due|deadline|by)\s+(.+))?$/i,
  showTasks: /show|list|display|get.*?tasks?(?:\s+(overdue|pending|completed|all))?/i,
  showProjects: /show|list|display|get.*?projects?/i,
  teamStatus: /team|members|who.*?working/i,
  projectStatus: /status|progress.*?(?:project|of)\s+(.+)/i,
  help: /help|what can you do|commands/i,
  analytics: /analytics|stats|statistics|metrics|insights/i,
  suggestions: /suggest|recommend|advice|tips/i
};

// Smart responses based on context
const responses = {
  greeting: [
    "Hello! I'm Projectra AI, your intelligent project assistant. How can I help you today?",
    "Hi there! Ready to boost your productivity? What would you like to do?",
    "Welcome! I'm here to help you manage your projects efficiently. What's on your mind?"
  ],
  taskCreated: (taskName, priority, dueDate) => {
    return `✅ Task created successfully!\n\n📝 **${taskName}**\n🎯 Priority: ${priority || 'Medium'}\n📅 Due: ${dueDate || 'Not set'}\n\nWould you like to assign it to someone?`;
  },
  error: [
    "I apologize, but I couldn't process that request. Could you try rephrasing?",
    "Hmm, I didn't quite understand that. Can you provide more details?",
    "I'm having trouble with that command. Try 'help' to see what I can do!"
  ],
  help: `🤖 **Projectra AI Commands**

I can help you with:

**Task Management:**
• "Create a task for [task name]"
• "Create a high priority task for [task name] due tomorrow"
• "Show me overdue tasks"
• "List all pending tasks"

**Project Insights:**
• "Show project status"
• "What's the status of [project name]?"
• "Show me project analytics"

**Team Management:**
• "Show team status"
• "Who's working on [project]?"
• "Team workload"

**Smart Suggestions:**
• "Give me suggestions"
• "What should I work on next?"
• "Productivity tips"

Just ask me naturally, and I'll do my best to help! 😊`,
  
  suggestions: [
    "💡 **Smart Suggestions:**\n\n1. You have 3 high-priority tasks - consider tackling those first!\n2. Project 'Mobile App' is 75% complete - great progress!\n3. Team workload is balanced - good job distributing tasks!\n4. Upcoming deadline in 2 days for 'API Development'",
    "💡 **Productivity Tips:**\n\n1. Break large tasks into smaller, manageable pieces\n2. Set realistic deadlines with buffer time\n3. Review completed tasks weekly for insights\n4. Keep your team updated with regular check-ins"
  ]
};

class AIAssistantService {
  constructor() {
    this.conversationHistory = [];
    this.context = {
      lastIntent: null,
      lastEntities: {},
      userData: null
    };
  }

  /**
   * Process user message and generate intelligent response
   */
  async processMessage(message, userData = null) {
    this.context.userData = userData;
    
    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    try {
      // Detect intent and extract entities
      const { intent, entities } = this.parseIntent(message);
      this.context.lastIntent = intent;
      this.context.lastEntities = entities;

      // Generate response based on intent
      const response = await this.generateResponse(intent, entities, message);
      
      // Add response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        data: response.data
      });

      return {
        success: true,
        response: response.text,
        intent,
        entities,
        quickActions: response.quickActions || [],
        data: response.data
      };
    } catch (error) {
      console.error('AI Assistant error:', error);
      const errorResponse = this.getRandomResponse(responses.error);
      
      this.conversationHistory.push({
        role: 'assistant',
        content: errorResponse,
        timestamp: new Date(),
        error: true
      });

      return {
        success: false,
        response: errorResponse,
        intent: 'error'
      };
    }
  }

  /**
   * Parse user intent from message
   */
  parseIntent(message) {
    const lowerMessage = message.toLowerCase().trim();
    
    // Greeting detection
    if (/^(hi|hello|hey|good morning|good afternoon)/i.test(message)) {
      return { intent: 'greeting', entities: {} };
    }

    // Task creation
    const taskMatch = message.match(commandPatterns.createTask);
    if (taskMatch) {
      return {
        intent: 'createTask',
        entities: {
          taskName: taskMatch[3]?.trim(),
          priority: taskMatch[4]?.toLowerCase() || 'medium',
          dueDate: taskMatch[5]?.trim() || 'tomorrow'
        }
      };
    }

    // Show tasks
    if (commandPatterns.showTasks.test(message)) {
      const filter = message.match(/overdue|pending|completed|all/i)?.[0] || 'all';
      return { intent: 'showTasks', entities: { filter: filter.toLowerCase() } };
    }

    // Show projects
    if (commandPatterns.showProjects.test(message)) {
      return { intent: 'showProjects', entities: {} };
    }

    // Team status
    if (commandPatterns.teamStatus.test(message)) {
      return { intent: 'teamStatus', entities: {} };
    }

    // Project status
    const projectMatch = message.match(commandPatterns.projectStatus);
    if (projectMatch) {
      return { intent: 'projectStatus', entities: { projectName: projectMatch[1] } };
    }

    // Analytics
    if (commandPatterns.analytics.test(message)) {
      return { intent: 'analytics', entities: {} };
    }

    // Suggestions
    if (commandPatterns.suggestions.test(message)) {
      return { intent: 'suggestions', entities: {} };
    }

    // Help
    if (commandPatterns.help.test(message)) {
      return { intent: 'help', entities: {} };
    }

    // Default: conversational
    return { intent: 'conversational', entities: { message } };
  }

  /**
   * Generate intelligent response based on intent
   */
  async generateResponse(intent, entities, originalMessage) {
    switch (intent) {
      case 'greeting':
        return {
          text: this.getRandomResponse(responses.greeting),
          quickActions: [
            { label: '📝 Create Task', action: 'createTask' },
            { label: '📊 View Analytics', action: 'analytics' },
            { label: '👥 Team Status', action: 'teamStatus' },
            { label: '💡 Get Suggestions', action: 'suggestions' }
          ]
        };

      case 'createTask':
        return {
          text: responses.taskCreated(entities.taskName, entities.priority, entities.dueDate),
          data: {
            taskName: entities.taskName,
            priority: entities.priority,
            dueDate: entities.dueDate
          },
          quickActions: [
            { label: '✅ Assign Task', action: 'assignTask' },
            { label: '📝 Create Another', action: 'createTask' },
            { label: '📋 View All Tasks', action: 'showTasks' }
          ]
        };

      case 'showTasks':
        return {
          text: `📋 **Your Tasks (${entities.filter})**\n\n` +
                `I found your ${entities.filter} tasks. Opening tasks view...\n\n` +
                `Quick summary:\n• 15 To Do\n• 12 In Progress\n• 8 In Review\n• 128 Completed`,
          quickActions: [
            { label: '📝 Create Task', action: 'createTask' },
            { label: '🔍 Filter Tasks', action: 'filterTasks' },
            { label: '📊 Task Analytics', action: 'analytics' }
          ]
        };

      case 'showProjects':
        return {
          text: `📊 **Your Projects**\n\n` +
                `You have 12 active projects:\n` +
                `• Website Redesign (75% complete)\n` +
                `• Mobile App (60% complete)\n` +
                `• API Development (85% complete)\n` +
                `• Marketing Campaign (40% complete)\n\n` +
                `2 projects need attention - deadlines approaching!`,
          quickActions: [
            { label: '➕ New Project', action: 'createProject' },
            { label: '📊 Project Analytics', action: 'analytics' },
            { label: '⚠️ Show Risks', action: 'showRisks' }
          ]
        };

      case 'teamStatus':
        return {
          text: `👥 **Team Status**\n\n` +
                `Your team (8 members):\n` +
                `• 6 active members\n` +
                `• 2 on leave\n• Average capacity: 65%\n\n` +
                `Workload distribution:\n` +
                `• Balanced: 5 members\n` +
                `• Overloaded: 1 member\n` +
                `• Available: 2 members\n\n` +
                `💡 Consider redistributing tasks from overloaded members.`,
          quickActions: [
            { label: '📊 Team Analytics', action: 'teamAnalytics' },
            { label: '📝 Assign Tasks', action: 'assignTasks' },
            { label: '⚖️ Balance Workload', action: 'balanceWorkload' }
          ]
        };

      case 'analytics':
        return {
          text: `📊 **Project Analytics**\n\n` +
                `**This Month:**\n` +
                `• Tasks Completed: 128 (+18% from last month)\n` +
                `• Team Velocity: 45 story points/week\n` +
                `• On-time Completion: 85%\n\n` +
                `**Trends:**\n` +
                `• ✅ Productivity increasing\n` +
                `• ⚠️ 3 tasks overdue\n` +
                `• 📈 Project progress steady`,
          quickActions: [
            { label: '📊 View Full Analytics', action: 'openAnalytics' },
            { label: '📥 Export Report', action: 'exportReport' },
            { label: '📅 Schedule Review', action: 'scheduleReview' }
          ]
        };

      case 'suggestions':
        return {
          text: this.getRandomResponse(responses.suggestions),
          quickActions: [
            { label: '✅ Apply Tips', action: 'applyTips' },
            { label: '📊 More Insights', action: 'analytics' },
            { label: '🎯 Set Goals', action: 'setGoals' }
          ]
        };

      case 'help':
        return {
          text: responses.help,
          quickActions: [
            { label: '📝 Try Creating Task', action: 'createTask' },
            { label: '📊 View Analytics', action: 'analytics' },
            { label: '💡 Get Suggestions', action: 'suggestions' }
          ]
        };

      case 'projectStatus':
        return {
          text: `📊 **Project Status**\n\n` +
                `Project: ${entities.projectName || 'Selected Project'}\n` +
                `Status: Active\n` +
                `Progress: 75%\n` +
                `Tasks: 45 total (12 in progress, 28 completed)\n` +
                `Team: 5 members\n` +
                `Due Date: In 15 days\n\n` +
                `✅ On track to complete on time!`,
          quickActions: [
            { label: '📊 View Details', action: 'projectDetails' },
            { label: '👥 View Team', action: 'teamStatus' },
            { label: '📋 View Tasks', action: 'showTasks' }
          ]
        };

      default:
        return {
          text: `I understand you're asking about "${originalMessage}". While I'm still learning, ` +
                `I can help with:\n\n` +
                `• Creating and managing tasks\n` +
                `• Viewing project analytics\n` +
                `• Checking team status\n` +
                `• Getting smart suggestions\n\n` +
                `Try asking "help" to see all my capabilities!`,
          quickActions: [
            { label: '❓ Show Help', action: 'help' },
            { label: '📝 Create Task', action: 'createTask' },
            { label: '💡 Get Suggestions', action: 'suggestions' }
          ]
        };
    }
  }

  /**
   * Get random response from array
   */
  getRandomResponse(responses) {
    if (Array.isArray(responses)) {
      return responses[Math.floor(Math.random() * responses.length)];
    }
    return responses;
  }

  /**
   * Get conversation history
   */
  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
    this.context = {
      lastIntent: null,
      lastEntities: {},
      userData: null
    };
  }

  /**
   * Get context-aware suggestions
   */
  getQuickSuggestions(context = {}) {
    const suggestions = [
      "Create a high priority task",
      "Show me today's tasks",
      "What's my team status?",
      "Give me productivity tips",
      "Show project analytics",
      "List overdue tasks"
    ];

    // Randomize and return top 4
    return suggestions.sort(() => 0.5 - Math.random()).slice(0, 4);
  }
}

// Export singleton instance
const aiAssistant = new AIAssistantService();
export default aiAssistant;

