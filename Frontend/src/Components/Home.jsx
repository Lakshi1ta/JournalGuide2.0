import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-gray-950 relative overflow-hidden">
      
      {/* Animated background orbs - dark mode only */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-900/20 rounded-full filter blur-3xl opacity-30 animate-float"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-pink-900/20 rounded-full filter blur-3xl opacity-30 animate-float-delay"></div>
      <div className="absolute top-40 right-40 w-60 h-60 bg-indigo-900/20 rounded-full filter blur-3xl opacity-30 animate-float-slow"></div>
      <div className="absolute bottom-40 left-20 w-96 h-96 bg-blue-900/20 rounded-full filter blur-3xl opacity-20 animate-float"></div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-purple-600/30 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-pink-600/30 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-indigo-600/30 rounded-full animate-ping animation-delay-2000"></div>
        <div className="absolute top-2/3 right-1/3 w-4 h-4 bg-blue-600/30 rounded-full animate-ping animation-delay-3000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl">
        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 bg-clip-text text-transparent">
            Daily reflection,
          </span>
          <br />
          <span className="text-gray-100">
            structured for growth.
          </span>
        </h1>

        <p className="text-gray-400 mt-6 max-w-2xl mx-auto text-lg leading-relaxed">
          Capture your thoughts, understand your emotions, and track your mental patterns over time.
          Your journey to self-discovery starts here.
        </p>

        <div className="mt-12 flex flex-col sm:flex-row gap-5 justify-center">
          <Link to="/journal">
            <button className="px-8 py-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition transform hover:scale-105 shadow-xl font-medium flex items-center gap-2">
              Start Journaling
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </Link>

          <Link to="/profile">
            <button className="px-8 py-4 bg-gray-800 text-gray-200 rounded-lg hover:bg-gray-700 transition transform hover:scale-105 shadow-lg border border-gray-700 font-medium flex items-center gap-2">
              View Reports
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </Link>
        </div>

        {/* Decorative dots */}
        <div className="mt-16 flex justify-center gap-4">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse animation-delay-300"></div>
          <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse animation-delay-600"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse animation-delay-900"></div>
        </div>
      </div>
    </div>
  );
}