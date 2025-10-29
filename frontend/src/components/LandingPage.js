import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Users, Globe, Shield, Wifi, WifiOff, ArrowRight, ArrowLeft, MessageSquare, Eye, Headphones, Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LandingPage = ({ onUserJoin, isConnected, user, onAdminLogin }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', country: '', gender: '' });
  const [otpData, setOtpData] = useState({ email: '', otp: '' });
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [maintenance, setMaintenance] = useState(null);

  const handleRegisterInput = (e) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoginInput = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpInput = (e) => {
    const { name, value } = e.target;
    setOtpData(prev => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setShowOtpForm(true);
        setOtpData({ email: registerData.email, otp: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(otpData)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setShowOtpForm(false);
        setActiveTab('login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch testimonials on component mount
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';
        const response = await fetch(`${API}/api/testimonials`);
        if (response.ok) {
          const data = await response.json();
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      }
    };

    fetchTestimonials();
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length > 0) {
      const interval = setInterval(() => {
        setCurrentTestimonialIndex((prevIndex) =>
          prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change testimonial every 5 seconds

      return () => clearInterval(interval);
    }
  }, [testimonials]);

  // Fetch maintenance status on component mount
  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';
        const response = await fetch(`${API}/api/maintenance`);
        if (response.ok) {
          const data = await response.json();
          setMaintenance(data);
        }
      } catch (error) {
        console.error('Failed to fetch maintenance status:', error);
      }
    };

    fetchMaintenance();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:10000';
      const response = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();
      if (response.ok) {
        // If server indicates this user is an admin, store admin token/user and redirect to admin dashboard
        const isAdmin = data.user && (data.user.role?.toString().toLowerCase() === 'admin' || data.user.isAdmin === true);

        if (isAdmin) {
          // Save admin token/user and notify App via onAdminLogin if available
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          toast.success('Admin login successful');
          if (typeof onAdminLogin === 'function') onAdminLogin(data.user);
          navigate('/admin/dashboard');
        } else {
          // regular user flow
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          toast.success('Login successful');
          onUserJoin(data.user);
          navigate('/waiting');
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if maintenance mode is active
  if (maintenance && maintenance.isActive) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-gray-100">
        <motion.div
          className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones size={32} className="text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Under Maintenance</h1>
            <p className="text-gray-600">{maintenance.message || 'We are currently performing maintenance. Please check back later.'}</p>
          </div>

          {maintenance.scheduledFrom && maintenance.scheduledTo && (
            <div className="text-sm text-gray-500">
              <p>Scheduled: {new Date(maintenance.scheduledFrom).toLocaleString()} - {new Date(maintenance.scheduledTo).toLocaleString()}</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-8 bg-gray-100">
  <div className="max-w-7xl w-full mx-auto mt-6 flex flex-col lg:flex-row gap-8 lg:gap-16 items-center">
        {/* Left Section */}
        <motion.div
          className="text-gray-900 space-y-6 lg:space-y-8 flex-1"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-4 lg:space-y-6">
            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-600 leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Connect with the World
            </motion.h1>
            <motion.p
              className="text-lg sm:text-xl text-gray-700 leading-relaxed max-w-lg"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Experience seamless video conversations with people worldwide. Our platform offers
              crystal-clear HD video, instant messaging, and anonymous mode for privacy. Join thousands
              of users building connections across cultures and continents.
            </motion.p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Video size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">HD Video Chat</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">Real-time Chat</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Eye size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">Anonymous Mode</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Headphones size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">24/7 Support</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">Global Community</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield size={20} className="text-blue-600" />
              </div>
              <span className="font-medium">Safe & Secure</span>
            </div>
          </motion.div>

          {/* Testimonials Section */}
          <motion.div
            className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            {testimonials.length > 0 ? (
              <div className="text-center">
                <p className="text-gray-700 italic mb-2">"{testimonials[currentTestimonialIndex].text}"</p>
                <p className="text-gray-500 text-sm">- {testimonials[currentTestimonialIndex].author}{testimonials[currentTestimonialIndex].location ? `, ${testimonials[currentTestimonialIndex].location}` : ''}</p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-700 italic mb-2">"Amazing platform! Connected with people from 15 different countries in one week."</p>
                <p className="text-gray-500 text-sm">- Sarah, New York</p>
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div className="bg-white max-w-md mx-auto w-full lg:w-1/3 rounded-2xl shadow-lg border border-gray-200" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.3 }}>
          <div className="text-center mb-6 lg:mb-8 p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{user ? 'Join the Conversation' : 'Login or Register'}</h2>

            <div className={`flex items-center justify-center gap-2 text-sm mb-4 lg:mb-6 px-3 py-2 ${isConnected ? 'bg-white text-green-600' : 'bg-red-50 text-red-600'} border border-gray-200 shadow-sm rounded-[30px]`}>
              {isConnected ? (
                <>
                  <Wifi size={16} />
                  <span>Connected to Internet</span>
                </>
              ) : (
                <>
                  <WifiOff size={16} />
                  <span>Connecting...</span>
                </>
              )}
            </div>
          </div>

          {!user ? (
            <div className="space-y-4 lg:space-y-6 px-6 pb-6">
              {/* Tab Navigation */}
              {!showOtpForm && (
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Register
                  </button>
                </div>
              )}

              {/* OTP Verification Form */}
              {showOtpForm && (
                <motion.form onSubmit={handleVerifyOtp} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="text-center">
                    <Mail size={48} className="text-blue-500 mx-auto mb-4" />
                    <h3 className="text-gray-900 text-lg font-semibold mb-2">Verify Your Email</h3>
                    <p className="text-gray-600 text-sm mb-4">We've sent a 6-digit OTP to {otpData.email}</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="otp" className="text-gray-900 font-medium text-sm">Enter OTP</label>
                    <input id="otp" name="otp" value={otpData.otp} onChange={handleOtpInput} placeholder="123456" className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-2xl tracking-widest bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" maxLength="6" />
                  </div>

                  <motion.button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2">
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                    <CheckCircle size={16} />
                  </motion.button>

                  <button type="button" onClick={() => setShowOtpForm(false)} className="text-gray-500 text-sm hover:text-gray-700">Back to Register</button>
                </motion.form>
              )}

              {/* Login Tab */}
              {activeTab === 'login' && !showOtpForm && (
                <motion.form onSubmit={handleLogin} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="space-y-2">
                    <label htmlFor="loginEmail" className="text-gray-900 font-medium text-sm">Email</label>
                    <input id="loginEmail" name="email" value={loginData.email} onChange={handleLoginInput} placeholder="your@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="loginPassword" className="text-gray-900 font-medium text-sm">Password</label>
                    <input id="loginPassword" name="password" type="password" value={loginData.password} onChange={handleLoginInput} placeholder="Your password" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <motion.button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                    {isLoading ? 'Logging in...' : 'Login'}
                  </motion.button>
                </motion.form>
              )}

              {/* Register Tab */}
              {activeTab === 'register' && !showOtpForm && (
                <motion.form onSubmit={handleRegister} className="space-y-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                  <div className="space-y-2">
                    <label htmlFor="registerName" className="text-gray-900 font-medium text-sm">Name</label>
                    <input id="registerName" name="name" value={registerData.name} onChange={handleRegisterInput} placeholder="Your display name" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerEmail" className="text-gray-900 font-medium text-sm">Email</label>
                    <input id="registerEmail" name="email" type="email" value={registerData.email} onChange={handleRegisterInput} placeholder="your@email.com" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerPassword" className="text-gray-900 font-medium text-sm">Password</label>
                    <input id="registerPassword" name="password" type="password" value={registerData.password} onChange={handleRegisterInput} placeholder="Create a password" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerCountry" className="text-gray-900 font-medium text-sm">Country</label>
                    <input id="registerCountry" name="country" value={registerData.country} onChange={handleRegisterInput} placeholder="Your country" className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="registerGender" className="text-gray-900 font-medium text-sm">Gender</label>
                    <select id="registerGender" name="gender" value={registerData.gender} onChange={handleRegisterInput} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent" required>
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <motion.button type="submit" disabled={isLoading} className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                    {isLoading ? 'Registering...' : 'Register'}
                  </motion.button>
                </motion.form>
              )}

              <div className="text-xs text-gray-500">By registering you accept a lightweight demo flow (no backend).</div>
            </div>
          ) : (
            <div className="space-y-4 px-6 pb-6">
              <div className="text-gray-700">Logged in as <span className="font-semibold">{user.name}</span></div>
              <motion.button onClick={() => { onUserJoin(user); navigate('/waiting'); }} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors">
                Join the Conversation
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;
