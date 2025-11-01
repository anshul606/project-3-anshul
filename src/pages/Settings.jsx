import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { usePreferences } from "../contexts/PreferencesContext";
import { Toast } from "../components/shared";

/**
 * Settings page for user preferences
 */
const Settings = () => {
  const { user } = useAuth();
  const { preferences, updatePreferences, loading } = usePreferences();
  const [theme, setTheme] = useState("light");
  const [defaultLanguage, setDefaultLanguage] = useState("javascript");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Load preferences into local state
  useEffect(() => {
    if (preferences) {
      setTheme(preferences.theme || "light");
      setDefaultLanguage(preferences.defaultLanguage || "javascript");
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const newPreferences = {
        ...preferences,
        theme,
        defaultLanguage,
      };
      await updatePreferences(newPreferences);
      setToast({
        message: "Settings saved successfully!",
        type: "success",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setToast({
        message: "Failed to save settings. Please try again.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Settings
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-gray-600 dark:text-gray-400">
            Loading preferences...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        Settings
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* User Info */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Account Information
          </h2>
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Email:</span> {user?.email}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium">Display Name:</span>{" "}
              {user?.displayName || "Not set"}
            </p>
          </div>
        </div>

        {/* Theme Preference */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Appearance
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={theme}
              onChange={(e) => {
                const newTheme = e.target.value;
                setTheme(newTheme);
                // Apply theme immediately for preview
                const root = document.documentElement;
                if (newTheme === "dark") {
                  root.classList.add("dark");
                } else if (newTheme === "light") {
                  root.classList.remove("dark");
                } else if (newTheme === "system") {
                  const prefersDark = window.matchMedia(
                    "(prefers-color-scheme: dark)"
                  ).matches;
                  if (prefersDark) {
                    root.classList.add("dark");
                  } else {
                    root.classList.remove("dark");
                  }
                }
              }}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={saving}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred color theme for the application
            </p>
          </div>
        </div>

        {/* Default Language */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Editor Preferences
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Language for New Snippets
            </label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className="w-full max-w-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={saving}
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="csharp">C#</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="ruby">Ruby</option>
              <option value="php">PHP</option>
              <option value="swift">Swift</option>
              <option value="kotlin">Kotlin</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="sql">SQL</option>
              <option value="bash">Bash</option>
              <option value="yaml">YAML</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
              <option value="plaintext">Plain Text</option>
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              This language will be pre-selected when creating new snippets
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </div>
  );
};

export default Settings;
