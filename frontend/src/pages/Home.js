import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Cpu, Brain, Zap, Code, ChevronRight, Menu, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Navigation
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass py-4' : 'py-6'
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/home" className="text-2xl font-display font-bold gradient-text">
          Process AI
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#services" className="text-gray-300 hover:text-white transition-colors">Services</a>
          <a href="#projects" className="text-gray-300 hover:text-white transition-colors">Projects</a>
          <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
          <Link 
            to="/booking"
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium hover:opacity-90 transition-opacity"
            data-testid="book-call-btn"
          >
            Book a Call
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
          data-testid="mobile-menu-btn"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass mt-4 mx-6 rounded-2xl p-6"
        >
          <div className="flex flex-col gap-4">
            <a href="#services" className="text-gray-300 hover:text-white py-2">Services</a>
            <a href="#projects" className="text-gray-300 hover:text-white py-2">Projects</a>
            <a href="#about" className="text-gray-300 hover:text-white py-2">About</a>
            <Link 
              to="/booking"
              className="px-6 py-3 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-medium text-center"
            >
              Book a Call
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  return (
    <section className="min-h-screen relative flex items-center justify-center pt-20 overflow-hidden" data-testid="hero-section">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep-blue via-deep-black to-deep-black" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[100px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-block px-4 py-2 rounded-full glass text-neon-blue text-sm font-medium mb-8">
            AI-Powered Solutions
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 leading-tight"
        >
          <span className="text-white">Transform Your</span>
          <br />
          <span className="gradient-text">Business with AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl text-gray-400 max-w-2xl mx-auto mb-12"
        >
          We build intelligent automation solutions that streamline operations, 
          reduce costs, and accelerate growth for forward-thinking companies.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link 
            to="/booking"
            className="group px-8 py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
            data-testid="hero-cta"
          >
            Start Your Project
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          <a 
            href="#projects"
            className="px-8 py-4 rounded-full glass text-white font-semibold hover:bg-white/10 transition-colors"
          >
            View Our Work
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 rounded-full border-2 border-gray-600 flex justify-center pt-2"
        >
          <div className="w-1.5 h-3 rounded-full bg-gradient-to-b from-neon-blue to-neon-purple" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// Services Section
function ServicesSection() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/services`);
      if (data.length > 0) {
        setServices(data);
      } else {
        // Default services
        setServices([
          { id: '1', title: 'AI Automation', description: 'Automate repetitive tasks with intelligent AI agents that learn and adapt.', icon: 'cpu', features: ['Process automation', 'Workflow optimization', 'Cost reduction'] },
          { id: '2', title: 'Machine Learning', description: 'Custom ML models tailored to your specific business needs and data.', icon: 'brain', features: ['Predictive analytics', 'Pattern recognition', 'Data insights'] },
          { id: '3', title: 'AI Integration', description: 'Seamlessly integrate AI capabilities into your existing systems.', icon: 'zap', features: ['API development', 'System integration', 'Cloud deployment'] },
          { id: '4', title: 'Custom Development', description: 'End-to-end AI product development from concept to deployment.', icon: 'code', features: ['Full-stack development', 'MVP creation', 'Scalable architecture'] },
        ]);
      }
    } catch (error) {
      // Use defaults on error
      setServices([
        { id: '1', title: 'AI Automation', description: 'Automate repetitive tasks with intelligent AI agents.', icon: 'cpu', features: ['Process automation', 'Workflow optimization', 'Cost reduction'] },
        { id: '2', title: 'Machine Learning', description: 'Custom ML models for your business needs.', icon: 'brain', features: ['Predictive analytics', 'Pattern recognition', 'Data insights'] },
        { id: '3', title: 'AI Integration', description: 'Integrate AI into your existing systems.', icon: 'zap', features: ['API development', 'System integration', 'Cloud deployment'] },
        { id: '4', title: 'Custom Development', description: 'End-to-end AI product development.', icon: 'code', features: ['Full-stack development', 'MVP creation', 'Scalable architecture'] },
      ]);
    }
  };

  const getIcon = (iconName) => {
    const icons = { cpu: Cpu, brain: Brain, zap: Zap, code: Code };
    const Icon = icons[iconName] || Cpu;
    return <Icon size={32} />;
  };

  return (
    <section id="services" className="py-32 relative" data-testid="services-section">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-neon-blue text-sm font-medium tracking-wider uppercase">What We Do</span>
          <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6">Our Services</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprehensive AI solutions to transform every aspect of your business operations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group glass rounded-2xl p-8 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer"
              style={{ perspective: '1000px' }}
              data-testid={`service-card-${index}`}
            >
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center text-neon-blue mb-6 group-hover:scale-110 transition-transform">
                {getIcon(service.icon)}
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-400 mb-4">{service.description}</p>
              <ul className="space-y-2">
                {service.features?.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                    <ChevronRight size={14} className="text-neon-blue" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Projects Section with Horizontal Scroll
function ProjectsSection() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/projects`);
      if (data.length > 0) {
        setProjects(data);
      } else {
        // Default projects
        setProjects([
          { id: '1', title: 'E-Commerce AI', description: 'Intelligent product recommendations engine', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', category: 'Machine Learning', technologies: ['Python', 'TensorFlow', 'AWS'] },
          { id: '2', title: 'FinTech Dashboard', description: 'Real-time financial analytics platform', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', category: 'Data Analytics', technologies: ['React', 'Node.js', 'D3.js'] },
          { id: '3', title: 'Healthcare Bot', description: 'AI-powered patient assistance system', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800', category: 'AI Automation', technologies: ['GPT-4', 'FastAPI', 'MongoDB'] },
          { id: '4', title: 'Smart Logistics', description: 'Route optimization with ML', image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800', category: 'Optimization', technologies: ['Python', 'OR-Tools', 'Google Maps'] },
        ]);
      }
    } catch (error) {
      setProjects([
        { id: '1', title: 'E-Commerce AI', description: 'Intelligent product recommendations', image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800', category: 'Machine Learning', technologies: ['Python', 'TensorFlow'] },
        { id: '2', title: 'FinTech Dashboard', description: 'Real-time financial analytics', image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800', category: 'Data Analytics', technologies: ['React', 'Node.js'] },
        { id: '3', title: 'Healthcare Bot', description: 'AI patient assistance', image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800', category: 'AI Automation', technologies: ['GPT-4', 'FastAPI'] },
      ]);
    }
  };

  return (
    <section id="projects" className="py-32 relative overflow-hidden" data-testid="projects-section">
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between"
        >
          <div>
            <span className="text-neon-blue text-sm font-medium tracking-wider uppercase">Portfolio</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold mt-4">Featured Projects</h2>
          </div>
          <Link to="/booking" className="hidden md:flex items-center gap-2 text-neon-blue hover:text-white transition-colors">
            Start a project <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Horizontal Scroll Container */}
      <div className="horizontal-scroll pl-6 md:pl-[calc((100vw-1280px)/2+24px)] pb-8 gap-6" data-testid="projects-scroll">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group relative w-[350px] md:w-[450px] h-[500px] rounded-3xl overflow-hidden glass"
            data-testid={`project-card-${index}`}
          >
            <img 
              src={project.image_url} 
              alt={project.title}
              className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-neon-blue/20 text-neon-blue text-xs font-medium mb-4">
                {project.category}
              </span>
              <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
              <p className="text-gray-400 mb-4">{project.description}</p>
              <div className="flex flex-wrap gap-2">
                {project.technologies?.map((tech, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white/10 text-xs text-gray-300">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
        {/* Spacer for last item visibility */}
        <div className="w-6 flex-shrink-0" />
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  return (
    <section className="py-32 relative" data-testid="cta-section">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden"
        >
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-neon-purple/20 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto">
              Let's discuss how AI can revolutionize your operations and drive unprecedented growth.
            </p>
            <Link 
              to="/booking"
              className="inline-flex items-center gap-2 px-10 py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple text-white font-semibold hover:shadow-lg hover:shadow-neon-blue/30 transition-all"
              data-testid="cta-button"
            >
              Schedule a Consultation
              <ArrowRight size={20} />
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
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-2xl font-display font-bold gradient-text">Process AI</div>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Process AI. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Home Page
export default function Home() {
  return (
    <div className="min-h-screen bg-deep-black text-white noise-overlay" data-testid="home-page">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <ProjectsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
