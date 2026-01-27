'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, Save, X, Eye, EyeOff } from 'lucide-react';
import { getAllProjects, createProject, updateProject, deleteProject } from '@/lib/supabase';
import { Project } from '@/lib/types';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getAllProjects();
    setProjects(data);
    setLoading(false);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!editingProject) {
      setSlug(generateSlug(value));
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setTitle(project.title);
      setSlug(project.slug);
      setDescription(project.description || '');
      setIsVisible(project.is_visible);
    } else {
      setEditingProject(null);
      setTitle('');
      setSlug('');
      setDescription('');
      setIsVisible(true);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
  };

  const handleSave = async () => {
    if (!title || !slug) {
      toast.error('Başlık ve slug gerekli!');
      return;
    }

    setSaving(true);

    const projectData: Partial<Project> = {
      title,
      slug,
      description,
      is_visible: isVisible,
      order_index: editingProject?.order_index || projects.length,
    };

    let result;
    if (editingProject) {
      result = await updateProject(editingProject.id, projectData);
    } else {
      result = await createProject(projectData);
    }

    if (result) {
      toast.success(editingProject ? 'Proje güncellendi!' : 'Proje oluşturuldu!');
      closeModal();
      loadProjects();
    } else {
      toast.error('Bir hata oluştu!');
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu projeyi silmek istediğinize emin misiniz?')) return;

    const success = await deleteProject(id);
    if (success) {
      toast.success('Proje silindi!');
      loadProjects();
    } else {
      toast.error('Silme işlemi başarısız!');
    }
  };

  const toggleVisibility = async (project: Project) => {
    const result = await updateProject(project.id, { is_visible: !project.is_visible });
    if (result) {
      toast.success(project.is_visible ? 'Proje gizlendi' : 'Proje gösterildi');
      loadProjects();
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display text-white mb-2">Projeler</h1>
          <p className="text-neutral-400">Fotoğraf projelerinizi/albümlerinizi yönetin.</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Proje</span>
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="admin-card text-center py-12">
          <p className="text-neutral-400 mb-4">Henüz proje eklenmemiş.</p>
          <button
            onClick={() => openModal()}
            className="text-white hover:underline"
          >
            İlk projeyi oluştur →
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <div key={project.id} className="admin-card flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-white font-medium">{project.title}</h3>
                  {!project.is_visible && (
                    <span className="text-xs bg-neutral-700 text-neutral-400 px-2 py-1 rounded">
                      Gizli
                    </span>
                  )}
                </div>
                <p className="text-neutral-500 text-sm mt-1">/{project.slug}</p>
                {project.description && (
                  <p className="text-neutral-400 text-sm mt-2">{project.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleVisibility(project)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                  title={project.is_visible ? 'Gizle' : 'Göster'}
                >
                  {project.is_visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
                <button
                  onClick={() => openModal(project)}
                  className="p-2 text-neutral-400 hover:text-white transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-2 text-neutral-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 rounded-lg w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <h2 className="text-xl font-display text-white">
                {editingProject ? 'Projeyi Düzenle' : 'Yeni Proje'}
              </h2>
              <button onClick={closeModal} className="text-neutral-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Proje Adı *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Örn: Doğa Fotoğrafları"
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  URL Slug *
                </label>
                <div className="flex items-center">
                  <span className="text-neutral-500 mr-2">/work/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="doga-fotograflari"
                    className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Proje hakkında kısa açıklama..."
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 rounded-lg focus:outline-none focus:border-neutral-500 resize-none"
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={(e) => setIsVisible(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span className="text-white">Sitede göster</span>
                </label>
              </div>
            </div>

            <div className="flex gap-4 p-6 border-t border-neutral-800">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border border-neutral-700 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
