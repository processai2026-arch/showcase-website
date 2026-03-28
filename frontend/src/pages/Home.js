import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Bot, Globe, MessageSquare, ChevronLeft, ChevronRight, Menu, X, ExternalLink } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Navbar
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5' : ''
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold tracking-tight">
          <span className="text-white">Process</span>
          <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent"> AI</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          <a href="#services" className="text-gray-400 hover:text-white transition-colors text-sm">Services</a>
          <a href="#projects" className="text-gray-400 hover:text-white transition-colors text-sm">Projects</a>
          <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">Contact</a>
          <Link 
            to="/booking"
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
            data-testid="nav-book-btn"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-[#0a0a0f]/95 backdrop-blur-xl border-t border-white/5 px-6 py-6"
        >
          <div className="flex flex-col gap-4">
            <a href="#services" onClick={() => setMobileOpen(false)} className="text-gray-300 py-2">Services</a>
            <a href="#projects" onClick={() => setMobileOpen(false)} className="text-gray-300 py-2">Projects</a>
            <a href="#contact" onClick={() => setMobileOpen(false)} className="text-gray-300 py-2">Contact</a>
            <Link 
              to="/booking"
              className="px-5 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium text-center mt-2"
            >
              Book a Call
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background */}
      <div className="absolute inset-0 bg-[#050508]">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-gray-400 text-sm">AI-Powered Solutions</span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold mb-8 leading-[1.1]"
        >
          <span className="text-white">We Build</span>
          <br />
          <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
            Intelligent Systems
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Transform your business with custom AI solutions. From intelligent chatbots 
          to full automation systems — we bring your ideas to life.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link 
            to="/booking"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
            data-testid="hero-cta"
          >
            Start Your Project
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </Link>
          <a 
            href="#projects"
            className="px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
          >
            View Our Work
          </a>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-2"
        >
          <div className="w-1 h-2 rounded-full bg-white/40" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  const services = [
    {
      icon: Bot,
      title: 'AI Automation',
      description: 'Automate repetitive tasks with intelligent AI agents that learn and adapt to your workflow.',
      gradient: 'from-cyan-500 to-blue-600'
    },
    {
      icon: MessageSquare,
      title: 'Chatbot Development',
      description: 'Custom chatbots powered by latest LLMs for customer support, sales, and internal tools.',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      icon: Globe,
      title: 'Web Development',
      description: 'Modern, scalable web applications with AI integration and premium user experience.',
      gradient: 'from-fuchsia-500 to-pink-600'
    }
  ];

  return (
    <section id="services" className="py-32 relative" data-testid="services-section">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 text-white">Our Services</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-white/[0.02] border border-white/5 rounded-2xl p-8 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-300"
              data-testid={`service-card-${index}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-6`}>
                <service.icon size={24} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Projects Section with Auto-Scroll
function ProjectsSection() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default projects (shown when no projects in DB)
  const defaultProjects = [
    {
      id: '1',
      title: 'E-Commerce AI Assistant',
      description: 'Smart product recommendations and customer support chatbot.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop'
    },
    {
      id: '2',
      title: 'Financial Dashboard',
      description: 'Real-time analytics platform with predictive insights.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'Healthcare Chatbot',
      description: 'AI-powered patient assistance and appointment booking.',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=600&h=400&fit=crop'
    },
    {
      id: '4',
      title: 'Logistics Optimizer',
      description: 'Route optimization and delivery tracking system.',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop'
    }
  ];

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/projects`);
      setProjects(data.length > 0 ? data : defaultProjects);
    } catch (error) {
      setProjects(defaultProjects);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId;
    let scrollSpeed = 0.5;

    const scroll = () => {
      if (!isPaused && container) {
        container.scrollLeft += scrollSpeed;
        
        // Reset to start when reaching end
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollLeft = 0;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  const scrollTo = (direction) => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollAmount = 400;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  };

  return (
    <section id="projects" className="py-32 relative overflow-hidden" data-testid="projects-section">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between"
        >
          <div>
            <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 text-white">Featured Projects</h2>
          </div>
          <div className="hidden md:flex gap-2">
            <button 
              onClick={() => scrollTo('left')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              data-testid="scroll-left-btn"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button 
              onClick={() => scrollTo('right')}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              data-testid="scroll-right-btn"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Horizontal Scroll Container */}
      <div 
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-6 overflow-x-auto scrollbar-hide pl-6 md:pl-[max(24px,calc((100vw-1280px)/2+24px))] pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        data-testid="projects-scroll"
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id || index}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-[320px] md:w-[380px] group"
            data-testid={`project-card-${index}`}
          >
            <div className="relative bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden hover:border-white/10 transition-all duration-300">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">{project.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-cyan-400 text-sm hover:text-cyan-300"
                  >
                    View Project <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {/* Spacer */}
        <div className="flex-shrink-0 w-6" />
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section id="contact" className="py-32 relative" data-testid="cta-section">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-3xl p-12 md:p-16"
        >
          {/* Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-500/20 rounded-full blur-[80px]" />
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Build Something Amazing?
            </h2>
            <p className="text-gray-400 mb-10 max-w-xl mx-auto">
              Let's discuss how we can help transform your business with intelligent AI solutions.
            </p>
            <Link 
              to="/booking"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
              data-testid="cta-button"
            >
              Book a Free Consultation
              <ArrowRight size={18} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 border-t border-white/5" data-testid="footer">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-xl font-bold">
            <span className="text-white">Process</span>
            <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent"> AI</span>
          </div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Process AI. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-white transition-colors text-sm">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Home Page
export default function Home() {
  return (
    <div className="min-h-screen bg-[#050508] text-white" data-testid="home-page">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
