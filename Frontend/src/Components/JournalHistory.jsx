import { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

export default function JournalHistory() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({});

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      const response = await axios.get("https://als-journal.onrender.com/api/journal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setEntries(response.data.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get("https://als-journal.onrender.com/api/journal/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setStats(response.data.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleDelete = async (id) => {
    // Show confirmation dialog
    if (!window.confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return;
    }

    // Set loading state for this specific entry
    setDeleteStatus(prev => ({ ...prev, [id]: 'deleting' }));

    try {
      await axios.delete(`https://als-journal.onrender.com/api/journal/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      
      // Remove entry from state
      setEntries(prevEntries => prevEntries.filter(entry => entry._id !== id));
      
      // Show success message
      setDeleteStatus(prev => ({ ...prev, [id]: 'success' }));
      setTimeout(() => {
        setDeleteStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 2000);

      // Refresh stats after deletion
      fetchStats();

    } catch (error) {
      console.error("Error deleting entry:", error);
      setDeleteStatus(prev => ({ ...prev, [id]: 'error' }));
      setTimeout(() => {
        setDeleteStatus(prev => {
          const newStatus = { ...prev };
          delete newStatus[id];
          return newStatus;
        });
      }, 3000);
    }
  };

  const handleDeleteAll = async () => {
    if (entries.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete all ${entries.length} journal entries? This action cannot be undone.`)) {
      return;
    }

    try {
      // You'll need to create a bulk delete endpoint or loop through entries
      for (const entry of entries) {
        await axios.delete(`https://als-journal.onrender.com/api/journal/${entry._id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });
      }
      
      setEntries([]);
      fetchStats();
      alert('All entries deleted successfully!');
    } catch (error) {
      console.error("Error deleting all entries:", error);
      alert('Failed to delete some entries. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 animate-fade-in">
      {/* Header with Delete All button */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-800 dark:text-white mb-2">
            Your Journal History
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            All your private reflections in one place
          </p>
        </div>
        {entries.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
          >
            Delete All ({entries.length})
          </button>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatCard title="Total Entries" value={stats.totalEntries} />
          <StatCard title="Current Streak" value={`${stats.streak} days`} />
          <StatCard title="This Week" value={stats.recentEntries} />
          <StatCard 
            title="Top Mood" 
            value={Object.entries(stats.moodCounts || {}).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"} 
          />
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-16 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md rounded-2xl border border-gray-200 dark:border-gray-700">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-xl text-gray-800 dark:text-white mb-2">No journal entries yet</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Start your first reflection today!
          </p>
          <Link
            to="/journal"
            className="inline-block mt-6 px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl hover:opacity-90 transition"
          >
            Write Your First Entry
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div
              key={entry._id}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition relative"
            >
              {/* Delete Button with Status */}
              <div className="absolute top-4 right-4">
                {deleteStatus[entry._id] === 'deleting' ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="text-sm">Deleting...</span>
                  </div>
                ) : deleteStatus[entry._id] === 'success' ? (
                  <span className="text-green-600 dark:text-green-400 text-sm">✓ Deleted</span>
                ) : deleteStatus[entry._id] === 'error' ? (
                  <span className="text-red-600 dark:text-red-400 text-sm">✗ Failed</span>
                ) : (
                  <button
                    onClick={() => handleDelete(entry._id)}
                    className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                )}
              </div>

              {/* Entry Content */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{entry.mood?.emoji || "📝"}</span>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(entry.date), "MMMM d, yyyy 'at' h:mm a")}
                  </p>
                  <p className="text-xs text-gray-400">
                    Mood: {entry.mood?.label || "Not specified"}
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {entry.content}
              </p>

              {/* Entry Footer */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs text-gray-400">
                <span>Entry ID: {entry._id.slice(-6)}</span>
                <span>{format(new Date(entry.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Stat Card Component
const StatCard = ({ title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
    <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
    <p className="text-2xl font-semibold text-gray-800 dark:text-white">{value}</p>
  </div>
);