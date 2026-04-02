import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  LogOut, Calendar, FolderOpen, Plus, Trash2, Loader2,
  Eye, X, Edit2, CheckCircle, XCircle, Clock, Wrench,
  Upload, Link as LinkIcon, Phone, Mail, User, Image
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// ─── Toast Component ──────────────────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.message}
          <button onClick={() => removeToast(toast.id)} className="ml-2 opacity-60 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    pending:   { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: <Clock size={12} />, label: 'Pending' },
    confirmed: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: <CheckCircle size={12} />, label: 'Confirmed' },
    rejected:  { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: <XCircle size={12} />, label: 'Rejected' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium ${s.color}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Icon options for services ────────────────────────────────────────────────
const ICON_OPTIONS = ['Bot', 'Globe', 'MessageSquare', 'Zap', 'Shield', 'Code', 'Database', 'Cloud', 'Cpu', 'Layers'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Project form
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', description: '', image: '', link: '' });
  const [projectSaving, setProjectSaving] = useState(false);
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Service form
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', icon: 'Bot', features: [''], order: 0 });
  const [serviceSaving, setServiceSaving] = useState(false);

  // ─── Toast Helpers ──────────────────────────────────────────────────────────
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  // ─── Data Fetching ──────────────────────────────────────────────────────────
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bRes, pRes, sRes] = await Promise.all([
        axios.get(`${API_URL}/api/bookings`, { withCredentials: true }),
        axios.get(`${API_URL}/api/projects`),
        axios.get(`${API_URL}/api/services`),
      ]);
      setBookings(bRes.data);
      setProjects(pRes.data);
      setServices(sRes.data);
    } catch (error) {
      addToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    await logout();
    navigate('/admin-login');
  };

  // ─── Booking Actions ────────────────────────────────────────────────────────
  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Delete this booking?')) return;
    try {
      await axios.delete(`${API_URL}/api/bookings/${id}`, { withCredentials: true });
      setSelectedBooking(null);
      fetchData();
      addToast('Booking deleted');
    } catch {
      addToast('Failed to delete booking', 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${id}/status`, { status: newStatus }, { withCredentials: true });
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b));
      if (selectedBooking?.id === id) setSelectedBooking(prev => ({ ...prev, status: newStatus }));
      addToast(`Booking marked as ${newStatus} — client notified by email`);
    } catch {
      addToast('Failed to update status', 'error');
    }
  };

  // ─── Project Actions ────────────────────────────────────────────────────────
  const openProjectForm = (project = null) => {
    if (project) {
      setEditingProject(project);
      setProjectForm({ title: project.title, description: project.description, image: project.image, link: project.link || '' });
      setImagePreview(project.image || '');
    } else {
      setEditingProject(null);
      setProjectForm({ title: '', description: '', image: '', link: '' });
      setImagePreview('');
    }
    setImageMode('url');
    setShowProjectForm(true);
  };

  const closeProjectForm = () => {
    setShowProjectForm(false);
    setEditingProject(null);
    setProjectForm({ title: '', description: '', image: '', link: '' });
    setImagePreview('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProjectForm(prev => ({ ...prev, image: data.url }));
      setImagePreview(data.url);
      addToast('Image uploaded successfully');
    } catch {
      addToast('Image upload failed', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projectForm.image) { addToast('Please add an image', 'error'); return; }
    setProjectSaving(true);
    try {
      if (editingProject) {
        await axios.put(`${API_URL}/api/projects/${editingProject.id}`, projectForm, { withCredentials: true });
        addToast('Project updated');
      } else {
        await axios.post(`${API_URL}/api/projects`, projectForm, { withCredentials: true });
        addToast('Project added');
      }
      closeProjectForm();
      fetchData();
    } catch {
      addToast('Failed to save project', 'error');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`, { withCredentials: true });
      fetchData();
      addToast('Project deleted');
    } catch {
      addToast('Failed to delete project', 'error');
    }
  };

  // ─── Service Actions ────────────────────────────────────────────────────────
  const openServiceForm = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceForm({
        title: service.title,
        description: service.description,
        icon: service.icon || 'Bot',
        features: service.features?.length > 0 ? service.features : [''],
        order: service.order || 0
      });
    } else {
      setEditingService(null);
      setServiceForm({ title: '', description: '', icon: 'Bot', features: [''], order: services.length });
    }
    setShowServiceForm(true);
  };

  const closeServiceForm = () => {
    setShowServiceForm(false);
    setEditingService(null);
    setServiceForm({ title: '', description: '', icon: 'Bot', features: [''], order: 0 });
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...serviceForm.features];
    updated[index] = value;
    setServiceForm(prev => ({ ...prev, features: updated }));
  };

  const addFeature = () => setServiceForm(prev => ({ ...prev, features: [...prev.features, ''] }));
  const removeFeature = (index) => setServiceForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }));

  const handleSaveService = async (e) => {
    e.preventDefault();
    setServiceSaving(true);
    const payload = {
      ...serviceForm,
      features: serviceForm.features.filter(f => f.trim() !== ''),
      order: Number(serviceForm.order)
    };
    try {
      if (editingService) {
        await axios.put(`${API_URL}/api/services/${editingService.id}`, payload, { withCredentials: true });
        addToast('Service updated');
      } else {
        await axios.post(`${API_URL}/api/services`, payload, { withCredentials: true });
        addToast('Service added — reload homepage to see it');
      }
      closeServiceForm();
      fetchData();
    } catch {
      addToast('Failed to save service', 'error');
    } finally {
      setServiceSaving(false);
    }
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`${API_URL}/api/services/${id}`, { withCredentials: true });
      fetchData();
      addToast('Service deleted');
    } catch {
      addToast('Failed to delete service', 'error');
    }
  };

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => !b.status || b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
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
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <span className="text-white font-bold">Process</span>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent font-bold"> AI</span>
          <span className="text-gray-500 text-sm ml-3">Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          data-testid="logout-btn"
        >
          <LogOut size={16} /> Logout
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto">

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Bookings', value: stats.total, color: 'text-white' },
            { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
            { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-400' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-400' },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'bookings', label: 'Bookings', icon: <Calendar size={15} />, count: stats.total },
            { id: 'projects', label: 'Projects', icon: <FolderOpen size={15} />, count: projects.length },
            { id: 'services', label: 'Services', icon: <Wrench size={15} />, count: services.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* ── Bookings Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'bookings' && (
          <div data-testid="bookings-tab">
            {bookings.length === 0 ? (
              <div className="text-center py-16">
                <Calendar size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No bookings yet</p>
              </div>
            ) : (
              <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 bg-white/[0.02]">
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Name</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Email</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Phone</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Service</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Date</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-gray-400">Status</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-gray-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3 text-sm">{booking.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{booking.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{booking.phone || '—'}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 text-xs">
                              {booking.service || '—'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{booking.preferredDate || '—'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={booking.status || 'pending'} />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="p-1.5 rounded hover:bg-white/10 text-gray-400 hover:text-white mr-1"
                              data-testid={`view-booking-${booking.id}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400"
                              data-testid={`delete-booking-${booking.id}`}
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Projects Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div data-testid="projects-tab">
            <button
              onClick={() => openProjectForm()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-sm mb-4 hover:bg-white/15 transition-colors"
              data-testid="add-project-btn"
            >
              <Plus size={15} /> Add Project
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
                  <div key={project.id} className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
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
                          <button onClick={() => openProjectForm(project)} className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white" data-testid={`edit-project-${project.id}`}>
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => handleDeleteProject(project.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400" data-testid={`delete-project-${project.id}`}>
                            <Trash2 size={15} />
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

        {/* ── Services Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'services' && (
          <div data-testid="services-tab">
            <button
              onClick={() => openServiceForm()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-sm mb-4 hover:bg-white/15 transition-colors"
              data-testid="add-service-btn"
            >
              <Plus size={15} /> Add Service
            </button>

            {services.length === 0 ? (
              <div className="text-center py-16">
                <Wrench size={48} className="mx-auto text-gray-600 mb-4" />
                <p className="text-gray-500">No services in database yet</p>
                <p className="text-gray-600 text-sm mt-2">Add services here — they'll replace the defaults on the homepage</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {services.map((service) => (
                  <div key={service.id} className="bg-white/[0.02] border border-white/10 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{service.icon}</span>
                          <p className="font-medium truncate">{service.title}</p>
                        </div>
                        <p className="text-gray-400 text-sm mb-2 line-clamp-2">{service.description}</p>
                        {service.features?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((f, i) => (
                              <span key={i} className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded">{f}</span>
                            ))}
                            {service.features.length > 3 && <span className="text-xs text-gray-600">+{service.features.length - 3} more</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button onClick={() => openServiceForm(service)} className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteService(service.id)} className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                          <Trash2 size={15} />
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

      {/* ── Booking Detail Modal ────────────────────────────────────────────── */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" data-testid="booking-modal">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-medium">Booking Details</h3>
              <button onClick={() => setSelectedBooking(null)} className="p-1 rounded hover:bg-white/10 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {[
                { icon: <User size={14} />, label: 'Name', value: selectedBooking.name },
                { icon: <Mail size={14} />, label: 'Email', value: selectedBooking.email },
                { icon: <Phone size={14} />, label: 'Phone', value: selectedBooking.phone || '—' },
                { icon: null, label: 'Service', value: selectedBooking.service },
                { icon: null, label: 'Preferred Date', value: selectedBooking.preferredDate || '—' },
                { icon: null, label: 'Message', value: selectedBooking.message },
              ].map(row => (
                <div key={row.label}>
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">{row.icon}{row.label}</p>
                  <p className="text-white text-sm">{row.value}</p>
                </div>
              ))}
              <div>
                <p className="text-xs text-gray-500 mb-2">Status</p>
                <StatusBadge status={selectedBooking.status || 'pending'} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-white/10">
              <p className="text-xs text-gray-500 mb-2">Update Status (sends email to client)</p>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'confirmed', 'rejected'].map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(selectedBooking.id, s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedBooking.status === s
                        ? s === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : s === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
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
        </div>
      )}

      {/* ── Project Form Modal ──────────────────────────────────────────────── */}
      {showProjectForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" data-testid="project-modal">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                  onChange={e => setProjectForm({ ...projectForm, title: e.target.value })}
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
                  onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  required
                  placeholder="Brief description"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20 resize-none"
                  data-testid="project-description"
                />
              </div>

              {/* Image — URL or Upload */}
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Image *</label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${imageMode === 'url' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <LinkIcon size={12} /> URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${imageMode === 'upload' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Upload size={12} /> Upload
                  </button>
                </div>

                {imageMode === 'url' ? (
                  <input
                    type="url"
                    value={projectForm.image}
                    onChange={e => {
                      setProjectForm({ ...projectForm, image: e.target.value });
                      setImagePreview(e.target.value);
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                    data-testid="project-image"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="w-full py-8 rounded-lg border border-dashed border-white/20 text-gray-400 hover:border-white/40 hover:text-white transition-all flex flex-col items-center gap-2 disabled:opacity-50"
                    >
                      {uploadingImage ? (
                        <><Loader2 size={20} className="animate-spin" /> Uploading to Cloudinary...</>
                      ) : (
                        <><Image size={20} /> Click to upload image</>
                      )}
                    </button>
                  </div>
                )}

                {/* Image Preview */}
                {imagePreview && (
                  <div className="mt-2 rounded-lg overflow-hidden border border-white/10">
                    <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover" onError={() => setImagePreview('')} />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Project Link (optional)</label>
                <input
                  type="url"
                  value={projectForm.link}
                  onChange={e => setProjectForm({ ...projectForm, link: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                  data-testid="project-link"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={projectSaving || uploadingImage}
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                  data-testid="project-save-btn"
                >
                  {projectSaving && <Loader2 size={14} className="animate-spin" />}
                  {editingProject ? 'Update' : 'Add'} Project
                </button>
                <button type="button" onClick={closeProjectForm} className="px-5 py-2.5 rounded-lg text-gray-400 text-sm hover:text-white">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Service Form Modal ──────────────────────────────────────────────── */}
      {showServiceForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50" data-testid="service-modal">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="font-medium">{editingService ? 'Edit Service' : 'Add Service'}</h3>
              <button onClick={closeServiceForm} className="p-1 rounded hover:bg-white/10 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveService} className="p-5 space-y-4" data-testid="service-form">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Title *</label>
                <input
                  type="text"
                  value={serviceForm.title}
                  onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })}
                  required
                  placeholder="e.g. AI Automation"
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Description *</label>
                <textarea
                  value={serviceForm.description}
                  onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })}
                  required
                  placeholder="Brief description of the service"
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20 resize-none"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Icon Name</label>
                <select
                  value={serviceForm.icon}
                  onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                >
                  {ICON_OPTIONS.map(icon => (
                    <option key={icon} value={icon} className="bg-[#0a0a0f]">{icon}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Display Order</label>
                <input
                  type="number"
                  value={serviceForm.order}
                  onChange={e => setServiceForm({ ...serviceForm, order: e.target.value })}
                  min={0}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-2 block">Features</label>
                {serviceForm.features.map((feature, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={e => handleFeatureChange(i, e.target.value)}
                      placeholder={`Feature ${i + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none focus:border-white/20"
                    />
                    {serviceForm.features.length > 1 && (
                      <button type="button" onClick={() => removeFeature(i)} className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400">
                        <X size={14} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addFeature} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1">
                  <Plus size={12} /> Add Feature
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={serviceSaving}
                  className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-100 disabled:opacity-50 flex items-center gap-2"
                >
                  {serviceSaving && <Loader2 size={14} className="animate-spin" />}
                  {editingService ? 'Update' : 'Add'} Service
                </button>
                <button type="button" onClick={closeServiceForm} className="px-5 py-2.5 rounded-lg text-gray-400 text-sm hover:text-white">
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
