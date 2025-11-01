import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SearchBar from "../search/SearchBar";
import {
  FiMenu,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHelpCircle,
} from "react-icons/fi";

/**
 * Header component with logo, search bar, and user menu
 * @param {Object} props - Component props
 * @param {Function} props.onMenuClick - Callback for hamburger menu click
 * @param {Function} props.onSearch - Callback for search
 * @param {Function} props.onShowKeyboardShortcuts - Callback to show keyboard shortcuts help
 */
const Header = ({ onMenuClick, onSearch, onShowKeyboardShortcuts }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleSearch = (query) => {
    // Navigate to search page with query
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section: Hamburger menu and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            <FiMenu className="w-6 h-6 text-gray-600" />
          </button>

          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">{"</>"}</span>
            </div>
            <span className="hidden sm:block text-xl font-bold text-gray-900">
              Snippet Manager
            </span>
          </Link>
        </div>

        {/* Center section: Search bar (hidden on mobile) */}
        <div className="hidden md:block flex-1 max-w-2xl mx-4">
          <SearchBar onSearch={handleSearch} placeholder="Search snippets..." />
        </div>

        {/* Right section: Help and User menu */}
        <div className="flex items-center gap-2">
          {/* Keyboard shortcuts help button */}
          {onShowKeyboardShortcuts && (
            <button
              onClick={onShowKeyboardShortcuts}
              className="p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts (Ctrl+/)"
            >
              <FiHelpCircle className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="User menu"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="hidden sm:block text-sm font-medium text-gray-700">
                {user?.displayName || user?.email?.split("@")[0]}
              </span>
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.displayName || "User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <FiSettings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FiLogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar onSearch={handleSearch} placeholder="Search snippets..." />
      </div>
    </header>
  );
};

export default Header;
