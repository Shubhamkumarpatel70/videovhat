import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';

const NoInternet = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      // Try to fetch a small resource to verify connection
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      setIsOnline(response.ok);
    } catch (error) {
      setIsOnline(false);
    }
    setIsChecking(false);
  };

  const handleRetry = () => {
    checkConnection();
  };

  if (isOnline) {
    // If connection is restored, this component might be unmounted
    // but we can show a success message briefly
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1 }}
            className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Wifi size={32} className="text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Restored!</h2>
          <p className="text-gray-600">You're back online. Refreshing...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center"
      >
        {/* Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <WifiOff size={40} className="text-red-500" />
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          No Internet Connection
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-6 leading-relaxed">
          It looks like you're offline. Please check your internet connection and try again.
        </p>

        {/* Connection Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <AlertTriangle size={16} />
            <span className="text-sm">Connection Status: Offline</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <motion.button
            onClick={handleRetry}
            disabled={isChecking}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors duration-200"
          >
            {isChecking ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <RefreshCw size={20} />
              </motion.div>
            ) : (
              <RefreshCw size={20} />
            )}
            {isChecking ? 'Checking...' : 'Try Again'}
          </motion.button>

          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold transition-colors duration-200"
          >
            Refresh Page
          </button>
        </div>

        {/* Tips */}
        <div className="mt-8 text-left">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Troubleshooting Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li>• Check your Wi-Fi or mobile data connection</li>
            <li>• Try switching between Wi-Fi and mobile data</li>
            <li>• Restart your router or device</li>
            <li>• Contact your internet service provider</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NoInternet;
