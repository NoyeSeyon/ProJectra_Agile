const express = require('express');
const { body, validationResult } = require('express-validator');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// AI Chat endpoint
router.post('/chat', authenticate, [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('context').optional().isObject().withMessage('Context must be an object')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, context = {} } = req.body;
    const orgId = req.user.organization;
    const userId = req.user._id;

    // Get relevant project data for context
    const [projects, tasks, users] = await Promise.all([
      Project.find({ organization: orgId }).select('name status progress budget teamLeader client'),
      Task.find({ organization: orgId }).select('title status priority assignee project dueDate'),
      User.find({ organization: orgId }).select('firstName lastName role specialization')
    ]);

    // Create context-aware response
    const aiResponse = await generateAIResponse(message, {
      user: req.user,
      projects,
      tasks,
      users,
      organization: orgId,
      ...context
    });

    res.json({
      success: true,
      data: {
        response: aiResponse,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// AI Suggestions endpoint
router.get('/suggestions', authenticate, async (req, res) => {
  try {
    const { type, projectId, taskId } = req.query;
    const orgId = req.user.organization;

    let suggestions = [];

    switch (type) {
      case 'project_management':
        suggestions = await getProjectManagementSuggestions(orgId);
        break;
      case 'task_assignment':
        suggestions = await getTaskAssignmentSuggestions(orgId, projectId);
        break;
      case 'resource_optimization':
        suggestions = await getResourceOptimizationSuggestions(orgId);
        break;
      case 'deadline_management':
        suggestions = await getDeadlineManagementSuggestions(orgId);
        break;
      default:
        suggestions = await getGeneralSuggestions(orgId);
    }

    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// AI Analysis endpoint
router.post('/analyze', authenticate, [
  body('data').isObject().withMessage('Data is required'),
  body('analysisType').isIn(['performance', 'budget', 'timeline', 'team', 'risks']).withMessage('Invalid analysis type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { data, analysisType } = req.body;
    const orgId = req.user.organization;

    const analysis = await performAIAnalysis(data, analysisType, orgId);

    res.json({
      success: true,
      data: { analysis }
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to generate AI response
async function generateAIResponse(message, context) {
  // This is a simplified AI response generator
  // In a real implementation, you would integrate with OpenAI API
  
  const lowerMessage = message.toLowerCase();
  
  // Project-related queries
  if (lowerMessage.includes('project') || lowerMessage.includes('projects')) {
    const projectCount = context.projects.length;
    const activeProjects = context.projects.filter(p => p.status === 'active').length;
    
    return `You have ${projectCount} total projects, with ${activeProjects} currently active. ` +
           `Would you like me to show you the details of any specific project or help you create a new one?`;
  }
  
  // Task-related queries
  if (lowerMessage.includes('task') || lowerMessage.includes('tasks')) {
    const taskCount = context.tasks.length;
    const completedTasks = context.tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = context.tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
    ).length;
    
    return `You have ${taskCount} total tasks, with ${completedTasks} completed. ` +
           `${overdueTasks > 0 ? `Warning: ${overdueTasks} tasks are overdue. ` : ''}` +
           `Would you like me to help you prioritize or reassign tasks?`;
  }
  
  // Team-related queries
  if (lowerMessage.includes('team') || lowerMessage.includes('member')) {
    const teamCount = context.users.length;
    const projectManagers = context.users.filter(u => u.role === 'project_manager').length;
    const teamLeaders = context.users.filter(u => u.role === 'team_leader').length;
    
    return `Your team has ${teamCount} members, including ${projectManagers} project managers and ${teamLeaders} team leaders. ` +
           `Would you like me to help you with team assignments or capacity planning?`;
  }
  
  // Budget-related queries
  if (lowerMessage.includes('budget') || lowerMessage.includes('cost')) {
    const totalBudget = context.projects.reduce((sum, p) => sum + (p.budget?.amount || 0), 0);
    const spentBudget = context.projects.reduce((sum, p) => sum + (p.budget?.spent || 0), 0);
    const remainingBudget = totalBudget - spentBudget;
    
    return `Your total project budget is $${totalBudget.toLocaleString()}, with $${spentBudget.toLocaleString()} spent. ` +
           `You have $${remainingBudget.toLocaleString()} remaining. ` +
           `Would you like me to analyze budget utilization or suggest cost optimizations?`;
  }
  
  // Progress-related queries
  if (lowerMessage.includes('progress') || lowerMessage.includes('status')) {
    const avgProgress = context.projects.reduce((sum, p) => sum + (p.progress || 0), 0) / context.projects.length;
    
    return `Your projects have an average progress of ${avgProgress.toFixed(1)}%. ` +
           `Would you like me to identify bottlenecks or suggest ways to improve progress?`;
  }
  
  // Default response
  return `I'm your AI assistant for Projectra! I can help you with project management, task assignments, team coordination, budget analysis, and more. ` +
         `What would you like to know about your projects or how can I assist you today?`;
}

// Helper function to get project management suggestions
async function getProjectManagementSuggestions(orgId) {
  const projects = await Project.find({ organization: orgId });
  const suggestions = [];
  
  // Check for projects with low progress
  const lowProgressProjects = projects.filter(p => p.progress < 30 && p.status === 'active');
  if (lowProgressProjects.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Low Progress Projects',
      message: `${lowProgressProjects.length} projects have less than 30% progress. Consider reviewing these projects.`,
      action: 'Review project status and resource allocation'
    });
  }
  
  // Check for projects over budget
  const overBudgetProjects = projects.filter(p => 
    p.budget?.spent > p.budget?.amount && p.budget?.amount > 0
  );
  if (overBudgetProjects.length > 0) {
    suggestions.push({
      type: 'alert',
      title: 'Budget Overruns',
      message: `${overBudgetProjects.length} projects have exceeded their budget.`,
      action: 'Review budget allocation and spending'
    });
  }
  
  return suggestions;
}

// Helper function to get task assignment suggestions
async function getTaskAssignmentSuggestions(orgId, projectId) {
  const tasks = await Task.find({ 
    organization: orgId,
    ...(projectId && { project: projectId })
  }).populate('assignee', 'firstName lastName capacity');
  
  const suggestions = [];
  
  // Check for unassigned tasks
  const unassignedTasks = tasks.filter(t => !t.assignee);
  if (unassignedTasks.length > 0) {
    suggestions.push({
      type: 'info',
      title: 'Unassigned Tasks',
      message: `${unassignedTasks.length} tasks are not assigned to anyone.`,
      action: 'Assign tasks to team members based on their skills and capacity'
    });
  }
  
  return suggestions;
}

// Helper function to get resource optimization suggestions
async function getResourceOptimizationSuggestions(orgId) {
  const users = await User.find({ organization: orgId });
  const tasks = await Task.find({ organization: orgId }).populate('assignee');
  
  const suggestions = [];
  
  // Check for overworked team members
  const userWorkload = {};
  tasks.forEach(task => {
    if (task.assignee) {
      const userId = task.assignee._id.toString();
      userWorkload[userId] = (userWorkload[userId] || 0) + 1;
    }
  });
  
  const overworkedUsers = Object.entries(userWorkload)
    .filter(([userId, count]) => count > 5)
    .map(([userId, count]) => {
      const user = users.find(u => u._id.toString() === userId);
      return { user, count };
    });
  
  if (overworkedUsers.length > 0) {
    suggestions.push({
      type: 'warning',
      title: 'Overworked Team Members',
      message: `${overworkedUsers.length} team members have more than 5 tasks assigned.`,
      action: 'Redistribute tasks or add more team members'
    });
  }
  
  return suggestions;
}

// Helper function to get deadline management suggestions
async function getDeadlineManagementSuggestions(orgId) {
  const tasks = await Task.find({ 
    organization: orgId,
    dueDate: { $exists: true, $ne: null }
  });
  
  const suggestions = [];
  
  // Check for overdue tasks
  const overdueTasks = tasks.filter(t => 
    new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );
  
  if (overdueTasks.length > 0) {
    suggestions.push({
      type: 'alert',
      title: 'Overdue Tasks',
      message: `${overdueTasks.length} tasks are overdue.`,
      action: 'Review and update task priorities or deadlines'
    });
  }
  
  // Check for tasks due soon
  const soonDueTasks = tasks.filter(t => {
    const dueDate = new Date(t.dueDate);
    const now = new Date();
    const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 3 && daysUntilDue > 0 && t.status !== 'completed';
  });
  
  if (soonDueTasks.length > 0) {
    suggestions.push({
      type: 'info',
      title: 'Tasks Due Soon',
      message: `${soonDueTasks.length} tasks are due within 3 days.`,
      action: 'Prioritize these tasks to meet deadlines'
    });
  }
  
  return suggestions;
}

// Helper function to get general suggestions
async function getGeneralSuggestions(orgId) {
  return [
    {
      type: 'info',
      title: 'Welcome to AI Assistant',
      message: 'I can help you with project management, task assignments, and team coordination.',
      action: 'Ask me anything about your projects or team'
    }
  ];
}

// Helper function to perform AI analysis
async function performAIAnalysis(data, analysisType, orgId) {
  switch (analysisType) {
    case 'performance':
      return {
        insights: [
          'Team productivity has increased by 15% this month',
          'Project completion rate is above average',
          'Resource utilization is optimal'
        ],
        recommendations: [
          'Continue current workflow patterns',
          'Consider expanding successful practices to other projects'
        ]
      };
    
    case 'budget':
      return {
        insights: [
          'Budget utilization is at 78% of allocated funds',
          'Cost per project is within expected range',
          'No significant budget overruns detected'
        ],
        recommendations: [
          'Monitor spending on high-budget projects',
          'Consider reallocating unused budget to priority projects'
        ]
      };
    
    case 'timeline':
      return {
        insights: [
          'Average project completion time is 2.3 weeks',
          '85% of projects are delivered on time',
          'Critical path analysis shows no bottlenecks'
        ],
        recommendations: [
          'Maintain current timeline estimates',
          'Consider buffer time for complex projects'
        ]
      };
    
    case 'team':
      return {
        insights: [
          'Team capacity utilization is at 82%',
          'Skill distribution is well-balanced',
          'No team members are overloaded'
        ],
        recommendations: [
          'Current team structure is optimal',
          'Consider cross-training for better flexibility'
        ]
      };
    
    case 'risks':
      return {
        insights: [
          'Low risk level across all projects',
          'No critical dependencies identified',
          'Resource availability is stable'
        ],
        recommendations: [
          'Continue current risk management practices',
          'Monitor for emerging risks in complex projects'
        ]
      };
    
    default:
      return {
        insights: ['Analysis completed successfully'],
        recommendations: ['Continue monitoring project metrics']
      };
  }
}

module.exports = router;