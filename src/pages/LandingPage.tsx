import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, Users, Zap, Shield } from 'lucide-react';

const plans = [
  {
    name: 'BASIC',
    price: 800, 
    features: ['Up to 10 team members', 'Basic project management', 'Simple task tracking'],
    popular: false,
  },
  {
    name: 'PRO',
    price: 1500, 
    features: ['Up to 50 team members', 'Advanced project management', 'Custom workflows', 'Time tracking'],
    popular: true,
  },
  {
    name: 'PREMIUM',
    price: 2500,
    features: ['Unlimited team members', 'Enterprise-grade security', 'Priority support', 'Advanced analytics'],
    popular: false,
  },
];

const features = [
  {
    icon: <Zap className="w-6 h-6 text-indigo-500" />,
    title: 'Lightning Fast',
    description: 'Boost your team productivity with our intuitive interface'
  },
  {
    icon: <Users className="w-6 h-6 text-indigo-500" />,
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team in real-time'
  },
  {
    icon: <Shield className="w-6 h-6 text-indigo-500" />,
    title: 'Enterprise Security',
    description: 'Bank-grade security for your sensitive project data'
  }
];

// Dashboard preview remains the same
const DASHBOARD_PREVIEW = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error('Image failed to load:', e.currentTarget.src);
    // Using a simple text-based logo as fallback
    if (e.currentTarget.alt === 'iManager Logo') {
      e.currentTarget.style.display = 'none'; // Hide the broken image
      // The text logo "iManager" will still be visible
    } else {
      e.currentTarget.src = 'https://via.placeholder.com/800x400?text=iManager+Dashboard';
    }
  };

  const handleGetStarted = (plan: { name: string; price: number }) => {
    navigate('/signup', { 
      state: { 
        selectedPlan: plan.name,
        planPrice: plan.price
      } 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation - Updated with simplified branding */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-xl font-bold text-white">i</span>
              </div>
              <h1 className="text-2xl font-bold text-indigo-600">iManager</h1>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-900">
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Manage Projects with <span className="text-indigo-600">Confidence</span>
          </h1>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            iManager helps teams stay organized, meet deadlines, and deliver exceptional results. 
            Experience the future of project management today.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('/demo')}
              className="border border-indigo-600 text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-indigo-50 transition"
            >
              Watch Demo
            </button>
          </div>
        </div>

        {/* Feature Preview - Updated with actual dashboard image */}
        <div className="mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <img
                src={DASHBOARD_PREVIEW}
                alt="iManager Dashboard"
                className="w-full h-auto object-cover rounded-xl"
                onError={handleImageError}
              />
              {/* Optional overlay for better visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Why Choose iManager?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-white w-16 h-16 rounded-lg shadow-md flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Choose Your Perfect Plan
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-xl shadow-lg p-8 border-2 
                  ${plan.popular ? 'border-indigo-600 scale-105' : 'border-gray-100'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="text-4xl font-bold text-indigo-600 mb-6">
                  {plan.price}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleGetStarted(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2
                    ${plan.popular 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">iManager</h3>
              <p className="text-gray-400">
                Making project management simple and effective for teams of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Blog</li>
                <li>Documentation</li>
                <li>Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 iManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}