import React from "react";
export default function QuestionCard({ question, emoji, value, onChange, placeholder }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md">
      <label className="block text-sm text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
        <span className="text-2xl">{emoji}</span>
        <span className="font-medium">{question}</span>
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows="4"
        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition resize-none"
        autoFocus
      />
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-gray-400">
          {value.length} characters
        </span>
        {value.length > 0 && (
          <span className="text-xs text-green-600 dark:text-green-400">
            ✓ Answered
          </span>
        )}
      </div>
    </div>
  );
}