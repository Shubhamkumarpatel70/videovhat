import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const ConnectionStatus = ({ status, reconnectAttempts, isConnected }) => {
  const statusConfig = {
    connected: {
      icon: CheckCircle2,
      text: 'Connected to server',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30'
    },
    connecting: {
      icon: RefreshCw,
      text: 'Connecting to server...',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30'
    },
    reconnecting: {
      icon: RefreshCw,
      text: `Reconnecting... (${reconnectAttempts})`,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30'
    },
    disconnected: {
      icon: WifiOff,
      text: 'Disconnected from server',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    error: {
      icon: AlertCircle,
      text: 'Connection error',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    },
    failed: {
      icon: AlertCircle,
      text: 'Connection failed',
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30'
    }
  };

  const config = statusConfig[status] || statusConfig.disconnected;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {!isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-xl border ${config.bgColor} ${config.borderColor} ${config.color} shadow-2xl`}>
            <motion.div
              animate={status === 'connecting' || status === 'reconnecting' ? { rotate: 360 } : {}}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Icon size={20} />
            </motion.div>
            <span className="font-medium text-sm">{config.text}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConnectionStatus;