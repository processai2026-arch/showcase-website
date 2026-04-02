import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, User, Mail, Phone, Briefcase, MessageSquare, Calendar, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const serviceOptions = [
  'AI Automation',
  'Chatbot Development',
  'Web Development',
  'Custom AI Solution',
  'Consulting',
  'Other'
];

export default function Booking() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    preferredDate: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await axios.post(`${API_URL}/api/bookings`, formData);
      setIsSuccess(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050508] flex items-center justify-center p-6" data-testid="booking-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 flex items-center justify-center mx-auto mb-8">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
          <p className="text-gray-400 mb-3">
            Your booking request has been received. We'll get back to you within 24 hours.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            A confirmation email has been sent to <span className="text-cyan-400">{formData.email}</span>
          </p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium"
            data-testid="back-home-btn"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050508] py-12 px-6" data-testid="booking-page">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            to="/home"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-10 transition-colors"
            data-testid="back-link"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-bold text-white mb-3">
            Book a Call
          </h1>
          <p className="text-gray-400">
            Tell us about your project and we'll get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-5"
          data-testid="booking-form"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <User size={14} /> Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              data-testid="input-name"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Mail size={14} /> Email *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@company.com"
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              data-testid="input-email"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Phone size={14} /> Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              data-testid="input-phone"
            />
          </div>

          {/* Service */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Briefcase size={14} /> Service *
            </label>
            <select
              name="service"
              required
              value={formData.service}
              onChange={handleChange}
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all appearance-none cursor-pointer"
              data-testid="select-service"
            >
              <option value="" disabled className="bg-[#0a0a0f]">Select a service</option>
              {serviceOptions.map(service => (
                <option key={service} value={service} className="bg-[#0a0a0f]">{service}</option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <MessageSquare size={14} /> Message *
            </label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us about your project..."
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-gray-500 focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all resize-none"
              data-testid="input-message"
            />
          </div>

          {/* Preferred Date */}
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-300 mb-2">
              <Calendar size={14} /> Preferred Date *
            </label>
            <input
              type="date"
              name="preferredDate"
              required
              value={formData.preferredDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3.5 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-cyan-500/50 focus:bg-white/[0.05] outline-none transition-all"
              data-testid="input-date"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
            data-testid="submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Sending...
              </>
            ) : (
              'Submit Request'
            )}
          </button>
        </motion.form>

        <p className="text-center text-gray-500 text-sm mt-8">
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
}
