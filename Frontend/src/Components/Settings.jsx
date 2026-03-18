import { useState, useEffect } from "react";
import axios from "axios";

export default function Settings({ onClose }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user data
    fetchUserData();
    // Check current theme
    setDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setUser(response.data.data);
      setName(response.data.data.name || "");
      setEmail(response.data.data.email || "");
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaveStatus("saving");
      
      // Update user profile
      await axios.put(
        "http://localhost:5000/api/auth/update",
        { name, email, notifications },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      // Update theme if changed
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error saving settings:", error);
      setSaveStatus("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Settings
        </h2>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Profile Settings
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Preferences
          </h3>

          <div className="space-y-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  darkMode ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-black transform transition-transform ${
                    darkMode ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  notifications ? "bg-black dark:bg-white" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-black transform transition-transform ${
                    notifications ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-4">
            Account
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
            
            <button
              className="w-full py-3 border border-red-300 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Save Button with Status */}
        <div className="pt-4">
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving"}
            className={`w-full py-3 rounded-lg transition ${
              saveStatus === "saving"
                ? "bg-gray-400 cursor-not-allowed"
                : saveStatus === "success"
                ? "bg-green-600 text-white"
                : saveStatus === "error"
                ? "bg-red-600 text-white"
                : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
            }`}
          >
            {saveStatus === "saving" ? "💾 Saving..." : 
             saveStatus === "success" ? "✓ Saved Successfully!" : 
             saveStatus === "error" ? "✗ Failed to Save" : 
             "Save Changes"}
          </button>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}