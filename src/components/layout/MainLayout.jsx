import { useState, useMemo } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import useKeyboard from "../../hooks/useKeyboard";
import { KeyboardShortcutsHelp } from "../shared";

/**
 * MainLayout component with header, sidebar, and content area
 * Provides responsive layout with collapsible sidebar for tablet/mobile
 * @param {Object} props - Component props
 * @param {Function} props.onSearch - Optional search callback
 */
const MainLayout = ({ onSearch }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleSearch = (query, filters) => {
    if (onSearch) {
      onSearch(query, filters);
    }
  };

  // Global keyboard shortcuts - memoize to prevent infinite loops
  const keyboardShortcuts = useMemo(
    () => ({
      "ctrl+n": () => {
        // Navigate to create new snippet
        navigate("/snippets/new");
      },
      "ctrl+/": () => {
        // Toggle keyboard shortcuts help
        setShowShortcutsHelp((prev) => !prev);
      },
    }),
    [navigate]
  );

  useKeyboard(keyboardShortcuts);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header
        onMenuClick={handleMenuClick}
        onSearch={handleSearch}
        onShowKeyboardShortcuts={() => setShowShortcutsHelp(true)}
      />

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
      />
    </div>
  );
};

export default MainLayout;
