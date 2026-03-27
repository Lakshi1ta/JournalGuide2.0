import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import QuestionManager from "./QuestionManager";
import MindsetSelector from "./MindsetSelector";
import { questionSets } from "../data/questionSets";
import { MdEdit } from "react-icons/md";
import { MdOutlineRefresh } from "react-icons/md";
import { IoIosNotifications } from "react-icons/io";
export default function Profile() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [moodTrend, setMoodTrend] = useState([]);
  const [showQuestionManager, setShowQuestionManager] = useState(false);
  const [mindset, setMindset] = useState(null);
  const [showMindsetSelector, setShowMindsetSelector] = useState(false);

  // Random image URLs for profile header
 const profileImages = [
  "/1.jpg",
  "/2.jpg",
  "/3.jpg",
  "/4.jpg",
  "/5.jpg",
  "/6.jpg",
  "/7.jpg"
];

  // Get random image on component mount
  const [profileImage, setProfileImage] = useState("");

  // Get last 7 days
  const getLast7Days = () => {
    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      days.push({
        day: dayNames[6 - i],
        date: date.toISOString().split('T')[0],
        mood: null,
        emoji: '○'
      });
    }
    return days;
  };

  // Mood to emoji mapping
  const moodEmojis = {
    'Amazing': '🤩',
    'Good': '😊',
    'Okay': '😐',
    'Thoughtful': '🤔',
    'Peaceful': '😌',
    'Grateful': '🥹',
    'Heavy': '😮‍💨',
    'Bad': '😔',
    'Awful': '😫'
  };

  // Mood to color mapping
  const moodColors = {
    'Amazing': 'bg-green-500',
    'Good': 'bg-green-400',
    'Okay': 'bg-yellow-400',
    'Thoughtful': 'bg-blue-400',
    'Peaceful': 'bg-purple-400',
    'Grateful': 'bg-pink-400',
    'Heavy': 'bg-orange-400',
    'Bad': 'bg-red-400',
    'Awful': 'bg-red-600'
  };

  useEffect(() => {
    // Set random profile image
    const randomIndex = Math.floor(Math.random() * profileImages.length);
    setProfileImage(profileImages[randomIndex]);
    
    fetchUserData();
    fetchStats();
    fetchMoodTrend();
    fetchMindset();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData = response.data.data;
      setUser(userData);
      if (userData.notifications !== undefined) {
        setNotifications(userData.notifications);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/journal/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({ totalEntries: 0, streak: 0, recentEntries: 0, moodCounts: {} });
    }
  };

  const fetchMoodTrend = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/journal", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      const entries = response.data.data;
      const last7Days = getLast7Days();
      
      const trendData = last7Days.map(day => {
        const dayEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date).toISOString().split('T')[0];
          return entryDate === day.date;
        });

        if (dayEntries.length > 0) {
          const latestEntry = dayEntries[0];
          return {
            ...day,
            mood: latestEntry.mood,
            emoji: moodEmojis[latestEntry.mood?.label] || '○',
            color: moodColors[latestEntry.mood?.label] || 'bg-gray-400'
          };
        }
        
        return day;
      });

      setMoodTrend(trendData);
    } catch (error) {
      console.error("Error fetching mood trend:", error);
      setMoodTrend(getLast7Days());
    } finally {
      setLoading(false);
    }
  };

  const fetchMindset = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/auth/mindset", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setMindset(response.data.mindset);
    } catch (error) {
      console.error("Error fetching mindset:", error);
      setMindset('daily');
    }
  };

  const handleEditStart = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || "");
  };

  const handleEditSave = async (field) => {
    try {
      setSaveStatus("saving");
      
      const updateData = {};
      if (field === "name") updateData.name = editValue;
      if (field === "email") updateData.email = editValue;
      
      const response = await axios.put(
        "http://localhost:5000/api/auth/update",
        updateData,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      setUser(response.data.data);
      setEditingField(null);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 2000);
    }
  };

  const handleKeyPress = (e, field) => {
    if (e.key === 'Enter') handleEditSave(field);
    else if (e.key === 'Escape') setEditingField(null);
  };

  const toggleNotifications = async () => {
    const newNotifications = !notifications;
    setNotifications(newNotifications);
    
    try {
      await axios.put(
        "http://localhost:5000/api/auth/update",
        { notifications: newNotifications },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (error) {
      console.error("Error updating notifications:", error);
      setNotifications(!newNotifications);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // Get mindset display info
  const getMindsetInfo = () => {
    const mindsetMap = {
      'overthinking': { emoji: '😵', label: 'Overthinking / Overwhelmed', description: 'Clear your mind and find peace', color: 'purple', bgColor: 'bg-purple-600', borderColor: 'border-purple-500' },
      'stressed': { emoji: '😰', label: 'Stressed / Anxious', description: 'Calm your nerves and breathe', color: 'orange', bgColor: 'bg-orange-600', borderColor: 'border-orange-500' },
      'confused': { emoji: '🤔', label: 'Confused / Lack of Clarity', description: 'Find direction and answers', color: 'blue', bgColor: 'bg-blue-600', borderColor: 'border-blue-500' },
      'healing': { emoji: '💔', label: 'Emotional Healing', description: 'Heal and process your emotions', color: 'pink', bgColor: 'bg-pink-600', borderColor: 'border-pink-500' },
      'growth': { emoji: '🌱', label: 'Self-Growth / Reflection', description: 'Grow and become better', color: 'green', bgColor: 'bg-green-600', borderColor: 'border-green-500' },
      'daily': { emoji: '✍️', label: 'General Journaling', description: 'Free expression, no pressure', color: 'gray', bgColor: 'bg-gray-600', borderColor: 'border-gray-500' }
    };
    return mindsetMap[mindset] || mindsetMap.daily;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-purple-500"></div>
      </div>
    );
  }

  const mindsetInfo = getMindsetInfo();

  return (
    <div className="max-w-6xl mx-auto py-16 px-4 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-100 mb-2">Your Profile</h1>
          <p className="text-gray-400">Manage your account and track your journey</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/journal/history"
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition transform hover:scale-105"
          >
            View History →
          </Link>
          <button
            onClick={() => setShowQuestionManager(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition transform hover:scale-105 flex items-center gap-2"
          >
            Customize Questions
          </button>
        </div>
      </div>

      {/* Success/Error Message */}
      {saveStatus && (
        <div className={`mb-6 p-4 rounded-xl ${
          saveStatus === "success" 
            ? "bg-green-900/30 text-green-400 border border-green-800"
            : "bg-red-900/30 text-red-400 border border-red-800"
        }`}>
          {saveStatus === "success" ? "✓ Profile updated successfully!" : "✗ Failed to update. Please try again."}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden sticky top-24">
            {/* Profile Header with Image - Replaced gradient with random image */}
            <div className="h-32 relative overflow-hidden">
              <img 
                src={profileImage} 
                alt="Profile header" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
            
            <div className="relative px-6 pb-6">
              {/* Avatar */}
              <div className="absolute -top-12 left-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl border-4 border-gray-800 shadow-lg flex items-center justify-center text-white text-4xl font-bold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              </div>
              
              {/* User Info */}
              <div className="mt-20">
                {/* Name Field */}
                <div className="mb-3">
                  {editingField === "name" ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, "name")}
                        onBlur={() => handleEditSave("name")}
                        autoFocus
                        className="w-full px-3 py-2 text-xl font-semibold bg-gray-700 border-2 border-purple-500 rounded-lg focus:outline-none text-gray-100"
                        placeholder="Enter your name"
                      />
                      <p className="text-xs text-gray-500">Press Enter to save, Escape to cancel</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between group">
                      <h2 className="text-2xl ml-28 font-bold text-gray-100">
                        {user?.name || "Your Name"}
                      </h2>
                      <button
                        onClick={() => handleEditStart("name", user?.name)}
                        className="opacity-0 group-hover:opacity-100 transition p-2 hover:bg-gray-700 rounded-lg"
                        title="Edit name"
                      >
                        <MdEdit />
                      </button>
                    </div>
                  )}
                </div>

                {/* Member Since */}
                <div className="pt-4 mt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Member since {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                      : 'March 2026'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Total Entries" value={stats.totalEntries} />
              <StatCard title="Current Streak" value={`${stats.streak} days`} />
              <StatCard title="This Week" value={stats.recentEntries} />
              <StatCard 
                title="Top Mood" 
                value={Object.entries(stats.moodCounts || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"} 
                
              />
            </div>
          )}

          {/* Journal Style Card */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-100">Your Journal Style</h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl border-2 ${mindsetInfo.borderColor} ${mindsetInfo.bgColor} text-white`}>
                    <span className="text-3xl block">{mindsetInfo.emoji}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-200 text-lg">{mindsetInfo.label}</p>
                    <p className="text-sm text-gray-400">{mindsetInfo.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {questionSets[mindset]?.questions.length || 10} personalized questions
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowMindsetSelector(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Mood Trend */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-100">This Week's Mood</h2>
              <button 
                onClick={fetchMoodTrend}
                className="text-sm text-gray-400 hover:text-gray-200 transition flex items-center gap-1"
              >
                <span><MdOutlineRefresh /></span> Refresh
              </button>
            </div>
            
            <div className="p-6">
              {moodTrend.every(day => !day.mood) ? (
                <div className="h-40 flex flex-col items-center justify-center text-gray-500">
                  <span className="text-4xl mb-2"></span>
                  <p>No journal entries this week</p>
                  <Link to="/journal" className="mt-3 text-sm text-purple-400 underline">
                    Write your first entry →
                  </Link>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-7 gap-2 mb-6">
                    {moodTrend.map((day, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className={`w-full aspect-square rounded-xl ${day.color || 'bg-gray-700'} flex items-center justify-center text-2xl shadow-lg`}>
                          <span>{day.emoji}</span>
                        </div>
                        <span className="text-xs font-medium text-gray-400 mt-2">
                          {day.day}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-500 border-t border-gray-700 pt-4">
                    <LegendItem color="bg-green-400" label="Positive" />
                    <LegendItem color="bg-yellow-400" label="Neutral" />
                    <LegendItem color="bg-red-400" label="Negative" />
                    <LegendItem color="bg-gray-700" label="No Entry" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-100">Preferences</h2>
            </div>
            
            <div className="p-6">
              <ToggleItem
              icon={<IoIosNotifications />}
                title="Email Notifications"
                description="Receive updates about your journaling journey"
                value={notifications}
                onToggle={toggleNotifications}
              />
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
              <h2 className="text-lg font-semibold text-gray-100">Account</h2>
            </div>
            
            <div className="p-6 space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium"
              >
                Logout
              </button>
              <button className="w-full py-3 border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-900/20 transition font-medium">
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Question Manager Modal */}
      {showQuestionManager && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <QuestionManager 
            onClose={() => setShowQuestionManager(false)}
            onQuestionsUpdate={() => {
              console.log("Questions updated");
            }}
          />
        </div>
      )}

      {/* Mindset Selector Modal */}
      {showMindsetSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <MindsetSelector
            currentMindset={mindset}
            onSelect={(newMindset) => {
              setMindset(newMindset);
              setShowMindsetSelector(false);
            }}
            onClose={() => setShowMindsetSelector(false)}
          />
        </div>
      )}
    </div>
  );
}

// Helper Components
const StatCard = ({ title, value, icon }) => (
  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 hover:shadow-md transition">
    <div className="flex items-center justify-between mb-2">
      <p className="text-sm text-gray-400">{title}</p>
      <span className="text-xl">{icon}</span>
    </div>
    <p className="text-2xl font-semibold text-gray-100">{value}</p>
  </div>
);

const ToggleItem = ({ icon, title, description, value, onToggle }) => (
  <div className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700 transition">
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-medium text-gray-200">{title}</p>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-colors ${
        value ? "bg-purple-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
          value ? "translate-x-7" : "translate-x-0"
        }`}
      />
    </button>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-1">
    <div className={`w-3 h-3 ${color} rounded`}></div>
    <span>{label}</span>
  </div>
);