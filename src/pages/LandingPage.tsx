import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, Users, Zap, Shield, Layout } from 'lucide-react';

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
    if (e.currentTarget.alt === 'iManager Logo') {
      e.currentTarget.style.display = 'none';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-50 -z-10"></div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
        <div className="container mx-auto px-6 py-2 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Layout className="w-9 h-9 text-[#0052CC] hover:text-indigo-700 transition-colors cursor-pointer" />
            <h1
              className="text-2xl font-extrabold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer relative group"
              onClick={() => navigate('/')}
            >
              iManager
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/login')}
              className="text-gray-700 hover:text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded"
            >
              Log In
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-32 pb-20 text-center">
        <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
          Manage Projects with <span className="text-indigo-600 underline decoration-wavy decoration-indigo-400">Confidence</span>
        </h1>
        <p className="text-lg text-gray-600 mb-12 leading-relaxed">
          iManager helps teams stay organized, meet deadlines, and deliver exceptional results.
          <p></p>
          <span className="font-bold text-indigo-600"> Experience the future of project management today.</span>
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => navigate('/signup')}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 flex items-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-400 relative overflow-hidden shadow-lg"
          >
            <span className="relative z-10">Get Started</span>
            <ArrowRight className="w-5 h-5 relative z-10" />
            <span className="absolute inset-0 bg-indigo-700 transform scale-x-0 origin-left transition-transform duration-300 hover:scale-x-100 z-0"></span>
          </button>
          <button
            onClick={() => navigate('/demo')}
            className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg font-bold hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-indigo-400 shadow-lg"
          >
            Watch Demo
          </button>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="mt-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="relative rounded-lg overflow-hidden shadow-lg group">
            <img
              src={DASHBOARD_PREVIEW}
              alt="iManager Dashboard"
              className="w-full h-auto object-cover group-hover:scale-105 transition-transform"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
            Why <span className="text-indigo-600 underline decoration-wavy decoration-indigo-400">Choose</span> iManager?
          </h2>
          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center hover:shadow-xl transition-shadow p-6 rounded-lg bg-white border border-gray-200 hover:border-indigo-600"
              >
                <div className="bg-indigo-100 w-16 h-16 rounded-full shadow-md flex items-center justify-center mx-auto mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-12">
            Choose Your <span className="text-indigo-600 underline decoration-wavy decoration-indigo-400">Perfect Plan</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white rounded-lg shadow-lg p-8 border hover:shadow-xl transition-shadow transform hover:scale-105 
                  ${plan.popular ? 'border-indigo-600 scale-105' : 'border-gray-200'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-indigo-600 text-white text-sm px-3 py-1 rounded-full shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{plan.name}</h3>
                <div className="text-4xl font-extrabold text-indigo-600 mb-6">
                  {plan.price}
                  <span className="text-lg text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="text-green-500 w-5 h-5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleGetStarted(plan)}
                  className={`w-full py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-110 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-indigo-400 shadow-lg
                    ${plan.popular 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}
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
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">iManager</h3>
              <p className="text-gray-400">
                Making project management simple and effective for teams of all sizes.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                <li className="hover:text-white transition-colors cursor-pointer">Security</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-white transition-colors cursor-pointer">Support</li>
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