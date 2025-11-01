import { createContext, useContext, useState, useEffect } from "react";
import userPreferencesService from "../services/userPreferencesService";
import { useAuth } from "./AuthContext";

const PreferencesContext = createContext(null);

/**
 * Custom hook to use the PreferencesContext
 * @returns {Object} Preferences context value
 */
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within a PreferencesProvider");
  }
  return context;
};

/**
 * PreferencesProvider component to manage user preferences globally
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const PreferencesProvider = ({ children }) => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState(
    userPreferencesService.getDefaultPreferences()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user preferences when user logs in
  useEffect(() => {
    const loadPreferences = async () => {
      if (user?.uid) {
        try {
          setLoading(true);
          setError(null);
          const userPrefs = await userPreferencesService.getUserPreferences(
            user.uid
          );
          setPreferences(userPrefs);
          applyTheme(userPrefs.theme);
        } catch (err) {
          console.error("Failed to load preferences:", err);
          setError(err.message);
          // Use default preferences on error
          const defaultPrefs = userPreferencesService.getDefaultPreferences();
          setPreferences(defaultPrefs);
          applyTheme(defaultPrefs.theme);
        } finally {
          setLoading(false);
        }
      } else {
        // User logged out, reset to defaults
        const defaultPrefs = userPreferencesService.getDefaultPreferences();
        setPreferences(defaultPrefs);
        applyTheme(defaultPrefs.theme);
        setLoading(false);
      }
    };

    loadPreferences();
  }, [user]);

  /**
   * Update user preferences
   * @param {Object} newPreferences - New preferences to save
   */
  const updatePreferences = async (newPreferences) => {
    if (!user?.uid) {
      throw new Error("User must be logged in to update preferences");
    }

    try {
      setError(null);
      await userPreferencesService.updateUserPreferences(
        user.uid,
        newPreferences
      );
      setPreferences(newPreferences);
      applyTheme(newPreferences.theme);
    } catch (err) {
      console.error("Failed to update preferences:", err);
      setError(err.message);
      throw err;
    }
  };

  /**
   * Apply theme to the document
   * @param {string} theme - Theme name ('light', 'dark', or 'system')
   */
  const applyTheme = (theme) => {
    const root = document.documentElement;
    console.log("Applying theme:", theme);

    if (theme === "dark") {
      root.classList.add("dark");
      console.log("Dark mode enabled, classes:", root.classList.toString());
    } else if (theme === "light") {
      root.classList.remove("dark");
      console.log("Light mode enabled, classes:", root.classList.toString());
    } else if (theme === "system") {
      // Use system preference
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      console.log("System preference:", prefersDark ? "dark" : "light");
      if (prefersDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      console.log("System mode applied, classes:", root.classList.toString());
    }
  };

  const value = {
    preferences,
    loading,
    error,
    updatePreferences,
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
