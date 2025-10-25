import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { validateInvitation } from '../services/invitationService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import { 
  UserIcon, 
  LockClosedIcon, 
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Step 2: Organization
    organizationType: 'join', // 'join' or 'create'
    organizationName: '',
    organizationCode: '',
    
    // Step 3: Role & Skills
    role: 'member',
    skills: [],
    experience: 'beginner',
    
    // Invitation data
    invitationToken: inviteToken || null
  });
  
  const [invitationData, setInvitationData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  // Load invitation data if token is present
  useEffect(() => {
    const loadInvitation = async () => {
      if (!inviteToken) return;
      
      setInviteLoading(true);
      try {
        // Get email from URL or use a placeholder to validate later
        const urlEmail = searchParams.get('email') || 'placeholder@example.com';
        
        const result = await validateInvitation(inviteToken, urlEmail);
        const invitation = result.data.invitation;
        
        setInvitationData(invitation);
        
        // Pre-fill form with invitation data
        setFormData(prev => ({
          ...prev,
          email: invitation.email,
          firstName: invitation.metadata?.firstName || '',
          lastName: invitation.metadata?.lastName || '',
          role: invitation.role || 'member',
          organizationType: 'join',
          organizationCode: 'invite', // Set a placeholder since we have invitation
          invitationToken: inviteToken
        }));
        
        setError('');
      } catch (err) {
        console.error('Invalid invitation:', err);
        // Don't block registration, just show warning
        setError('Could not load invitation details. Please proceed with registration.');
        setInvitationData(null);
      } finally {
        setInviteLoading(false);
      }
    };
    
    loadInvitation();
  }, [inviteToken, searchParams]);

  const steps = [
    { number: 1, title: 'Personal Info', description: 'Tell us about yourself' },
    { number: 2, title: 'Organization', description: 'Join or create organization' },
    { number: 3, title: 'Role & Skills', description: 'Set your role and expertise' }
  ];

  const roles = [
    { value: 'member', label: 'Team Member', description: 'Work on tasks and projects' },
    { value: 'project_manager', label: 'Project Manager', description: 'Manage projects and teams' },
    { value: 'admin', label: 'Organization Admin', description: 'Manage organization settings' }
  ];

  const skills = [
    'UI/UX Design', 'Frontend Development', 'Backend Development', 'DevOps',
    'QA Testing', 'Product Management', 'Business Analysis', 'Data Analysis',
    'Marketing', 'General'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        skills: checked 
          ? [...prev.skills, value]
          : prev.skills.filter(skill => skill !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
          setError('Please fill in all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters');
          return false;
        }
        return true;
      
      case 2:
        if (formData.organizationType === 'join' && !formData.organizationCode) {
          setError('Please enter organization code');
          return false;
        }
        if (formData.organizationType === 'create' && !formData.organizationName) {
          setError('Please enter organization name');
          return false;
        }
        return true;
      
      case 3:
        if (!formData.role) {
          setError('Please select a role');
          return false;
        }
        return true;
      
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // Skip organization step if using invitation
      if (currentStep === 1 && invitationData) {
        setCurrentStep(3); // Skip to role & skills
      } else {
        setCurrentStep(prev => prev + 1);
      }
      setError('');
    }
  };

  const handlePrevious = () => {
    // Skip organization step when going back if using invitation
    if (currentStep === 3 && invitationData) {
      setCurrentStep(1); // Go back to personal info
    } else {
      setCurrentStep(prev => prev - 1);
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    setError('');

    try {
      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        skills: formData.skills,
        experience: formData.experience
      };

      // Add organization data based on invitation or manual entry
      if (formData.invitationToken) {
        registrationData.inviteToken = formData.invitationToken; // Backend expects 'inviteToken'
      } else {
        registrationData.organizationName = formData.organizationName;
        registrationData.organizationCode = formData.organizationCode;
      }

      await register(registrationData);
      
      // Navigate based on role
      if (formData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (formData.role === 'project_manager') {
        navigate('/pm/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
          placeholder="Enter your first name"
        />
        
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
          placeholder="Enter your last name"
        />
      </div>

      <Input
        label="Email address"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        placeholder="Enter your email"
        icon={<EnvelopeIcon className="w-5 h-5" />}
        disabled={!!invitationData}
        helperText={invitationData ? "From invitation" : ""}
      />

      <Input
        label="Password"
        name="password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        required
        placeholder="Create a password"
        icon={<LockClosedIcon className="w-5 h-5" />}
        helperText="Must be at least 6 characters"
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type={showPassword ? 'text' : 'password'}
        value={formData.confirmPassword}
        onChange={handleChange}
        required
        placeholder="Confirm your password"
        icon={<LockClosedIcon className="w-5 h-5" />}
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Organization Type</label>
        
        <div className="space-y-3">
          <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="organizationType"
              value="join"
              checked={formData.organizationType === 'join'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <UserGroupIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-medium">Join Existing Organization</span>
              </div>
              <p className="text-sm text-gray-500">I have an organization code to join</p>
            </div>
          </label>

          <label className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
            <input
              type="radio"
              name="organizationType"
              value="create"
              checked={formData.organizationType === 'create'}
              onChange={handleChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="ml-3">
              <div className="flex items-center">
                <BuildingOfficeIcon className="w-5 h-5 text-gray-400 mr-2" />
                <span className="font-medium">Create New Organization</span>
              </div>
              <p className="text-sm text-gray-500">I want to create a new organization</p>
            </div>
          </label>
        </div>
      </div>

      {formData.organizationType === 'join' && (
        <Input
          label="Organization Code"
          name="organizationCode"
          value={formData.organizationCode}
          onChange={handleChange}
          required
          placeholder="Enter organization code"
          helperText="Get this code from your organization admin"
        />
      )}

      {formData.organizationType === 'create' && (
        <Input
          label="Organization Name"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleChange}
          required
          placeholder="Enter organization name"
        />
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Select Your Role</label>
        
        <div className="space-y-3">
          {roles.map((role) => (
            <label key={role.value} className="flex items-center p-4 border border-gray-200 rounded-md cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value={role.value}
                checked={formData.role === role.value}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900">{role.label}</div>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Skills & Expertise</label>
        <p className="text-sm text-gray-500">Select all that apply</p>
        
        <div className="grid grid-cols-2 gap-3">
          {skills.map((skill) => (
            <label key={skill} className="flex items-center">
              <input
                type="checkbox"
                value={skill}
                checked={formData.skills.includes(skill)}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{skill}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="text-sm font-medium text-gray-700">Experience Level</label>
        
        <select
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="beginner">Beginner (0-1 years)</option>
          <option value="intermediate">Intermediate (2-4 years)</option>
          <option value="advanced">Advanced (5+ years)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Mobile logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Projectra</h1>
          {invitationData ? (
            <div className="flex items-center justify-center gap-2 text-primary-100">
              <EnvelopeIcon className="w-5 h-5" />
              <p>Joining {invitationData.organization?.name || 'Organization'}</p>
            </div>
          ) : (
            <p className="text-primary-100">Create your account</p>
          )}
        </div>

        <Card className="shadow-2xl">
          {/* Invitation Banner */}
          {invitationData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <EnvelopeIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900">You've been invited!</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {invitationData.invitedBy?.firstName} {invitationData.invitedBy?.lastName} invited you to join{' '}
                    <strong>{invitationData.organization?.name}</strong> as a{' '}
                    <strong>{invitationData.role?.replace('_', ' ')}</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {inviteLoading && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
              <p className="text-gray-600">Validating invitation...</p>
            </div>
          )}

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-gray-300 text-gray-400'
                  }`}>
                    {currentStep > step.number ? (
                      <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.number}</span>
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-primary-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-sm text-gray-600">
                {steps[currentStep - 1].description}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error bg-opacity-10 border border-error border-opacity-20 rounded-md">
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                icon={<ArrowLeftIcon className="w-4 h-4" />}
              >
                Previous
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleNext}
                  icon={<ArrowRightIcon className="w-4 h-4" />}
                  iconPosition="right"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-500 font-medium focus:outline-none focus:underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;