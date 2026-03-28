import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { LogOut, Calendar, FolderOpen, Plus, Trash2, Loader2, Eye, X, Edit2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', image: '', link: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, projectsRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, { withCredentials: true }),
        axios.get(`${API_URL}/api/projects`)
      ]);
      setBookings(bookingsRes.data);
      setProjects(projectsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, { withCredentials: true });
      setSelectedBooking(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const openProjectForm = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({
        title: project.title,
        description: project.description,
        image: project.image,
        link: project.link || ''
      });
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', description: '', image: '', link: '' });
    }
    setShowProjectForm(true);
  };

  const closeProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectForm({ title: '', description: '', image: '', link: '' });
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // Update existing project
        await axios.put(`${API_URL}/api/projects/${editingProject.id}`, projectForm, { withCredentials: true });
      } else {
        // Create new project
        await axios.post(`${API_URL}/api/projects`, projectForm, { withCredentials: true });
      }
      closeProjectForm();
      fetchData();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`, { withCredentials: true });
      fetchData();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <Loader2 className="animate-spin text-white" size={24} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] text-white" data-testid="admin-dashboard">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <h1 className="font-semibold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          data-testid="logout-btn"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              activeTab === 'bookings' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
            data-testid="tab-bookings"
          >
            <Calendar size={16} /> Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
              activeTab === 'projects' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
            }`}
            data-testid="tab-projects"
          >
            <FolderOpen size={16} /> Projects ({projects.length})
          </button>
        </div>

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div data-testid="bookings-tab">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Email</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Service</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Date</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-sm">{booking.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{booking.email}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                            {booking.service || booking.service_type || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">{booking.preferredDate || booking.preferred_date || '-'}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white mr-1"
                            data-testid={`view-booking-${booking.id}`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                            data-testid={`delete-booking-${booking.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div data-testid="projects-tab">
            <button
              onClick={() => openProjectForm()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-sm mb-4 hover:bg-white/15"
              data-testid="add-project-btn"
            >
              <Plus size={16} /> Add Project
            </button>

            {projects.length === 0 ? (
              <div className="text-center py-16">
                <FolderOpen size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No projects yet</p>
                <p className="text-gray-600 text-sm mt-2">Add your first project to display on the homepage</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden">
                    {project.image && (
                      <img src={project.image} alt={project.title} className="w-full h-40 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{project.title}</p>
                          <p className="text-gray-400 text-sm mt-1 line-clamp-2">{project.description}</p>
                          {project.link && (
                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-cyan-400 text-xs mt-2 inline-block hover:underline">
                              View Project →
                            </a>
                          )}
                        </div>
                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => openProjectForm(project)}
                            className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white"
                            data-testid={`edit-project-${project.id}`}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                            data-testid={`delete-project-${project.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" data-testid="booking-modal">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-medium">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded hover:bg-white/10 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Name</p>
                <p className="text-white">{selectedBooking.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Email</p>
                <p className="text-white">{selectedBooking.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Service</p>
                <p className="text-cyan-400">{selectedBooking.service || selectedBooking.service_type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Preferred Date</p>
                <p className="text-white">{selectedBooking.preferredDate || selectedBooking.preferred_date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Message</p>
                <p className="text-gray-300 text-sm">{selectedBooking.message}</p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/10 flex gap-2">
              <button
                onClick={() => handleDeleteBooking(selectedBooking.id)}
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20"
              >
                Delete
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 text-sm hover:bg-white/10 ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Form Modal */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" data-testid="project-modal">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-medium">{editingProject ? 'Edit Project' : 'Add Project'}</h3>
              <button onClick={closeProjectForm} className="p-1 rounded hover:bg-white/10 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveProject} className="p-5 space-y-4" data-testid="project-form">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  placeholder="Project title"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                  data-testid="project-title"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20 resize-none"
                  data-testid="project-description"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Image URL *</label>
                <input
                  type="url"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  required
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                  data-testid="project-image"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project Link (optional)</label>
                <input
                  type="url"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                  data-testid="project-link"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100"
                  data-testid="project-save-btn"
                >
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
                <button
                  type="button"
                  onClick={closeProjectForm}
                  className="px-5 py-2.5 rounded-lg text-gray-400 text-sm hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
