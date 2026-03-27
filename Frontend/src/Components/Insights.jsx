import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Insights() {
  const [insights, setInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [journalEntries, setJournalEntries] = useState([]);

  useEffect(() => {
    fetchJournalEntries();
  }, []);

  const fetchJournalEntries = async () => {
    try {
      const response = await axios.get("https://als-journal.onrender.com/api/journal", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      setJournalEntries(response.data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const generateInsights = async () => {
    if (journalEntries.length === 0) {
      alert("Not enough journal entries to generate insights");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/gemini/insights",
        { journalEntries },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setInsights(response.data.insights);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-800 dark:text-white">
          AI-Powered Insights
        </h2>
        <button
          onClick={generateInsights}
          disabled={loading || journalEntries.length === 0}
          className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm transition ${
            loading || journalEntries.length === 0
              ? "opacity-50 cursor-not-allowed"
              : "hover:opacity-90"
          }`}
        >
          {loading ? "✨ Analyzing..." : "✨ Generate Insights"}
        </button>
      </div>

      {insights ? (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {insights.split('\n').map((paragraph, idx) => (
            <p key={idx} className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-gray-500 text-sm italic">
          {journalEntries.length === 0
            ? "Start journaling to receive personalized insights"
            : "Click generate to see AI-powered patterns in your journal entries"}
        </p>
      )}

      {journalEntries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500">
            Based on {journalEntries.length} journal {journalEntries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
      )}
    </div>
  );
}