import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/identity';

import './landing.css';
import { LandingNav } from './components/LandingNav';
import { StarfieldCanvas } from './components/StarfieldCanvas';
import HeroSection from './components/HeroSection';
import TrustMarquee from './components/TrustMarquee';
import HowItWorksSection from './components/HowItWorksSection';
import WorkspaceSection from './components/WorkspaceSection';
import GovernanceSection from './components/GovernanceSection';
import WorkloadSection from './components/WorkloadSection';
import CapabilitiesSection from './components/CapabilitiesSection';
import IntegrationsSection from './components/IntegrationsSection';
import { CTASection } from './components/CTASection';
import { Footer } from './components/Footer';

export function LandingPage() {
  const { isAuthenticated, isInitializing } = useAuth();
  
  // Initialize theme from localStorage, default to dark
  const [isDark, setIsDark] = useState(() => {
    return (localStorage.getItem('ryokai-theme') || 'dark') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ryokai-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ryokai-theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // If user is logged in, redirect them to the app
  if (!isInitializing && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="landing-page h-full w-full relative">
      <StarfieldCanvas isDark={isDark} />
      <LandingNav isDark={isDark} toggleTheme={toggleTheme} />
      <HeroSection />
      <TrustMarquee />
      <HowItWorksSection />
      <WorkspaceSection />
      <GovernanceSection />
      <WorkloadSection />
      <CapabilitiesSection />
      <IntegrationsSection />
      <CTASection />
      <Footer />
    </div>
  );
}
