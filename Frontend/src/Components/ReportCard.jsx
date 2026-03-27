import React from "react";
export default function ReportCard({ title, value, progress, icon = "📊" }) {
  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <span className="text-2xl">{icon}</span>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
        {value}
      </h2>

      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{progress}%</p>
    </div>
  );
}