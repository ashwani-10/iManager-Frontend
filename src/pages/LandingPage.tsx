import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, Users, Zap, Shield, Layout, Clock, Target, BarChart, GitBranch, Share2, PenTool, X, Play, ChevronRight, ChevronLeft } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

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
    icon: <Zap className="w-6 h-6 text-[#0052CC]" />,
    title: 'Lightning Fast',
    description: 'Boost your team productivity with our intuitive interface',
    stats: '50% faster workflows'
  },
  {
    icon: <Users className="w-6 h-6 text-[#0052CC]" />,
    title: 'Team Collaboration',
    description: 'Work seamlessly with your team in real-time',
    stats: '10,000+ teams'
  },
  {
    icon: <Shield className="w-6 h-6 text-[#0052CC]" />,
    title: 'Enterprise Security',
    description: 'Bank-grade security for your sensitive project data',
    stats: '99.9% uptime'
  },
  {
    icon: <Clock className="w-6 h-6 text-[#0052CC]" />,
    title: 'Time Tracking',
    description: 'Monitor project progress and team productivity',
    stats: 'Save 15+ hrs/week'
  },
  {
    icon: <Target className="w-6 h-6 text-[#0052CC]" />,
    title: 'Goal Setting',
    description: 'Set and achieve team objectives efficiently',
    stats: '93% goal completion'
  },
  {
    icon: <BarChart className="w-6 h-6 text-[#0052CC]" />,
    title: 'Analytics',
    description: 'Detailed insights into your team performance',
    stats: 'Real-time metrics'
  }
];

const integrations = [
  { 
    icon: <GitBranch className="w-6 h-6" />, 
    name: 'GitHub Integration',
    description: 'Seamless code integration',
    features: ['Auto PR Creation', 'Branch Management', 'Commit Tracking']
  }
];

// Dashboard preview remains the same
const DASHBOARD_PREVIEW = "https://images.unsplash.com/photo-1531403009284-440f080d1e12?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80";

export default function LandingPage() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');

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

  const DemoModal = () => {
    const slides = [
      {
        title: "Workspace Management",
        description: "Create and manage multiple workspaces for different projects or teams. Keep your work organized and separated.",
        image: "https://res.cloudinary.com/dnzpwthcr/image/upload/v1744996119/Screenshot_2025-04-17_231805_o8cgnl.png",
        features: ["Multiple workspaces", "Team organization", "Project separation"],
        icon: <Layout className="w-12 h-12 text-white" />
      },
      {
        title: "Kanban Board",
        description: "Visualize your workflow with our intuitive Kanban board. Track tasks from TODO to completion with easy drag-and-drop functionality.",
        image: "https://res.cloudinary.com/dnzpwthcr/image/upload/v1744996070/Screenshot_2025-04-17_231547_igadqx.png",
        features: ["Drag-and-drop tasks", "Custom columns", "Task priorities"],
        icon: <PenTool className="w-12 h-12 text-white" />
      },
      {
        title: "GitHub Integration",
        description: "Seamlessly connect with GitHub. Track pull requests, branch status, and code changes directly from iManager.",
        image: "https://res.cloudinary.com/dnzpwthcr/image/upload/v1744995990/Screenshot_2025-04-17_231718_sg9s3x.png",
        features: ["PR tracking", "Branch management", "Commit history"],
        icon: <GitBranch className="w-12 h-12 text-white" />
      },
      {
        title: "Team Collaboration",
        description: "Work together efficiently with real-time updates and seamless communication features.",
        image: "https://res.cloudinary.com/dnzpwthcr/image/upload/v1744995704/Screenshot_2025-04-17_231746_zbpih4.png",
        features: ["Real-time updates", "Team chat", "File sharing"],
        icon: <Users className="w-12 h-12 text-white" />
      }
    ];

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-white to-slate-50 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl">
          {/* Close button */}
          <button 
            onClick={() => setIsDemoOpen(false)}
            className="absolute top-6 right-6 p-2 hover:bg-black/5 rounded-full transition-colors z-20 group"
            title="Close demo"
          >
            <X className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
          </button>

          <div className="flex h-full">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-[#171B21] p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-12">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Play className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white font-medium">Product Tour</span>
                </div>
                
                <div className="space-y-2">
                  {slides.map((slide, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                        currentSlide === index 
                          ? 'bg-white/10 text-white' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {React.cloneElement(slide.icon, { 
                          className: `w-5 h-5 ${currentSlide === index ? 'text-white' : 'text-white/60'}`
                        })}
                        <span className="text-sm font-medium">{slide.title}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setIsDemoOpen(false);
                  navigate('/signup');
                }}
                className="w-full px-4 py-3 bg-[#0052CC] text-white rounded-xl hover:bg-[#0747A6] transition-colors flex items-center justify-center gap-2 group"
              >
                Get Started
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>

            {/* Main Content with Sliding Animation */}
            <div className="flex-1 overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-full p-12 overflow-y-auto"
                    style={{ width: '100%' }}
                  >
                    <div className="max-w-3xl mx-auto">
                      {/* Content Header */}
                      <div className="mb-12">
                        <h2 className="text-4xl font-bold text-[#172B4D] mb-4">
                          {slide.title}
                        </h2>
                        <p className="text-lg text-slate-600">
                          {slide.description}
                        </p>
                      </div>

                      {/* Main Image */}
                      <div className="relative mb-12 group">
                        <img 
                          src={slide.image} 
                          alt={slide.title}
                          className="w-full rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                          onError={handleImageError}
                        />
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6 transition-transform group-hover:rotate-12">
                          {slide.icon}
                        </div>
                      </div>

                      {/* Features Grid */}
                      <div className="grid grid-cols-2 gap-6">
                        {slide.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow">
                            <div className="w-10 h-10 rounded-full bg-[#DEEBFF] flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-[#0052CC]" />
                            </div>
                            <span className="text-[#172B4D] font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Arrows - Absolute positioned */}
          <div className="absolute left-72 right-8 bottom-8 flex justify-between items-center">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
              title="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </button>
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-[#0052CC] w-8' 
                      : 'bg-slate-200 w-2 hover:bg-slate-300'
                  }`}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
              title="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-slate-700" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-[#000000] shadow-lg z-50 opacity-85">
        <div className="container mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0052CC] rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white cursor-pointer" onClick={() => navigate('/')}>
              iManager
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} 
              className="px-4 py-2 text-[14px] font-medium text-white/80 hover:text-white hover:bg-white/10 rounded transition-colors"
            >
              Sign in
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <ScrollReveal type="fade-up" delay={200}>
        <div className="container mx-auto px-6 pt-24 pb-12">
          <div className="max-w-5xl mx-auto text-center bg-gradient-to-br from-white to-slate-50 rounded-3xl p-10 shadow-xl">
            <h1 className="text-5xl font-bold text-[#172B4D] mb-8 leading-tight">
              Manage Projects with{' '}
              <span className="text-[#0052CC]">Confidence</span>
            </h1>
            <p className="text-xl text-[#172B4D] mb-12 leading-relaxed">
              iManager helps teams stay organized, meet deadlines, and deliver exceptional results.
            </p>
            <div className="flex justify-center gap-6">
              <button onClick={() => navigate('/signup')} className="group px-8 py-4 text-sm font-bold text-white bg-[#0052CC] hover:bg-[#0747A6] rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                Get Started
                <ArrowRight className="inline ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button 
                onClick={() => setIsDemoOpen(true)} 
                className="px-8 py-4 text-sm font-bold text-[#172B4D] border-2 border-[#DEEBFF] hover:border-[#0052CC] rounded-full transition-colors hover:bg-[#DEEBFF]"
              >
                Watch Demo
              </button>
            </div>
            
            {/* Added Stats Bar */}
            <div className="mt-16 grid grid-cols-3 gap-8 p-6 bg-white rounded-xl shadow-lg">
              <div className="text-center p-4 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="text-3xl font-bold text-[#0052CC]">10k+</div>
                <div className="text-sm text-[#172B4D]">Active Users</div>
              </div>
              <div className="text-center p-4 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="text-3xl font-bold text-[#0052CC]">99.9%</div>
                <div className="text-sm text-[#172B4D]">Uptime</div>
              </div>
              <div className="text-center p-4 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="text-3xl font-bold text-[#0052CC]">24/7</div>
                <div className="text-sm text-[#172B4D]">Support</div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Integrations Section */}
      <ScrollReveal type="fade-left" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
              <GitBranch className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Native GitHub Integration</span>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-left">
                <h3 className="text-3xl font-bold text-[#172B4D]">Powerful GitHub Integration</h3>
                <p className="text-lg text-[#172B4D]">Connect your repositories and manage your development workflow seamlessly</p>
                <ul className="space-y-4">
                  {integrations[0].features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#171B21] flex items-center justify-center">
                        <GitBranch className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#172B4D] font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <img 
                  src="https://github.githubassets.com/images/modules/site/home-campaign/illu-actions.png" 
                  alt="GitHub Integration" 
                  className="w-full rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6">
                  <GitBranch className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* App Info Section */}
      <ScrollReveal type="fade-right" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
              <PenTool className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Smart Task Management</span>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="relative order-2 md:order-1">
                <img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80" 
                  alt="Task Management" 
                  className="w-full rounded-lg shadow-xl"
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6">
                  <PenTool className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="space-y-6 text-left order-1 md:order-2">
                <h3 className="text-3xl font-bold text-[#172B4D]">Streamline Your Workflow</h3>
                <p className="text-lg text-[#172B4D]">Organize tasks, track progress, and achieve goals with our intuitive task management system</p>
                <ul className="space-y-4">
                  {[
                    'Intuitive Kanban Boards',
                    'Custom Task Templates',
                    'Automated Workflows'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#171B21] flex items-center justify-center">
                        <PenTool className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-[#172B4D] font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Pricing Section */}
      <ScrollReveal type="fade-up" delay={200} staggerChildren>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Flexible Plans</span>
            </div>
            <h2 className="text-3xl font-bold text-[#172B4D] mb-14">
              Choose Your <span className="text-[#0052CC]">Perfect Plan</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div key={plan.name} 
                  className={`relative bg-white rounded-lg p-8 border border-slate-200 hover:border-[#0052CC]/50 transition-all duration-200 hover:-translate-y-1 ${
                    plan.popular ? 'shadow-xl' : 'shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[#171B21] text-white text-sm px-4 py-1 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col h-full">
                    <div>
                      <h3 className="text-2xl font-bold text-[#172B4D] mb-2">{plan.name}</h3>
                      <div className="text-4xl font-bold text-[#0052CC] mb-6">
                      ₹{plan.price}
                        <span className="text-base font-normal text-[#172B4D]">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#DEEBFF] flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-[#0052CC]" />
                          </div>
                          <span className="text-[#172B4D]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handleGetStarted(plan)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-[#171B21] text-white hover:bg-[#0052CC]'
                          : 'bg-[#DEEBFF] text-[#0052CC] hover:bg-[#0052CC] hover:text-white'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Feature Preview */}
      <ScrollReveal type="zoom-in" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
              <Layout className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Dashboard Preview</span>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-left">
                <h3 className="text-3xl font-bold text-[#172B4D]">Beautiful & Intuitive Interface</h3>
                <p className="text-lg text-[#172B4D]">Experience a clean, modern dashboard designed for maximum productivity</p>
                <button onClick={() => setIsDemoOpen(true)} className="inline-flex items-center gap-2 px-6 py-3 bg-[#171B21] text-white rounded-lg hover:bg-[#0052CC] transition-colors">
                  Watch Demo
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <img 
                  src={DASHBOARD_PREVIEW} 
                  alt="iManager Dashboard" 
                  className="w-full rounded-lg shadow-xl"
                  onError={handleImageError}
                />
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6">
                  <Layout className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Features Section */}
      <ScrollReveal type="fade-up" delay={200} staggerChildren>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Why Choose Us</span>
            </div>
            <h2 className="text-3xl font-bold text-[#172B4D] mb-14">
              Features you'll <span className="text-[#0052CC]">love</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="group p-8 rounded-lg bg-white border border-slate-200 hover:border-[#0052CC]/50 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl bg-[#171B21] flex items-center justify-center mb-6">
                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                  </div>
                  <h3 className="text-xl font-bold text-[#172B4D] mb-3">{feature.title}</h3>
                  <p className="text-[#172B4D] mb-4">{feature.description}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#DEEBFF] rounded-full">
                    <span className="text-[#0052CC] text-sm font-medium">{feature.stats}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Footer */}
      <footer className="bg-[#000000] text-white/80 py-24 opacity-90">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-12">
              <div className="w-12 h-12 bg-[#0052CC] rounded-xl flex items-center justify-center shadow-lg">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white">iManager</h3>
            </div>
            <div className="grid md:grid-cols-4 gap-12 mb-12 text-center md:text-left">
              <div>
                <p className="text-lg">
                  Making project management simple and effective for teams of all sizes.
                </p>
              </div>
              {['Product', 'Company', 'Resources'].map((section) => (
                <div key={section}>
                  <h4 className="text-white font-semibold mb-6">{section}</h4>
                  <ul className="space-y-4">
                    {section === 'Product' ? (
                      <>
                        <li className="hover:text-white transition-colors cursor-pointer">Features</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Pricing</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Security</li>
                      </>
                    ) : section === 'Company' ? (
                      <>
                        <li className="hover:text-white transition-colors cursor-pointer">About Us</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Careers</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Contact</li>
                      </>
                    ) : (
                      <>
                        <li className="hover:text-white transition-colors cursor-pointer">Blog</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
                        <li className="hover:text-white transition-colors cursor-pointer">Support</li>
                      </>
                    )}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-white/60">&copy; 2025 iManager. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {isDemoOpen && <DemoModal />}
    </div>
  );
}