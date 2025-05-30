import { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { Button } from '@/components/ui/button';
import Hero from '@/components/landing/Hero';
import Navbar from '@/components/landing/Navbar';
import FeatureCard from '@/components/landing/FeatureCard';
import AuthModals from '@/components/auth/AuthModals';
import { useAuth } from '@/lib/auth';
import { 
  FileUpIcon, 
  BrainCircuitIcon, 
  ArrowLeftRightIcon, 
  FacebookIcon, 
  InstagramIcon, 
  TwitterIcon,
  Loader2
} from 'lucide-react';

const LandingPage = () => {
  const [, setLocation] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to dashboard if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/dashboard');
    }
  }, [isAuthenticated, setLocation]);

  const handleGetStarted = () => {
    setShowLoginModal(true);
  };
  
  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect to dashboard if authenticated
  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  const features = [
    {
      title: 'Report Documents',
      description: 'Report lost documents or upload details of documents you\'ve found to help others.',
      icon: <FileUpIcon className="h-5 w-5" />
    },
    {
      title: 'AI Matching',
      description: 'Our AI technology automatically matches lost documents with found ones.',
      icon: <BrainCircuitIcon className="h-5 w-5" />
    },
    {
      title: 'Connect & Recover',
      description: 'Get notified instantly when we find a match and coordinate safe return of documents.',
      icon: <ArrowLeftRightIcon className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        onLoginClick={() => setShowLoginModal(true)} 
        onSignupClick={() => setShowSignupModal(true)} 
      />
      
      <Hero onGetStarted={handleGetStarted} />
      
      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">How It Works</h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our AI-powered system makes finding lost documents simple and effective.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Success Stories</h2>
          </div>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-primary text-3xl">"</div>
                <div className="ml-4">
                  <p className="text-gray-500">I lost my passport at the airport and was panicking. Someone found it and uploaded it to DocFinder. I was notified within hours and got it back the same day!</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">- Sarah J.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-start">
                <div className="flex-shrink-0 text-primary text-3xl">"</div>
                <div className="ml-4">
                  <p className="text-gray-500">Found an ID card and wasn't sure how to return it. Used DocFinder's AI system to upload a photo, and it automatically matched with the owner. Simple and effective!</p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-900">- Michael T.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <TwitterIcon className="h-5 w-5" />
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 DocFinder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Auth Modals */}
      <AuthModals 
        showLogin={showLoginModal}
        showSignup={showSignupModal}
        onLoginClose={() => setShowLoginModal(false)}
        onSignupClose={() => setShowSignupModal(false)}
        onSwitchToSignup={() => {
          setShowLoginModal(false);
          setShowSignupModal(true);
        }}
        onSwitchToLogin={() => {
          setShowSignupModal(false);
          setShowLoginModal(true);
        }}
      />
    </div>
  );
};

export default LandingPage;
