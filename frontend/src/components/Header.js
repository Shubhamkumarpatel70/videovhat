import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Menu, Shield, X, HelpCircle } from 'lucide-react';

const Header = ({ user, onLogout, onAdminLogin, className = '' }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleAdminClick = () => {
    if (typeof onAdminLogin === 'function') {
      onAdminLogin();
    } else {
      navigate('/admin/login');
    }
  };

  const handleAboutClick = () => {
    navigate('/about');
  };

  // Navigate to support/help page
  const handleSupportClick = () => {
    navigate('/support');
  };

  return (
    <header className={`w-full bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-all duration-300 shadow-sm ${className}`}>
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate('/')}
          className="cursor-pointer inline-flex items-center gap-2 transition-transform duration-200 hover:scale-105"
          title="Home"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow duration-200">
            <Video size={18} />
          </div>
          <div className="hidden sm:block">
            <div className="text-gray-900 font-bold text-lg">VideoChat</div>
            <div className="text-xs text-gray-600">Connect instantly</div>
          </div>
        </div>
      </div>

      <nav className="flex items-center gap-3">
        {user ? (
          <>
            <button
              onClick={() => navigate('/waiting')}
              className="btn-ghost-dark hidden sm:inline-flex transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="Find a Match"
            >
              Find a Match
            </button>

            <button
              onClick={handleSupportClick}
              className="btn-ghost-dark hidden sm:inline-flex items-center gap-2 transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="Help and Support"
            >
              <HelpCircle size={16} className="text-gray-700" />
              Help & Support
            </button>

            <button
              onClick={onLogout}
              className="btn-ghost-dark hidden md:inline-flex transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="Logout"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleAdminClick}
              className="btn-ghost-dark hidden md:inline-flex items-center gap-2 transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="Admin Login"
            >
              <Shield size={16} className="text-gray-700" />
              Admin Login
            </button>
            
            <button
              onClick={handleSupportClick}
              className="btn-ghost-dark hidden md:inline-flex items-center gap-2 transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="Help and Support"
            >
              <HelpCircle size={16} className="text-gray-700" />
              Help & Support
            </button>

            <button
              onClick={handleAboutClick}
              className="btn-ghost-dark hidden md:inline-flex transition-all duration-200 hover:bg-gray-100 hover:scale-105"
              aria-label="About"
            >
              About
            </button>
          </>
        )}

        <button
          onClick={toggleMenu}
          className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center sm:hidden transition-all duration-200 hover:bg-gray-200 hover:scale-105"
          title="Menu"
          aria-label="Toggle Menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 sm:hidden z-50 shadow-lg">
          <div className="px-4 py-4 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => { navigate('/waiting'); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left transition-all duration-200 hover:bg-gray-100"
                  aria-label="Find a Match"
                >
                  Find a Match
                </button>
                <button
                  onClick={() => { handleSupportClick(); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left items-center gap-2 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Help and Support"
                >
                  <HelpCircle size={16} className="inline mr-2" />
                  Help & Support
                </button>
                <button
                  onClick={() => { onLogout(); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left transition-all duration-200 hover:bg-gray-100"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { handleAdminClick(); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left items-center gap-2 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Admin Login"
                >
                  <Shield size={16} className="text-gray-700" />
                  Admin Login
                </button>
                <button
                  onClick={() => { handleSupportClick(); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left items-center gap-2 transition-all duration-200 hover:bg-gray-100"
                  aria-label="Help and Support"
                >
                  <HelpCircle size={16} className="inline mr-2" />
                  Help & Support
                </button>
                <button
                  onClick={() => { handleAboutClick(); setIsMenuOpen(false); }}
                  className="btn-ghost-dark text-left transition-all duration-200 hover:bg-gray-100"
                  aria-label="About"
                >
                  About
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
