import { useState, useEffect } from "react";
import QuestionCard from "./QuestionCard";
import axios from "axios";
import journalData from "../data/journalQuestions.json";

export default function Journal() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [mood, setMood] = useState("");
  const [structuredEntry, setStructuredEntry] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const journalQuestions = journalData.questions;
  const moodOptions = journalData.moodOptions;

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < journalQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const allQuestionsAnswered = () => {
    return Object.keys(answers).length === journalQuestions.length && mood;
  };

  const previewAnswers = () => {
    if (!mood) {
      alert("Please select a mood first");
      return;
    }
    setShowPreview(true);
    setError("");
  };

  // Generate beautiful paragraph using Gemini
 const generateStructuredEntry = async () => {
  if (!allQuestionsAnswered()) {
    alert("Please answer all questions and select a mood");
    return;
  }

  setIsGenerating(true);
  setError("");
  
  const answersList = Object.values(answers).filter(answer => answer.trim() !== "");
  const selectedMood = moodOptions.find(m => m.value === mood);
  
  try {
    const response = await axios.post(
      "http://localhost:5000/api/gemini/generate",
      { 
        answers: answersList,
        mood: selectedMood
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      }
    );

    console.log('Gemini response:', response.data);

    if (response.data.success) {
      setStructuredEntry(response.data.entry);
      if (response.data.usingFallback) {
        setError("⚠️ Using offline mode (AI features limited)");
      }
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    setError("❌ Failed to generate entry. Please try again.");
    
    // Simple fallback
    const fallbackEntry = `Today was a ${selectedMood.label.toLowerCase()} day. ${answersList.join(' ')}`;
    setStructuredEntry(fallbackEntry);
  } finally {
    setIsGenerating(false);
    setShowPreview(false);
  }
};
  // UPDATED FALLBACK - Creates ONE paragraph without any headings
 // Replace the generateFallbackEntry function with this enhanced version

  const saveEntry = async () => {
  try {
    setSaveStatus("saving");
    
    const selectedMood = moodOptions.find(m => m.value === mood);

    console.log("Saving entry with data:", {
      mood: selectedMood,
      content: structuredEntry,
      date: new Date()
    });

    console.log("Token:", localStorage.getItem("token"));

    const response = await axios.post(
      "http://localhost:5000/api/journal",
      {
        mood: selectedMood,
        content: structuredEntry,
        date: new Date()
      },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Save response:", response.data);

    if (response.data.success) {
      setSaveStatus("success");
      setTimeout(() => {
        setSaveStatus("");
        // Reset form
        setMood("");
        setAnswers({});
        setStructuredEntry("");
        setCurrentQuestionIndex(0);
        setShowPreview(false);
      }, 2000);
    }
  } catch (error) {
    console.error("Full error object:", error);
    
    // Log detailed error information
    if (error.response) {
      // The request was made and the server responded with a status code
      console.log("Error response data:", error.response.data);
      console.log("Error response status:", error.response.status);
      console.log("Error response headers:", error.response.headers);
      
      // Show specific error message from backend
      setSaveStatus("error");
      alert(`Server error: ${error.response.data.error || error.response.statusText}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.log("Error request:", error.request);
      setSaveStatus("error");
      alert("No response from server. Is your backend running?");
    } else {
      // Something happened in setting up the request
      console.log("Error message:", error.message);
      setSaveStatus("error");
      alert(`Request error: ${error.message}`);
    }
    
    setTimeout(() => setSaveStatus(""), 3000);
  }
};
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = journalQuestions[currentQuestionIndex];

  return (
    <div className="max-w-3xl mx-auto py-16 px-4 animate-fade-in">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-md p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-light text-gray-800 dark:text-white mb-2">
            Daily Reflection
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Let these questions guide your thoughts...
          </p>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{ width: `${((Object.keys(answers).length + (mood ? 1 : 0)) / (journalQuestions.length + 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Main content - Questions are only visible during answering */}
        {!showPreview && !structuredEntry && (
          <>
            {/* Mood selector */}
            <div className="mb-8">
              <label className="block text-sm text-gray-500 dark:text-gray-400 mb-4">
                First, how would you rate your overall day?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                      mood === option.value
                        ? "border-black dark:border-white bg-black dark:bg-white text-white dark:text-black"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                    }`}
                  >
                    <span className="text-3xl block mb-2">{option.emoji}</span>
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Current question */}
            {currentQuestion && (
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion.question}
                emoji={currentQuestion.emoji}
                value={answers[currentQuestionIndex] || ""}
                onChange={handleAnswer}
                placeholder={currentQuestion.placeholder}
              />
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-6">
              <button
                onClick={prevQuestion}
                disabled={currentQuestionIndex === 0}
                className={`px-6 py-2 rounded-lg transition ${
                  currentQuestionIndex === 0
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                ← Previous
              </button>
              
              {currentQuestionIndex < journalQuestions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  disabled={!answers[currentQuestionIndex]}
                  className={`px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg transition ${
                    !answers[currentQuestionIndex]
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90"
                }`}
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={previewAnswers}
                  disabled={!allQuestionsAnswered()}
                  className={`px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition ${
                    !allQuestionsAnswered()
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:opacity-90 transform hover:scale-105"
                  }`}
                >
                  Create Journal Entry
                </button>
              )}
            </div>
          </>
        )}

        {/* Preview Mode - Shows ONLY answers */}
        {showPreview && !structuredEntry && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
              Your Thoughts
            </h2>

            {/* Mood preview */}
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Your mood today</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{moodOptions.find(m => m.value === mood)?.emoji}</span>
                <span className="font-medium">{moodOptions.find(m => m.value === mood)?.label}</span>
              </div>
            </div>

            {/* ONLY show answers, NO questions */}
            {Object.values(answers).map((answer, index) => (
              answer && (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl">
                  <p className="text-gray-700 dark:text-gray-300 text-lg italic">
                    "{answer}"
                  </p>
                </div>
              )
            ))}

            {/* Action buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                ← Back to Questions
              </button>
              <button
                onClick={generateStructuredEntry}
                disabled={isGenerating}
                className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition flex items-center justify-center gap-2 ${
                  isGenerating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                }`}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">✨</span>
                    Creating Your Entry...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    Create Beautiful Paragraph
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* FINAL JOURNAL ENTRY - ONE paragraph, NO headings, NO structure */}
        {structuredEntry && (
          <div className="mt-8 p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-3xl">📖</span>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                Your Journal Entry
              </h3>
              <span className="ml-auto text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full">
                {error ? "Local Draft" : "✨ Polished"}
              </span>
            </div>
            
            {/* THIS IS THE IMPORTANT PART - JUST A PLAIN PARAGRAPH */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                {structuredEntry}
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={saveEntry}
                disabled={saveStatus === "saving"}
                className={`flex-1 py-3 rounded-lg transition ${
                  saveStatus === "saving"
                    ? "bg-gray-400 cursor-not-allowed"
                    : saveStatus === "success"
                    ? "bg-green-600 text-white"
                    : "bg-black dark:bg-white text-white dark:text-black hover:opacity-90"
                }`}
              >
                {saveStatus === "saving" ? "💾 Saving..." : 
                 saveStatus === "success" ? "✓ Saved to Journal!" : 
                 "💾 Save This Entry"}
              </button>
              <button
                onClick={() => {
                  setStructuredEntry("");
                  setShowPreview(true);
                }}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                Create New
              </button>
            </div>
          </div>
        )}

        {/* Progress overview - Only shows during answering */}
        {!structuredEntry && !showPreview && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Your Progress:
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {journalQuestions.map((q, idx) => (
                <div 
                  key={q.id}
                  className={`text-xs p-2 rounded-lg flex items-center gap-1 ${
                    answers[idx] 
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                      : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500"
                  }`}
                >
                  <span>{q.emoji}</span>
                  <span>Q{idx + 1}</span>
                  {answers[idx] && <span className="ml-auto">✓</span>}
                </div>
              ))}
              <div 
                className={`text-xs p-2 rounded-lg flex items-center gap-1 ${
                  mood 
                    ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500"
                }`}
              >
                <span>😊</span>
                <span>Mood</span>
                {mood && <span className="ml-auto">✓</span>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}