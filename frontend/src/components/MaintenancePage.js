import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import toast from 'react-hot-toast';

const MaintenancePage = ({ maintenance, isAdmin = false, onUpdate }) => {
  // admin form state
  const [mode, setMode] = useState('off'); // 'off' | 'immediate' | 'scheduled'
  const [message, setMessage] = useState('');
  const [scheduledFrom, setScheduledFrom] = useState('');
  const [scheduledTo, setScheduledTo] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // initialize admin form from incoming maintenance prop
  useEffect(() => {
    if (maintenance) {
      const hasSchedule = maintenance.scheduledFrom && maintenance.scheduledTo;
      setMode(hasSchedule ? 'scheduled' : (maintenance?.active ? 'immediate' : 'off'));
      setMessage(maintenance.message || '');
      setScheduledFrom(maintenance.scheduledFrom ? toLocalInputValue(maintenance.scheduledFrom) : '');
      setScheduledTo(maintenance.scheduledTo ? toLocalInputValue(maintenance.scheduledTo) : '');
    } else {
      setMode('off');
      setMessage('');
      setScheduledFrom('');
      setScheduledTo('');
    }
  }, [maintenance]);

  const toLocalInputValue = (iso) => {
    try {
      const d = new Date(iso);
      const tzOffset = d.getTimezoneOffset() * 60000;
      const local = new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
      return local;
    } catch {
      return '';
    }
  };

  const fromLocalInputValue = (localValue) => {
    if (!localValue) return null;
    // treat input as local datetime and convert to ISO
    const iso = new Date(localValue).toISOString();
    return iso;
  };

  const handleSave = async () => {
    setError('');
    if (mode === 'scheduled') {
      if (!scheduledFrom || !scheduledTo) {
        setError('Please provide both start and end times for scheduled maintenance.');
        return;
      }
      if (new Date(scheduledFrom) >= new Date(scheduledTo)) {
        setError('Start time must be before end time.');
        return;
      }
    }

    const payload = {
      active: mode !== 'off',
      message: message || 'We are currently performing maintenance. Please check back later.',
      scheduledFrom: mode === 'scheduled' ? fromLocalInputValue(scheduledFrom) : null,
      scheduledTo: mode === 'scheduled' ? fromLocalInputValue(scheduledTo) : null,
      mode
    };

    setSaving(true);
    try {
      if (typeof onUpdate === 'function') {
        const res = onUpdate(payload);
        if (res && typeof res.then === 'function') {
          await res;
        }
      }
      toast.success('Maintenance settings updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update maintenance settings');
      setError('Failed to update maintenance settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMode(maintenance ? (maintenance.scheduledFrom && maintenance.scheduledTo ? 'scheduled' : (maintenance?.active ? 'immediate' : 'off')) : 'off');
    setMessage(maintenance?.message || '');
    setScheduledFrom(maintenance?.scheduledFrom ? toLocalInputValue(maintenance.scheduledFrom) : '');
    setScheduledTo(maintenance?.scheduledTo ? toLocalInputValue(maintenance.scheduledTo) : '');
    setError('');
  };

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
          <p className="text-gray-600">{maintenance?.message || 'We are currently performing maintenance. Please check back later.'}</p>
        </div>

        {maintenance?.scheduledFrom && maintenance?.scheduledTo && (
          <div className="text-sm text-gray-500">
            <p>Scheduled: {new Date(maintenance.scheduledFrom).toLocaleString()} - {new Date(maintenance.scheduledTo).toLocaleString()}</p>
          </div>
        )}

        <div className="mt-6 text-xs text-gray-400">
          <p>We apologize for any inconvenience.</p>
        </div>
      </motion.div>

      {/* Admin Controls */}
      {isAdmin && (
        <motion.div
          className="max-w-2xl w-full bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold mb-4">Maintenance Settings (Admin)</h3>

          <div className="flex gap-3 mb-3">
            <label className={`px-3 py-2 rounded-2xl cursor-pointer ${mode==='off' ? 'bg-gray-200' : 'bg-white border'}`}>
              <input type="radio" name="mode" value="off" checked={mode==='off'} onChange={() => setMode('off')} className="hidden" />
              Off
            </label>
            <label className={`px-3 py-2 rounded-2xl cursor-pointer ${mode==='immediate' ? 'bg-orange-100' : 'bg-white border'}`}>
              <input type="radio" name="mode" value="immediate" checked={mode==='immediate'} onChange={() => setMode('immediate')} className="hidden" />
              Immediate Maintenance
            </label>
            <label className={`px-3 py-2 rounded-2xl cursor-pointer ${mode==='scheduled' ? 'bg-purple-100' : 'bg-white border'}`}>
              <input type="radio" name="mode" value="scheduled" checked={mode==='scheduled'} onChange={() => setMode('scheduled')} className="hidden" />
              Scheduled
            </label>
          </div>

          <div className="mb-3">
            <label className="block text-sm text-gray-600 mb-1">Message</label>
            <input value={message} onChange={(e) => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Maintenance message shown to users" />
          </div>

          {mode === 'scheduled' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">From</label>
                <input type="datetime-local" value={scheduledFrom} onChange={(e) => setScheduledFrom(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">To</label>
                <input type="datetime-local" value={scheduledTo} onChange={(e) => setScheduledTo(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

          <div className="flex gap-3 justify-end">
            <button onClick={handleReset} className="px-4 py-2 rounded-2xl border hover:bg-gray-50">Reset</button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-2xl text-white ${saving ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MaintenancePage;
