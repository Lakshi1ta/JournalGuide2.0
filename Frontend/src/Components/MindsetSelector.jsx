import React from "react";
import { useState } from "react";
import axios from "axios";
import { mindsetOptions, questionSets } from "../data/questionSets";

export default function MindsetSelector({ onSelect, onClose, currentMindset }) {
  const [selected, setSelected] = useState(currentMindset || "daily");
  const [saving, setSaving] = useState(false);

  const handleSelect = async (mindsetId) => {
    setSelected(mindsetId);
    setSaving(true);
    
    try {
      await axios.put(
        "https://als-journal.onrender.com/api/auth/mindset",
        { mindset: mindsetId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      if (onSelect) onSelect(mindsetId);
    } catch (error) {
      console.error("Error saving mindset:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-100 mb-1">How are you feeling today?</h2>
          <p className="text-sm text-gray-400">Choose what resonates with you right now</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Box format grid - exactly like mood selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {mindsetOptions.map((option) => {
          const isSelected = selected === option.id;
          const questionCount = questionSets[option.id]?.questions.length || 10;
          
          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id)}
              disabled={saving}
              className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                isSelected
                  ? "border-purple-500 bg-purple-600 text-white"
                  : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
              }`}
            >
              <span className="text-3xl block mb-2">{option.emoji}</span>
              <span className="font-medium text-sm">{option.label}</span>
              <span className="block text-xs mt-1 opacity-75">
                {questionCount} questions
              </span>
            </button>
          );
        })}
      </div>

      {saving && (
        <div className="mt-6 text-center text-gray-400 text-sm">
          Saving your preference...
        </div>
      )}
    </div>
  );
}