import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useUser } from '../context/userContext';
import ScrollReveal from '../components/ScrollReveal';

const API_MAIN_URL = import.meta.env.VITE_IMANAGER_MAIN_API;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const payload = {
      username: formData.email,
      password: formData.password
    };

    try {
      const response = await axios.post<Record<string, any>>(
        `${API_MAIN_URL}/api/v1/org/login`,
        payload,
            { // Ensure cookies and credentials are sent
      headers: {
        'Content-Type': 'application/json',  // Make sure the content type is correct
            }
          }  
      );

      const token = response.data['token'];
      const userData = response.data['data'];

      if (!token || !userData) {
        throw new Error('Invalid response');
      }

      localStorage.setItem('token', token);
      setUser(userData);

      toast.success('Login successful!');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-[#DEEBFF] to-white -z-0" />
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-bl from-[#0052CC]/20 to-[#0065FF]/20 rounded-full blur-3xl " />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-[#0052CC]/20 to-[#0747A6]/20 rounded-full blur-3xl " />

      {/* Center Decoration */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-96 h-96 rounded-full border-[16px] border-[#0052CC]/5 animate-[spin_60s_linear_infinite]" />
        <div className="absolute inset-0 w-96 h-96 rounded-full border-[16px] border-[#0052CC]/5 animate-[spin_40s_linear_infinite_reverse]" />
      </div>

      {/* Interactive Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden z-10">
        {/* Activity Card */}
        <ScrollReveal type="fade-left" delay={300}>
          <div className="absolute -top-8 -left-8 w-64 h-40 bg-white/95 rounded-2xl shadow-lg transform -rotate-12 hover:-rotate-6 transition-transform duration-300 hover:shadow-xl group cursor-pointer">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-[#0052CC] text-white flex items-center justify-center text-sm font-medium">
                  A
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-[#0052CC]/20 rounded w-24 group-hover:bg-[#0052CC]/30 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="w-8 h-8 rounded bg-[#0052CC]/10 group-hover:bg-[#0052CC]/20 transition-colors" />
                  <div className="w-8 h-8 rounded bg-[#0052CC]/10 group-hover:bg-[#0052CC]/20 transition-colors" />
                  <div className="w-8 h-8 rounded bg-[#0052CC]/10 group-hover:bg-[#0052CC]/20 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Task Card */}
        <ScrollReveal type="fade-right" delay={500}>
          <div className="absolute top-32 -right-4 w-56 h-32 bg-white/95 rounded-2xl shadow-lg transform rotate-6 hover:rotate-12 transition-transform duration-300 hover:shadow-xl group cursor-pointer">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-green-500" />
                </div>
                <div className="text-xs font-medium text-[#172B4D]">In Progress</div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-[#0052CC]/10 rounded w-full group-hover:bg-[#0052CC]/20 transition-colors" />
                <div className="h-2 bg-[#0052CC]/10 rounded w-2/3 group-hover:bg-[#0052CC]/20 transition-colors" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Chart Card */}
        <ScrollReveal type="fade-up" delay={700}>
          <div className="absolute -bottom-8 -right-8 w-72 h-48 bg-white/95 rounded-2xl shadow-lg transform rotate-12 hover:rotate-6 transition-transform duration-300 hover:shadow-xl group cursor-pointer">
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[#0052CC] text-white flex items-center justify-center font-medium">
                  <span className="text-sm">Q4</span>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-[#0052CC]/20 rounded w-24 mb-2 group-hover:bg-[#0052CC]/30 transition-colors" />
                  <div className="h-2 bg-[#0052CC]/10 rounded w-16 group-hover:bg-[#0052CC]/20 transition-colors" />
                </div>
              </div>
              <div className="flex items-end justify-between h-16 mt-4">
                {[40, 70, 45, 90, 65].map((height, i) => (
                  <div 
                    key={i}
                    style={{ height: `${height}%` }}
                    className="w-8 rounded-t-lg bg-[#0052CC]/20 group-hover:bg-[#0052CC]/30 transition-all duration-300 hover:bg-[#0052CC]/40"
                  />
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="container mx-auto min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-20">
        <ScrollReveal type="zoom-in" delay={200}>
          <div className="w-[500px] h-[500px] space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#171B21] rounded-full mb-8">
                <span className="text-white text-sm font-medium">Welcome Back</span>
              </div>
              <h2 className="text-3xl font-bold text-[#172B4D] mb-3">
                Sign in into your account
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <label htmlFor="email-address" className="block text-sm font-medium text-[#172B4D] mb-1">
                      Email address
                    </label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#172B4D] mb-1">
                      Password
                    </label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-lg font-medium text-white bg-[#171B21] hover:bg-[#0052CC] transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>
            </div>

            <div className="text-center">
              <p className="text-[#172B4D]">
                Don't have an account?{' '}
                <button
                  onClick={() => navigate('/signup')}
                  className="font-medium text-[#0052CC] hover:text-[#0747A6] transition-colors"
                >
                  Sign up
                </button>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
