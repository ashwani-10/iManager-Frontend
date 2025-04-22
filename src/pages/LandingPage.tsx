import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Star, Users, Zap, Shield, Layout, Clock, Target, BarChart, GitBranch, Share2, PenTool, X, Play, ChevronRight, ChevronLeft, Calendar, FileText, MessageSquare, Settings, Bell, Activity, PieChart, Sparkles, Circle, Square, Triangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  const scrollToPricing = () => {
    const pricingSection = document.getElementById('pricing-section');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
      setIsPricingOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

    const handleSlideChange = (newIndex: number) => {
      setSlideDirection(newIndex > currentSlide ? 'right' : 'left');
      setCurrentSlide(newIndex);
    };

    const handleNext = () => {
      if (currentSlide < slides.length - 1) {
        handleSlideChange(currentSlide + 1);
      }
    };

    const handlePrevious = () => {
      if (currentSlide > 0) {
        handleSlideChange(currentSlide - 1);
      }
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gradient-to-br from-white to-slate-50 rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative shadow-2xl"
        >
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
                      onClick={() => handleSlideChange(index)}
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
              <AnimatePresence mode="wait" custom={slideDirection}>
                <motion.div
                  key={currentSlide}
                  custom={slideDirection}
                  initial={{ 
                    x: slideDirection === 'right' ? '100%' : '-100%',
                    opacity: 0 
                  }}
                  animate={{ 
                    x: 0,
                    opacity: 1 
                  }}
                  exit={{ 
                    x: slideDirection === 'right' ? '-100%' : '100%',
                    opacity: 0 
                  }}
                  transition={{ duration: 0.5 }}
                  className="flex-shrink-0 w-full p-12 overflow-y-auto"
                >
                  <div className="max-w-3xl mx-auto">
                    {/* Content Header */}
                    <div className="mb-12">
                      <h2 className="text-4xl font-bold text-[#172B4D] mb-4">
                        {slides[currentSlide].title}
                      </h2>
                      <p className="text-lg text-slate-600">
                        {slides[currentSlide].description}
                      </p>
                    </div>

                    {/* Main Image */}
                    <div className="relative mb-12 group">
                      <img 
                        src={slides[currentSlide].image} 
                        alt={slides[currentSlide].title}
                        className="w-full rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-[1.02]"
                        onError={handleImageError}
                      />
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6 transition-transform group-hover:rotate-12">
                        {slides[currentSlide].icon}
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-2 gap-6">
                      {slides[currentSlide].features.map((feature, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-lg hover:shadow-xl transition-shadow"
                        >
                          <div className="w-10 h-10 rounded-full bg-[#DEEBFF] flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-[#0052CC]" />
                          </div>
                          <span className="text-[#172B4D] font-medium">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute left-72 right-8 bottom-8 flex justify-between items-center">
            <motion.button
              onClick={handlePrevious}
              disabled={currentSlide === 0}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
              title="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-slate-700" />
            </motion.button>
            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleSlideChange(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index 
                      ? 'bg-[#0052CC] w-8' 
                      : 'bg-slate-200 w-2 hover:bg-slate-300'
                  }`}
                  title={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            <motion.button
              onClick={handleNext}
              disabled={currentSlide === slides.length - 1}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transition-all"
              title="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-slate-700" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  const managementStats = [
    { icon: <Activity className="w-6 h-6" />, label: "Tasks Completed", value: "85%", color: "bg-green-500" },
    { icon: <Calendar className="w-6 h-6" />, label: "On Time Delivery", value: "92%", color: "bg-blue-500" },
    { icon: <Users className="w-6 h-6" />, label: "Team Productivity", value: "78%", color: "bg-purple-500" },
    { icon: <PieChart className="w-6 h-6" />, label: "Project Success", value: "88%", color: "bg-orange-500" }
  ];

  const managementFeatures = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Task Management",
      description: "Organize and track tasks with our intuitive system",
      stats: "10,000+ tasks managed daily"
    },
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Team Communication",
      description: "Seamless team collaboration and messaging",
      stats: "50% faster communication"
    },
    {
      icon: <Settings className="w-8 h-8" />,
      title: "Workflow Automation",
      description: "Automate repetitive tasks and processes",
      stats: "Save 15+ hours weekly"
    },
    {
      icon: <Bell className="w-8 h-8" />,
      title: "Smart Notifications",
      description: "Stay updated with intelligent alerts",
      stats: "95% notification accuracy"
    }
  ];

  // Animated Word Component
  const AnimatedWord = () => {
    const words = ['Ease', 'Confidence', 'Precision', 'Speed'];
    const [currentWord, setCurrentWord] = useState(0);
  
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentWord((prev) => (prev + 1) % words.length);
      }, 2000);
      return () => clearInterval(interval);
    }, []);
  
    return (
      <span className="relative inline-block w-40 text-center">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute left-0 right-0 text-[#0052CC]"
        >
          {words[currentWord]}
        </motion.span>
        <span className="invisible">Confidence</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] flex flex-col">
      {/* Enhanced Navigation with Decorative Elements */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black/95 backdrop-blur-md shadow-xl' 
            : 'bg-black/85'
        }`}
      >
        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          {/* Floating Circles */}
          <motion.div
            animate={{
              y: [0, -10, 0],
              x: [0, 5, 0],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-4 left-1/4 w-2 h-2 bg-[#0052CC]/30 rounded-full"
          />
          <motion.div
            animate={{
              y: [0, 10, 0],
              x: [0, -5, 0],
              rotate: [0, -180, -360]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute top-6 right-1/3 w-3 h-3 bg-[#0052CC]/20 rounded-full"
          />
          {/* Pulsing Stars */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-2 right-1/4"
          >
            <Sparkles className="w-4 h-4 text-[#0052CC]/40" />
          </motion.div>
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-8 left-1/3"
          >
            <Sparkles className="w-3 h-3 text-[#0052CC]/30" />
          </motion.div>
        </motion.div>

        <div className="container mx-auto px-6 h-16 flex justify-between items-center relative z-10">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div 
              className="w-10 h-10 bg-[#0052CC] rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
            <motion.h1 
              className="text-xl font-bold text-white"
              whileHover={{ x: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              iManager
            </motion.h1>
          </motion.div>

          <div className="flex items-center gap-6">
            {/* Pricing Dropdown */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToPricing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
              >
                <span>Pricing</span>
                <motion.div
                  animate={{ rotate: isPricingOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {isPricingOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl overflow-hidden"
                  >
                    {plans.map((plan) => (
                      <motion.div
                        key={plan.name}
                        whileHover={{ scale: 1.02, x: 5 }}
                        className="p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0"
                        onClick={() => {
                          setIsPricingOpen(false);
                          handleGetStarted(plan);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`${plan.name === 'PRO' ? 'text-3xl' : 'text-2xl'} font-bold text-[#172B4D]`}>{plan.name}</span>
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`${plan.name === 'PRO' ? 'text-5xl' : 'text-4xl'} font-bold text-[#0052CC]`}
                          >
                            ₹{plan.price}
                            <span className="text-base font-normal text-[#172B4D]">/month</span>
                          </motion.div>
                        </div>
                        <div className="text-sm text-slate-500 mt-1">per month</div>
                        {plan.popular && (
                          <div className="mt-2 inline-block px-2 py-1 bg-[#0052CC]/10 text-[#0052CC] text-xs rounded-full">
                            Most Popular
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Sign in
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/signup')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0052CC] rounded-lg hover:bg-[#0747A6] transition-colors flex items-center gap-2 group"
            >
              Get Started
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Enhanced Hero Section with Animated Elements */}
      <ScrollReveal type="fade-up" delay={200}>
        <div className="container mx-auto px-6 pt-24 pb-12 relative">
          {/* Decorative Background Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
          >
            {/* Floating Geometric Shapes */}
            <motion.div
              animate={{
                y: [0, -40, 0],
                x: [0, 20, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 15,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-20 left-1/4"
            >
              <Circle className="w-16 h-16 text-[#0052CC]/10" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 40, 0],
                x: [0, -20, 0],
                rotate: [0, -180, -360]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-40 right-1/3"
            >
              <Square className="w-14 h-14 text-[#0052CC]/10" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, -35, 0],
                x: [0, 25, 0],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-20 left-1/3"
            >
              <Triangle className="w-18 h-18 text-[#0052CC]/10" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
            className="max-w-5xl mx-auto text-center relative z-10"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Smart Project Management</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl font-bold text-[#172B4D] mb-8 leading-tight"
            >
              Manage Projects with{' '}
              <AnimatedWord />
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-1xl text-[#172B4D] mb-12 leading-relaxed max-w-2xl mx-auto"
            >
              The simplest way to organize, track, and complete your projects
            </motion.p>

            {/* Stats Bar with Floating Animation */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              {[
                { number: '10k+', label: 'Active Users', icon: <Users className="w-6 h-6 text-[#0052CC]" /> },
                { number: '99.9%', label: 'Uptime', icon: <Shield className="w-6 h-6 text-[#0052CC]" /> },
                { number: '24/7', label: 'Support', icon: <MessageSquare className="w-6 h-6 text-[#0052CC]" /> }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="text-center p-4 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <motion.div
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                    className="flex items-center justify-center gap-3 mb-2"
                  >
                    {stat.icon}
                    <span className="text-3xl font-bold text-[#0052CC]">{stat.number}</span>
                  </motion.div>
                  <div className="text-sm text-[#172B4D] font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </ScrollReveal>

      {/* Integrations Section */}
      <ScrollReveal type="fade-left" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <GitBranch className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white text-sm font-medium">Native GitHub Integration</span>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-left"
              >
                <h3 className="text-3xl font-bold text-[#172B4D]">Powerful GitHub Integration</h3>
                <p className="text-lg text-[#172B4D]">Connect your repositories and manage your development workflow seamlessly</p>
                <ul className="space-y-4">
                  {integrations[0].features.map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-full bg-[#171B21] flex items-center justify-center"
                      >
                        <GitBranch className="w-4 h-4 text-white" />
                      </motion.div>
                      <span className="text-[#172B4D] font-medium">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.img 
                  src="https://github.githubassets.com/images/modules/site/home-campaign/illu-actions.png" 
                  alt="GitHub Integration" 
                  className="w-full rounded-lg shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <GitBranch className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* App Info Section */}
      <ScrollReveal type="fade-right" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <PenTool className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white text-sm font-medium">Smart Task Management</span>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-left order-1 md:order-2"
              >
                <h3 className="text-3xl font-bold text-[#172B4D]">Streamline Your Workflow</h3>
                <p className="text-lg text-[#172B4D]">Organize tasks, track progress, and achieve goals with our intuitive task management system</p>
                <ul className="space-y-4">
                  {[
                    'Intuitive Kanban Boards',
                    'Custom Task Templates',
                    'Automated Workflows'
                  ].map((feature, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-full bg-[#171B21] flex items-center justify-center"
                      >
                        <PenTool className="w-4 h-4 text-white" />
                      </motion.div>
                      <span className="text-[#172B4D] font-medium">{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative order-2 md:order-1"
              >
                <motion.img 
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&q=80" 
                  alt="Task Management" 
                  className="w-full rounded-lg shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <PenTool className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Pricing Section with Dramatic Animations */}
      <ScrollReveal type="fade-up" delay={200} staggerChildren>
        <div id="pricing-section" className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: 5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <Shield className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Flexible Plans</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.4 }}
              className="text-3xl font-bold text-[#172B4D] mb-14"
            >
              Choose Your <span className="text-[#0052CC]">Perfect Plan</span>
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className={`relative bg-white rounded-lg p-8 border border-slate-200 hover:border-[#0052CC]/50 transition-all duration-200 ${
                    plan.popular ? 'shadow-xl' : 'shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                      className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    >
                      <div className="bg-[#171B21] text-white text-sm px-4 py-1 rounded-full shadow-lg">
                        Most Popular
                      </div>
                    </motion.div>
                  )}
                  <div className="flex flex-col h-full">
                    <div className="text-center">
                      <h3 className={`${plan.name === 'PRO' ? 'text-3xl' : 'text-2xl'} font-bold text-[#172B4D] mb-2`}>{plan.name}</h3>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`${plan.name === 'PRO' ? 'text-5xl' : 'text-4xl'} font-bold text-[#0052CC] mb-6`}
                      >
                        ₹{plan.price}
                        <span className="text-base font-normal text-[#172B4D]">/month</span>
                      </motion.div>
                    </div>
                    <ul className="space-y-4 mb-8 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <motion.li
                          key={feature}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3, delay: idx * 0.1 }}
                          className="flex items-center gap-3"
                        >
                          <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                            className="w-6 h-6 rounded-full bg-[#DEEBFF] flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-4 h-4 text-[#0052CC]" />
                          </motion.div>
                          <span className="text-sm text-[#172B4D]">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleGetStarted(plan)}
                      className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                        plan.popular
                          ? 'bg-[#171B21] text-white hover:bg-[#0052CC]'
                          : 'bg-[#DEEBFF] text-[#0052CC] hover:bg-[#0052CC] hover:text-white'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Feature Preview */}
      <ScrollReveal type="zoom-in" delay={200}>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <Layout className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-white text-sm font-medium">Dashboard Preview</span>
            </motion.div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="space-y-6 text-left"
              >
                <h3 className="text-3xl font-bold text-[#172B4D]">Beautiful & Intuitive Interface</h3>
                <p className="text-lg text-[#172B4D]">Experience a clean, modern dashboard designed for maximum productivity</p>
                <motion.button 
                  onClick={() => setIsDemoOpen(true)} 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#171B21] text-white rounded-lg hover:bg-[#0052CC] transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Watch Demo
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <motion.img 
                  src={DASHBOARD_PREVIEW} 
                  alt="iManager Dashboard" 
                  className="w-full rounded-lg shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  onError={handleImageError}
                />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#171B21] rounded-2xl flex items-center justify-center transform rotate-6"
                >
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    <Layout className="w-12 h-12 text-white" />
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Features Section with Dramatic Animations */}
      <ScrollReveal type="fade-up" delay={200} staggerChildren>
        <div className="container mx-auto px-6 py-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20, rotate: -5 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8"
            >
              <Zap className="w-5 h-5 text-white" />
              <span className="text-white text-sm font-medium">Why Choose Us</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, type: "spring", bounce: 0.4 }}
              className="text-3xl font-bold text-[#172B4D] mb-14"
            >
              Features you'll <span className="text-[#0052CC]">love</span>
            </motion.h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1, type: "spring", bounce: 0.4 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  className="group p-8 rounded-lg bg-white border border-slate-200 hover:border-[#0052CC]/50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 rounded-xl bg-[#171B21] flex items-center justify-center mb-6"
                  >
                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#172B4D] mb-3">{feature.title}</h3>
                  <p className="text-[#172B4D] mb-4">{feature.description}</p>
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#DEEBFF] rounded-full"
                  >
                    <span className="text-[#0052CC] text-sm font-medium">{feature.stats}</span>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* Management Stats Section */}
      <ScrollReveal type="fade-up" delay={200}>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {managementStats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}
                    >
                      {stat.icon}
                    </motion.div>
                    <div>
                      <div className="text-2xl font-bold text-[#172B4D]">{stat.value}</div>
                      <div className="text-sm text-slate-500">{stat.label}</div>
                    </div>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className={`h-full ${stat.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.value }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* Management Features Section */}
      <ScrollReveal type="fade-up" delay={200}>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              {managementFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 bg-[#171B21] rounded-xl flex items-center justify-center mb-4"
                  >
                    {React.cloneElement(feature.icon, { className: "w-6 h-6 text-white" })}
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#172B4D] mb-2">{feature.title}</h3>
                  <p className="text-slate-600 mb-4">{feature.description}</p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-[#DEEBFF] rounded-full"
                  >
                    <span className="text-[#0052CC] text-sm font-medium">{feature.stats}</span>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </ScrollReveal>

      {/* Animated Task Management Preview */}
      <ScrollReveal type="fade-up" delay={200}>
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 shadow-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-3xl font-bold text-[#172B4D]">Task Management Dashboard</h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-[#0052CC] text-white rounded-lg hover:bg-[#0747A6] transition-colors"
              >
                View All Tasks
              </motion.button>
            </motion.div>

            <div className="space-y-4">
              {[
                { title: "Project Setup", progress: 75, color: "bg-blue-500" },
                { title: "Team Onboarding", progress: 90, color: "bg-green-500" },
                { title: "Documentation", progress: 60, color: "bg-yellow-500" },
                { title: "Testing Phase", progress: 45, color: "bg-red-500" }
              ].map((task, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-[#172B4D]">{task.title}</span>
                    <span className="text-sm text-slate-500">{task.progress}%</span>
                  </div>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-2 bg-slate-100 rounded-full overflow-hidden"
                  >
                    <motion.div
                      className={`h-full ${task.color}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${task.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: index * 0.2 }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollReveal>

      {isDemoOpen && <DemoModal />}

      {/* Footer */}
      <footer className="bg-[#000000] text-white/80 py-24 opacity-90 mt-auto">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="border-t border-white/10 pt-8 text-center">
              <p className="text-white/60">@2025 iManager. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}