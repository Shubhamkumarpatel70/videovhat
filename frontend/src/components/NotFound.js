import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, FileX } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <FileX size={48} className="text-blue-600" />
        </motion.div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
          <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <motion.button
            onClick={handleGoHome}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <Home size={20} />
            Go to Homepage
          </motion.button>

          <motion.button
            onClick={handleGoBack}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            Go Back
          </motion.button>
        </div>

        {/* Search Suggestion */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-2">
            <Search size={16} />
            <span className="text-sm font-medium">What were you looking for?</span>
          </div>
          <p className="text-xs text-gray-400">
            Try checking the URL for typos or use the navigation menu above.
          </p>
        </div>

        {/* Popular Links */}
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Popular Pages:</h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => navigate('/')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200"
            >
              <div className="text-sm font-medium text-gray-900">Home</div>
              <div className="text-xs text-gray-500">Landing page</div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/about')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200"
            >
              <div className="text-sm font-medium text-gray-900">About</div>
              <div className="text-xs text-gray-500">Learn more</div>
            </motion.button>

            <motion.button
              onClick={() => navigate('/support')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200"
            >
              <div className="text-sm font-medium text-gray-900">Support</div>
              <div className="text-xs text-gray-500">Get help</div>
            </motion.button>

            {/* <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors duration-200"
            >
              <div className="text-sm font-medium text-gray-900">Login</div>
              <div className="text-xs text-gray-500">Sign in</div>
            </motion.button> */}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
