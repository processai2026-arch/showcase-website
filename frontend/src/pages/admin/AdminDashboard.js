import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  LayoutDashboard, FileText, Briefcase, Calendar, Settings, LogOut,
  Plus, Edit2, Trash2, Save, X, Loader2, CheckCircle, Clock, XCircle
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Sidebar
function Sidebar({ activeTab, setActiveTab, onLogout }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'projects', label: 'Projects', icon: FileText },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-deep-blue min-h-screen p-6 flex flex-col" data-testid="admin-sidebar">
      <div className="mb-10">
        <h1 className="text-xl font-display font-bold gradient-text">Process AI</h1>
        <p className="text-gray-500 text-sm">Admin Panel</p>
      </div>

      <nav className="flex-1 space-y-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon size={20} />
            {tab.label}
          </button>
        ))}
      </nav>

      <button
        onClick={onLogout}
        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 transition-colors"
        data-testid="logout-btn"
      >
        <LogOut size={20} />
        Logout
      </button>
    </div>
  );
}

// Dashboard Tab
function DashboardTab({ bookings }) {
  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: 'neon-blue' },
    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'yellow-500' },
    { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'green-500' },
    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, color: 'neon-purple' },
  ];

  return (
    <div data-testid="dashboard-tab">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="glass rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold text-${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>
      
      <h3 className="text-xl font-semibold mb-4">Recent Bookings</h3>
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4 text-gray-400 font-medium">Name</th>
              <th className="text-left p-4 text-gray-400 font-medium">Service</th>
              <th className="text-left p-4 text-gray-400 font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.slice(0, 5).map((booking, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-4">{booking.name}</td>
                <td className="p-4 text-gray-400">{booking.service_type}</td>
                <td className="p-4 text-gray-400">{booking.preferred_date}</td>
                <td className="p-4">
                  <StatusBadge status={booking.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }) {
  const config = {
    pending: { icon: Clock, color: 'yellow-500', bg: 'yellow-500/10' },
    confirmed: { icon: CheckCircle, color: 'green-500', bg: 'green-500/10' },
    completed: { icon: CheckCircle, color: 'neon-purple', bg: 'neon-purple/10' },
    cancelled: { icon: XCircle, color: 'red-500', bg: 'red-500/10' },
  };
  const { icon: Icon, color, bg } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${bg} text-${color}`}>
      <Icon size={12} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Services Tab
function ServicesTab() {
  const [services, setServices] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/services`);
      setServices(data);
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveService = async (service) => {
    try {
      if (service.id) {
        await axios.put(`${API_URL}/api/services/${service.id}`, service, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/api/services`, service, { withCredentials: true });
      }
      fetchServices();
      setEditing(null);
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await axios.delete(`${API_URL}/api/services/${id}`, { withCredentials: true });
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-neon-blue" size={32} /></div>;
  }

  return (
    <div data-testid="services-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Services</h2>
        <button
          onClick={() => setEditing({ title: '', description: '', icon: 'cpu', features: [], order: services.length })}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium"
          data-testid="add-service-btn"
        >
          <Plus size={18} /> Add Service
        </button>
      </div>

      {editing && (
        <ServiceForm 
          service={editing} 
          onSave={saveService} 
          onCancel={() => setEditing(null)} 
        />
      )}

      <div className="grid gap-4">
        {services.map(service => (
          <div key={service.id} className="glass rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{service.title}</h3>
              <p className="text-gray-400 text-sm">{service.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(service)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                data-testid={`edit-service-${service.id}`}
              >
                <Edit2 size={18} className="text-neon-blue" />
              </button>
              <button
                onClick={() => deleteService(service.id)}
                className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                data-testid={`delete-service-${service.id}`}
              >
                <Trash2 size={18} className="text-red-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Service Form
function ServiceForm({ service, onSave, onCancel }) {
  const [form, setForm] = useState(service);
  const [features, setFeatures] = useState(service.features?.join('\n') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, features: features.split('\n').filter(f => f.trim()) });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 mb-6 space-y-4"
      data-testid="service-form"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Service Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
        />
        <select
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
        >
          <option value="cpu">CPU (Automation)</option>
          <option value="brain">Brain (ML)</option>
          <option value="zap">Zap (Integration)</option>
          <option value="code">Code (Development)</option>
        </select>
      </div>
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
        rows={2}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue resize-none"
      />
      <textarea
        placeholder="Features (one per line)"
        value={features}
        onChange={(e) => setFeatures(e.target.value)}
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue resize-none"
      />
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white">
          <X size={18} />
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-2 rounded-full bg-neon-blue text-white font-medium">
          <Save size={18} /> Save
        </button>
      </div>
    </motion.form>
  );
}

// Projects Tab
function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [editing, setEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/projects`);
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProject = async (project) => {
    try {
      if (project.id) {
        await axios.put(`${API_URL}/api/projects/${project.id}`, project, { withCredentials: true });
      } else {
        await axios.post(`${API_URL}/api/projects`, project, { withCredentials: true });
      }
      fetchProjects();
      setEditing(null);
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axios.delete(`${API_URL}/api/projects/${id}`, { withCredentials: true });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-neon-blue" size={32} /></div>;
  }

  return (
    <div data-testid="projects-tab">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button
          onClick={() => setEditing({ title: '', description: '', image_url: '', category: '', technologies: [], order: projects.length })}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium"
          data-testid="add-project-btn"
        >
          <Plus size={18} /> Add Project
        </button>
      </div>

      {editing && (
        <ProjectForm 
          project={editing} 
          onSave={saveProject} 
          onCancel={() => setEditing(null)} 
        />
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {projects.map(project => (
          <div key={project.id} className="glass rounded-2xl overflow-hidden">
            {project.image_url && (
              <img src={project.image_url} alt={project.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-6">
              <span className="text-neon-blue text-xs font-medium">{project.category}</span>
              <h3 className="text-lg font-semibold mt-1">{project.title}</h3>
              <p className="text-gray-400 text-sm mt-2">{project.description}</p>
              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={() => setEditing(project)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Edit2 size={18} className="text-neon-blue" />
                </button>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={18} className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Project Form
function ProjectForm({ project, onSave, onCancel }) {
  const [form, setForm] = useState(project);
  const [techs, setTechs] = useState(project.technologies?.join(', ') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, technologies: techs.split(',').map(t => t.trim()).filter(t => t) });
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-6 mb-6 space-y-4"
      data-testid="project-form"
    >
      <div className="grid md:grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Project Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
          className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
        />
      </div>
      <input
        type="url"
        placeholder="Image URL"
        value={form.image_url}
        onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        required
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
      />
      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
        rows={2}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue resize-none"
      />
      <input
        type="text"
        placeholder="Technologies (comma separated)"
        value={techs}
        onChange={(e) => setTechs(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-neon-blue"
      />
      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white">
          <X size={18} />
        </button>
        <button type="submit" className="flex items-center gap-2 px-6 py-2 rounded-full bg-neon-blue text-white font-medium">
          <Save size={18} /> Save
        </button>
      </div>
    </motion.form>
  );
}

// Bookings Tab
function BookingsTab({ bookings, onRefresh }) {
  const updateStatus = async (bookingId, status) => {
    try {
      await axios.patch(`${API_URL}/api/bookings/${bookingId}/status`, { status }, { withCredentials: true });
      onRefresh();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div data-testid="bookings-tab">
      <h2 className="text-2xl font-bold mb-6">Bookings</h2>
      
      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="text-left p-4 text-gray-400 font-medium">Client</th>
              <th className="text-left p-4 text-gray-400 font-medium">Service</th>
              <th className="text-left p-4 text-gray-400 font-medium">Budget</th>
              <th className="text-left p-4 text-gray-400 font-medium">Date</th>
              <th className="text-left p-4 text-gray-400 font-medium">Status</th>
              <th className="text-left p-4 text-gray-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking, i) => (
              <tr key={i} className="border-t border-white/5">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{booking.name}</p>
                    <p className="text-gray-500 text-sm">{booking.email}</p>
                  </div>
                </td>
                <td className="p-4 text-gray-400">{booking.service_type}</td>
                <td className="p-4 text-gray-400">{booking.budget || '-'}</td>
                <td className="p-4 text-gray-400">{booking.preferred_date}</td>
                <td className="p-4">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="p-4">
                  <select
                    value={booking.status}
                    onChange={(e) => updateStatus(booking.id, e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm outline-none"
                    data-testid={`status-select-${i}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No bookings yet
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Tab (placeholder)
function SettingsTab() {
  return (
    <div data-testid="settings-tab">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <div className="glass rounded-2xl p-6">
        <p className="text-gray-400">Site settings and configuration options will be available here.</p>
      </div>
    </div>
  );
}

// Main Dashboard
export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/bookings`, { withCredentials: true });
      // Add id if not present
      const bookingsWithId = data.map((b, i) => ({ ...b, id: b.id || b._id || i.toString() }));
      setBookings(bookingsWithId);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/process-admin-secure');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab bookings={bookings} />;
      case 'services': return <ServicesTab />;
      case 'projects': return <ProjectsTab />;
      case 'bookings': return <BookingsTab bookings={bookings} onRefresh={fetchBookings} />;
      case 'settings': return <SettingsTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-deep-black flex" data-testid="admin-dashboard">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderTab()}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
