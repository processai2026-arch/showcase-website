import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const [showIntro, setShowIntro] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
      setTimeout(() => navigate('/home'), 500);
    }, 3500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <AnimatePresence>
      {showIntro && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-deep-black flex items-center justify-center z-50"
          data-testid="intro-page"
        >
          <div className="relative">
            {/* Logo animation */}
            <motion.div className="flex items-baseline text-5xl md:text-7xl font-display font-bold">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-white"
              >
                Process
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="ml-3"
              >
                <span className="text-white">A</span>
                <span className="relative inline-block">
                  <span className="text-white">I</span>
                  {/* Animated dot */}
                  <motion.span
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ 
                      delay: 1.2, 
                      duration: 0.8, 
                      type: "spring",
                      stiffness: 200,
                      damping: 10
                    }}
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-purple"
                    style={{ boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' }}
                  />
                </span>
              </motion.span>
            </motion.div>
            
            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 0.8 }}
              className="text-center mt-6 text-gray-400 text-lg tracking-wider"
            >
              Intelligent Solutions for Modern Business
            </motion.p>

            {/* Glowing orb background */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.3 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
              }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
