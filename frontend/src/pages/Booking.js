import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, User, Mail, Phone, Building, DollarSign, MessageSquare, CheckCircle, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const serviceTypes = [
  'AI Automation',
  'Machine Learning',
  'AI Integration',
  'Custom Development',
  'Consulting',
  'Other'
];

const budgetRanges = [
  '$5,000 - $15,000',
  '$15,000 - $50,000',
  '$50,000 - $100,000',
  '$100,000+',
  'Not sure yet'
];

export default function Booking() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service_type: '',
    budget: '',
    message: '',
    preferred_date: ''
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

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center p-6" data-testid="booking-success">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-12 max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-display font-bold mb-4">Booking Confirmed!</h2>
          <p className="text-gray-400 mb-8">
            Thank you for your interest. We'll review your request and get back to you within 24 hours.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold"
            data-testid="back-home-btn"
          >
            Back to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-black py-12 px-6" data-testid="booking-page">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link 
            to="/home" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            data-testid="back-link"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Book a <span className="gradient-text">Consultation</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Tell us about your project and we'll get back to you within 24 hours.
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="glass rounded-3xl p-8 md:p-12 space-y-6"
          data-testid="booking-form"
        >
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400" data-testid="error-message">
              {error}
            </div>
          )}

          {/* Name & Email */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <User size={16} /> Full Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="John Doe"
                data-testid="input-name"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Mail size={16} /> Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="john@company.com"
                data-testid="input-email"
              />
            </div>
          </div>

          {/* Phone & Company */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Phone size={16} /> Phone *
              </label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="+1 (555) 123-4567"
                data-testid="input-phone"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Building size={16} /> Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                placeholder="Acme Inc."
                data-testid="input-company"
              />
            </div>
          </div>

          {/* Service Type & Budget */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                Service Type *
              </label>
              <select
                name="service_type"
                required
                value={formData.service_type}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all appearance-none cursor-pointer"
                data-testid="select-service"
              >
                <option value="" disabled className="bg-deep-black">Select a service</option>
                {serviceTypes.map(type => (
                  <option key={type} value={type} className="bg-deep-black">{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <DollarSign size={16} /> Budget Range
              </label>
              <select
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all appearance-none cursor-pointer"
                data-testid="select-budget"
              >
                <option value="" className="bg-deep-black">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range} className="bg-deep-black">{range}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} /> Preferred Date *
            </label>
            <input
              type="date"
              name="preferred_date"
              required
              value={formData.preferred_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
              data-testid="input-date"
            />
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MessageSquare size={16} /> Project Details *
            </label>
            <textarea
              name="message"
              required
              value={formData.message}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all resize-none"
              placeholder="Tell us about your project, goals, and any specific requirements..."
              data-testid="input-message"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-neon-blue/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            data-testid="submit-btn"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Submitting...
              </>
            ) : (
              'Submit Booking Request'
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
