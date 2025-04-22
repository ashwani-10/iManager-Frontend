import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Make sure axios is installed
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollReveal from '../components/ScrollReveal';

const API_MAIN_URL = import.meta.env.VITE_IMANAGER_MAIN_API;

interface Payload {
  name: string;
  email: string;
  password: string;
  subscription: string;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
}

export default function SignupPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPlan = location.state?.selectedPlan || 'BASIC';

  // Add plan prices
  const planPrices = {
    BASIC: 800,
    PRO: 1500,
    PREMIUM: 3000
  };

  const [formData, setFormData] = useState({
    orgName: '',
    email: '',
    password: '',
    plan: selectedPlan,
    planPrice: planPrices[selectedPlan as keyof typeof planPrices]
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
    document.body.removeChild(script);
    };
}, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const payload: Payload = {
      name: formData.orgName,
      email: formData.email,
      password: formData.password,
      subscription: formData.plan,
    };

    try {
      const response = await axios.post(`${API_MAIN_URL}/api/v1/org/registration?amount=${formData.planPrice}&currency=INR`, payload);

      const order = response.data;
      
      if (!order.id) {
        toast.error("Error: no Order Id")
        return;
      }

      const paymentDescription = `Subscription Plan: ${formData.plan}`;

      const options = {
        key: "rzp_test_M5M2X3c0ahOpJl",
        amount: order.amount,
        currency: order.currency,
        name: "iManager",
        description: paymentDescription,
        order_id: order.id,
        handler: function (response: RazorpayResponse) {
          toast.success(`Payment Successful for ${formData.plan}! Payment ID: ${response.razorpay_payment_id}`);
          navigate("/");
        },
        theme: {
          color: "#3399cc"
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to sign up. Please try again.');
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

      {/* Decorative App Elements */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {/* Top Left Card */}
        <ScrollReveal type="fade-left" delay={300}>
          <div className="absolute -top-8 -left-8 w-64 h-40 bg-white/80 rounded-2xl shadow-xl transform -rotate-12">
            <div className="p-4">
              <div className="w-1/2 h-2 bg-[#0052CC]/20 rounded mb-2" />
              <div className="w-3/4 h-2 bg-[#0052CC]/10 rounded mb-4" />
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded bg-[#0052CC]/10" />
                <div className="w-8 h-8 rounded bg-[#0052CC]/10" />
                <div className="w-8 h-8 rounded bg-[#0052CC]/10" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Right Card */}
        <ScrollReveal type="fade-right" delay={500}>
          <div className="absolute -bottom-8 -right-8 w-72 h-48 bg-white/80 rounded-2xl shadow-xl transform rotate-12">
            <div className="p-4">
              <div className="flex gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#0052CC]/10" />
                <div className="flex-1">
                  <div className="w-1/2 h-2 bg-[#0052CC]/20 rounded mb-2" />
                  <div className="w-3/4 h-2 bg-[#0052CC]/10 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-[#0052CC]/10 rounded" />
                <div className="w-2/3 h-2 bg-[#0052CC]/10 rounded" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Center Decoration */}
        <ScrollReveal type="zoom-in" delay={700}>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-96 h-96 rounded-full border-[16px] border-[#0052CC]/5 animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-0 w-96 h-96 rounded-full border-[16px] border-[#0052CC]/5 animate-[spin_40s_linear_infinite_reverse]" />
          </div>
        </ScrollReveal>
      </div>

      <div className="container mx-auto min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal type="fade-up" delay={200}>
          <div className="w-[600px] h-[700px] space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-[#172B4D] mb-3">
                Start your journey
              </h2>
              <p className="text-[#172B4D] mb-2">
                Selected Plan: <span className="font-semibold">{formData.plan}</span>
                <span className="mx-2">·</span>
                <span className="text-[#0052CC] font-semibold">₹{formData.planPrice}/month</span>
              </p>
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-lg p-12 border border-slate-200 h-[500px]">
              <form className="space-y-8 h-full" onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Organization Name Input */}
                  <div>
                    <label htmlFor="org-name" className="block text-sm font-medium text-[#172B4D] mb-1">
                      Organization Name
                    </label>
                    <input
                      id="org-name"
                      name="orgName"
                      type="text"
                      required
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                      placeholder="Your Organization"
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    />
                  </div>

                  {/* Email Input */}
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

                  {/* Password Input */}
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

                  {/* Plan Selection */}
                  <div>
                    <label htmlFor="plan" className="block text-sm font-medium text-[#172B4D] mb-1">
                      Selected Plan
                    </label>
                    <select
                      id="plan"
                      name="plan"
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0052CC] focus:border-transparent transition-all"
                      value={formData.plan}
                      onChange={(e) => setFormData({
                        ...formData,
                        plan: e.target.value,
                        planPrice: planPrices[e.target.value as keyof typeof planPrices]
                      })}
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                      <option value="PREMIUM">Premium</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
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
                      Creating account...
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </form>
            </div>

            <div className="text-center">
              <p className="text-[#172B4D]">
                Already have an account?{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-medium text-[#0052CC] hover:text-[#0747A6] transition-colors"
                >
                  Log in
                </button>
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
