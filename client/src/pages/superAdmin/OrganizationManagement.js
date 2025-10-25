import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  FolderIcon
} from '@heroicons/react/24/outline';
import {
  getAllOrganizations,
  createOrganization,
  updateOrganization,
  deleteOrganization
} from '../../services/superAdminService';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const OrganizationManagement = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    domain: '',
    plan: 'free',
    maxUsers: 50,
    maxProjects: 100
  });

  useEffect(() => {
    fetchOrganizations();
  }, [search, statusFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllOrganizations({
        search,
        status: statusFilter
      });
      setOrganizations(response.data.organizations || []);
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load organizations');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createOrganization(formData);
      setShowCreateModal(false);
      resetForm();
      fetchOrganizations();
    } catch (error) {
      console.error('Failed to create organization:', error);
      alert(error.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateOrganization(selectedOrg._id, formData);
      setShowEditModal(false);
      resetForm();
      fetchOrganizations();
    } catch (error) {
      console.error('Failed to update organization:', error);
      alert(error.response?.data?.message || 'Failed to update organization');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      try {
        await deleteOrganization(id);
        fetchOrganizations();
      } catch (error) {
        console.error('Failed to delete organization:', error);
        alert(error.response?.data?.message || 'Failed to delete organization');
      }
    }
  };

  const openEditModal = (org) => {
    setSelectedOrg(org);
    setFormData({
      name: org.name,
      slug: org.slug,
      description: org.description || '',
      domain: org.domain || '',
      plan: org.subscription?.plan || org.plan?.type || 'free',
      maxUsers: org.maxUsers || 50,
      maxProjects: org.maxProjects || 100
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      domain: '',
      plan: 'free',
      maxUsers: 50,
      maxProjects: 100
    });
    setSelectedOrg(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Organizations</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={fetchOrganizations}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Organization Management</h1>
          <p className="text-gray-500 mt-1">Manage all organizations in the system</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center space-x-2">
          <PlusIcon className="h-5 w-5" />
          <span>Create Organization</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizations.map((org) => (
          <div key={org._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                {org.name?.charAt(0)}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openEditModal(org)}
                  className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(org._id, org.name)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">{org.name}</h3>
            <p className="text-sm text-gray-500 mb-4">@{org.slug}</p>

            {org.description && (
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{org.description}</p>
            )}

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <UserGroupIcon className="h-4 w-4" />
                  <span>{org.stats?.members || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <FolderIcon className="h-4 w-4" />
                  <span>{org.stats?.projects || 0}</span>
                </div>
              </div>
              {org.isActive ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircleIcon className="h-3 w-3 mr-1" />
                  Active
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircleIcon className="h-3 w-3 mr-1" />
                  Inactive
                </span>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Plan:</span>
                <span className="font-medium text-gray-900 capitalize">
                  {org.subscription?.plan || org.plan?.type || 'Free'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {organizations.length === 0 && (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No organizations found</p>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Organization"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Organization Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter organization name"
          />
          <Input
            label="Slug"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
            placeholder="organization-slug"
            helperText="URL-friendly identifier"
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description"
          />
          <Input
            label="Domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="example.com"
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <Input
              label="Max Users"
              type="number"
              value={formData.maxUsers}
              onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
            />
          </div>
          <Input
            label="Max Projects"
            type="number"
            value={formData.maxProjects}
            onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Create Organization</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Organization"
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Organization Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <Input
            label="Domain"
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
              <select
                value={formData.plan}
                onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <Input
              label="Max Users"
              type="number"
              value={formData.maxUsers}
              onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
            />
          </div>
          <Input
            label="Max Projects"
            type="number"
            value={formData.maxProjects}
            onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Update Organization</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizationManagement;

