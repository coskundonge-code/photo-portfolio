'use client';

import { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Eye,
  EyeOff,
  GripVertical,
  FolderOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Project } from '@/lib/types';

// Demo projects
const initialProjects: Project[] = [
  { id: '1', title: 'Landscapes', slug: 'landscapes', description: 'Nature photography from around the world', order_index: 1, is_visible: true, created_at: '', updated_at: '' },
  { id: '2', title: 'Urban', slug: 'urban', description: 'City life and architecture', order_index: 2, is_visible: true, created_at: '', updated_at: '' },
  { id: '3', title: 'Portraits', slug: 'portraits', description: 'People and their stories', order_index: 3, is_visible: false, created_at: '', updated_at: '' },
];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '' });

  // Create project
  const handleCreate = () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    
    const newProject: Project = {
      id: Date.now().toString(),
      title: formData.title,
      slug,
      description: formData.description,
      order_index: projects.length + 1,
      is_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setProjects(prev => [...prev, newProject]);
    setFormData({ title: '', description: '' });
    setIsCreating(false);
    toast.success('Project created');
  };

  // Update project
  const startEditing = (project: Project) => {
    setEditingId(project.id);
    setFormData({ title: project.title, description: project.description || '' });
  };

  const handleUpdate = (id: string) => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    const slug = formData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    setProjects(prev => prev.map(p => 
      p.id === id 
        ? { ...p, title: formData.title, slug, description: formData.description, updated_at: new Date().toISOString() }
        : p
    ));
    setEditingId(null);
    setFormData({ title: '', description: '' });
    toast.success('Project updated');
  };

  // Delete project
  const handleDelete = (id: string) => {
    if (confirm('Are you sure? This will not delete the photos, but they will be unassigned.')) {
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted');
    }
  };

  // Toggle visibility
  const toggleVisibility = (id: string) => {
    setProjects(prev => prev.map(p => 
      p.id === id ? { ...p, is_visible: !p.is_visible } : p
    ));
    toast.success('Visibility updated');
  };

  // Cancel editing/creating
  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ title: '', description: '' });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Projects</h1>
          <p className="text-neutral-400">Organize your photos into projects.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="btn-primary flex items-center space-x-2 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="admin-card mb-6">
          <h3 className="text-lg font-display text-white mb-4">New Project</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="input-field"
                placeholder="Project title"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm text-neutral-400 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="input-field resize-none"
                rows={3}
                placeholder="Brief description (optional)"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button onClick={handleCancel} className="btn-ghost">
                Cancel
              </button>
              <button onClick={handleCreate} className="btn-primary">
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`admin-card ${!project.is_visible ? 'opacity-60' : ''}`}
            >
              {editingId === project.id ? (
                // Edit Mode
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-400 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="input-field resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button onClick={handleCancel} className="btn-ghost flex items-center space-x-1">
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                    <button onClick={() => handleUpdate(project.id)} className="btn-primary flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="flex items-center space-x-4">
                  {/* Drag Handle */}
                  <div className="text-neutral-600 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Order Number */}
                  <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-neutral-500 font-mono text-sm">
                    {project.order_index}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-white font-medium">{project.title}</h3>
                      <span className="text-neutral-600 text-sm">/{project.slug}</span>
                      {!project.is_visible && (
                        <span className="px-2 py-0.5 bg-neutral-800 text-neutral-500 text-xs rounded">
                          Hidden
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-neutral-500 text-sm truncate">{project.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleVisibility(project.id)}
                      className="p-2 text-neutral-500 hover:text-white transition-colors"
                      title={project.is_visible ? 'Hide' : 'Show'}
                    >
                      {project.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEditing(project)}
                      className="p-2 text-neutral-500 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-card text-center py-20">
          <FolderOpen className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-400 mb-2">No projects yet</p>
          <p className="text-neutral-500 text-sm">Create your first project to organize your photos</p>
        </div>
      )}
    </div>
  );
}
