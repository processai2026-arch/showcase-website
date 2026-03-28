import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { LogOut, Calendar, FolderOpen, Plus, Trash2, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectForm, setShowProjectForm] = useState(false);
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

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/projects`, projectForm, { withCredentials: true });
      setProjectForm({ title: '', description: '', image: '', link: '' });
      setShowProjectForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding project:', error);
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

      <div className="p-6 max-w-5xl mx-auto">
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
              <p className="text-gray-500 text-center py-12">No bookings yet</p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking, i) => (
                  <div key={booking.id || i} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-gray-400 text-sm">{booking.email}</p>
                      </div>
                      <span className="text-xs text-gray-500">{booking.preferredDate}</span>
                    </div>
                    <p className="text-sm text-cyan-400 mb-2">{booking.service}</p>
                    <p className="text-gray-400 text-sm">{booking.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div data-testid="projects-tab">
            <button
              onClick={() => setShowProjectForm(!showProjectForm)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-sm mb-4 hover:bg-white/15"
              data-testid="add-project-btn"
            >
              <Plus size={16} /> Add Project
            </button>

            {showProjectForm && (
              <form onSubmit={handleAddProject} className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 space-y-3" data-testid="project-form">
                <input
                  type="text"
                  placeholder="Title"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
                <input
                  type="url"
                  placeholder="Image URL"
                  value={projectForm.image}
                  onChange={(e) => setProjectForm({ ...projectForm, image: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
                <input
                  type="url"
                  placeholder="Project Link (optional)"
                  value={projectForm.link}
                  onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })}
                  className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 text-white text-sm outline-none"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-4 py-2 rounded bg-white text-black text-sm font-medium">
                    Save
                  </button>
                  <button type="button" onClick={() => setShowProjectForm(false)} className="px-4 py-2 rounded text-gray-400 text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {projects.length === 0 ? (
              <p className="text-gray-500 text-center py-12">No projects yet</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((project) => (
                  <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                    {project.image && (
                      <img src={project.image} alt={project.title} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-gray-400 text-sm">{project.description}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="p-1 text-gray-500 hover:text-red-400"
                          data-testid={`delete-project-${project.id}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
