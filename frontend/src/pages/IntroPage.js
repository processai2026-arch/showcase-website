import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function IntroPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Skip intro, go directly to home
    navigate('/home');
  }, [navigate]);

  return null;
}
