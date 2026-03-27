import { useState, useEffect, useRef } from "react";
import QuestionCard from "./QuestionCard";
import axios from "axios";
import { questionSets } from "../data/questionSets";
import MindsetSelector from "./MindsetSelector";
import AIBot from "./AIBot";
import { TfiReload } from "react-icons/tfi";

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
  const [allQuestions, setAllQuestions] = useState([]);
  const [displayQuestions, setDisplayQuestions] = useState([]);
  const [mindset, setMindset] = useState("daily");
  const [showMindsetSelector, setShowMindsetSelector] = useState(false);
  const [showAIBot, setShowAIBot] = useState(false);
  const [hasTodaysEntry, setHasTodaysEntry] = useState(false);
  const [existingEntry, setExistingEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const mainContainerRef = useRef(null);
  const [moodOptions] = useState([
    { value: "amazing", emoji: "🤩", label: "Amazing" },
    { value: "good", emoji: "😊", label: "Good" },
    { value: "okay", emoji: "😐", label: "Okay" },
    { value: "thoughtful", emoji: "🤔", label: "Thoughtful" },
    { value: "peaceful", emoji: "😌", label: "Peaceful" },
    { value: "grateful", emoji: "🥹", label: "Grateful" },
    { value: "heavy", emoji: "😮‍💨", label: "Heavy" },
    { value: "bad", emoji: "😔", label: "Bad" },
    { value: "awful", emoji: "😫", label: "Awful" }
  ]);

  // Get random questions
  const getRandomQuestions = (questionsArray, count) => {
    if (!questionsArray || questionsArray.length === 0) return [];
    const shuffled = [...questionsArray];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  // Check for today's entry
  const checkTodaysEntry = async () => {
    try {
      const response = await axios.get("https://als-journal.onrender.com/api/journal/today", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (response.data.hasEntry) {
        setHasTodaysEntry(true);
        setExistingEntry(response.data.entry);
      }
    } catch (error) {
      console.error("Error checking today's entry:", error);
    }
  };

  // Natural fallback entry
  const generateNaturalFallback = (answersList, mood) => {
    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    let entry = `Today, ${date}, I'm feeling ${mood?.label?.toLowerCase() || "okay"}. `;
    
    if (answersList[0]) entry += `${answersList[0]} `;
    if (answersList[1]) entry += `What mattered today was ${answersList[1]}. `;
    if (answersList[2]) entry += `I'm trying to let go of ${answersList[2]}. `;
    if (answersList[3]) entry += `I think about ${answersList[3]}. `;
    if (answersList[4]) entry += `The best part was ${answersList[4]}. `;
    if (answersList[5]) entry += `I learned that ${answersList[5]}. `;
    if (answersList[6]) entry += `I'm grateful for ${answersList[6]}. `;
    if (answersList[7]) entry += `Tomorrow, I want to ${answersList[7]}. `;
    
    entry += `That's where my head is at.`;
    
    return entry;
  };

  // Load questions based on mindset
  const loadQuestionsForMindset = (mindsetId) => {
    let mindsetQuestions = [];
    
    switch (mindsetId) {
      case 'overthinking':
        mindsetQuestions = questionSets.overthinking?.questions || [];
        break;
      case 'stressed':
        mindsetQuestions = questionSets.stressed?.questions || [];
        break;
      case 'confused':
        mindsetQuestions = questionSets.confused?.questions || [];
        break;
      case 'healing':
        mindsetQuestions = questionSets.healing?.questions || [];
        break;
      case 'growth':
        mindsetQuestions = questionSets.growth?.questions || [];
        break;
      default:
        mindsetQuestions = questionSets.daily?.questions || [];
    }
    
    if (mindsetQuestions.length === 0) {
      mindsetQuestions = questionSets.daily?.questions || [];
    }
    
    setAllQuestions(mindsetQuestions);
    
    const maxCount = Math.min(mindsetQuestions.length, 5);
    const minCount = Math.min(mindsetQuestions.length, 3);
    const newCount = Math.floor(Math.random() * (maxCount - minCount + 1)) + minCount;
    
    const randomQuestions = getRandomQuestions(mindsetQuestions, newCount);
    setDisplayQuestions(randomQuestions);
  };

  // Save mindset to backend
  const saveMindsetToBackend = async (mindsetId) => {
    try {
      await axios.put(
        "http://localhost:5000/api/auth/mindset",
        { mindset: mindsetId },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
    } catch (error) {
      console.error("Error saving mindset:", error);
    }
  };

  // Handle mindset change
  const handleMindsetChange = async (newMindset) => {
    setMindset(newMindset);
    await saveMindsetToBackend(newMindset);
    loadQuestionsForMindset(newMindset);
    setAnswers({});
    setCurrentQuestionIndex(0);
    setMood("");
    setStructuredEntry("");
    setShowPreview(false);
    setError("");
    setShowMindsetSelector(false);
  };

  // Shuffle questions
  const handleShuffle = () => {
    if (allQuestions.length === 0) return;
    const newCount = Math.floor(Math.random() * 3) + 3;
    const newQuestions = getRandomQuestions(allQuestions, newCount);
    setDisplayQuestions(newQuestions);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  // Load existing entry for editing
  const loadExistingEntry = () => {
    if (existingEntry) {
      setMood(existingEntry.mood?.value || "");
      if (existingEntry.answers && existingEntry.answers.length > 0) {
        const loadedAnswers = {};
        existingEntry.answers.forEach((answer, idx) => {
          loadedAnswers[idx] = answer;
        });
        setAnswers(loadedAnswers);
      }
      if (existingEntry.content) {
        setStructuredEntry(existingEntry.content);
      }
      setIsEditing(true);
    }
  };

  // Force scroll to top on mount
  useEffect(() => {
    // Use multiple methods to ensure scroll to top
    window.scrollTo(0, 0);
    if (mainContainerRef.current) {
      mainContainerRef.current.scrollTop = 0;
    }
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const fetchMindsetAndQuestions = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/mindset", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        const mindsetId = response.data.mindset;
        setMindset(mindsetId);
        loadQuestionsForMindset(mindsetId);
      } catch (error) {
        console.error("Error fetching mindset:", error);
        setMindset('daily');
        loadQuestionsForMindset('daily');
      } finally {
        setLoading(false);
      }
    };

    fetchMindsetAndQuestions();
    checkTodaysEntry();
  }, []);

  const handleAnswer = (answer) => {
    setAnswers({
      ...answers,
      [currentQuestionIndex]: answer
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < displayQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const allQuestionsAnswered = () => {
    return Object.keys(answers).length === displayQuestions.length && mood;
  };

  const previewAnswers = () => {
    if (!mood) {
      alert("Please select a mood first");
      return;
    }
    setShowPreview(true);
    setError("");
  };

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
          mood: selectedMood,
          mindset: mindset
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setStructuredEntry(response.data.entry);
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      setError("Using local generation...");
      const fallbackEntry = generateNaturalFallback(answersList, selectedMood);
      setStructuredEntry(fallbackEntry);
    } finally {
      setIsGenerating(false);
      setShowPreview(false);
    }
  };

  const saveEntry = async () => {
    try {
      setSaveStatus("saving");
      
      const selectedMood = moodOptions.find(m => m.value === mood);
      const answersList = Object.values(answers);

      const response = await axios.post(
        "http://localhost:5000/api/journal",
        {
          mood: selectedMood,
          content: structuredEntry,
          answers: answersList,
          mindset: mindset,
          questions: displayQuestions,
          date: new Date()
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      if (response.data.success) {
        setSaveStatus(response.data.isUpdate ? "updated" : "success");
        setHasTodaysEntry(true);
        setExistingEntry(response.data.data);
        setIsEditing(false);
        
        setTimeout(() => {
          setSaveStatus("");
          setMood("");
          setAnswers({});
          setStructuredEntry("");
          setCurrentQuestionIndex(0);
          setShowPreview(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving entry:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const getMindsetDisplay = () => {
    const mindsetMap = {
      'overthinking': { emoji: '😵', label: 'Overthinking / Overwhelmed' },
      'stressed': { emoji: '😰', label: 'Stressed / Anxious' },
      'confused': { emoji: '🤔', label: 'Confused / Lack of Clarity' },
      'healing': { emoji: '💔', label: 'Emotional Healing' },
      'growth': { emoji: '🌱', label: 'Self-Growth / Reflection' },
      'daily': { emoji: '✍️', label: 'General Journaling' }
    };
    return mindsetMap[mindset] || mindsetMap.daily;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4">
        <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-3xl border border-gray-700 shadow-xl text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = displayQuestions[currentQuestionIndex];
  const mindsetDisplay = getMindsetDisplay();

  return (
    <>
      <div ref={mainContainerRef} className="min-h-screen">
        <div className="max-w-3xl mx-auto py-16 px-4 animate-fade-in">
          <div className="bg-gray-800/70 backdrop-blur-md p-8 rounded-3xl border border-gray-700 shadow-xl">
            
            {/* Today's Entry Alert */}
            {hasTodaysEntry && !structuredEntry && !showPreview && !isEditing && (
              <div className="mb-6 p-4 bg-purple-900/30 border border-purple-700 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-300 text-sm">You already journaled today</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {existingEntry?.content?.substring(0, 100)}...
                    </p>
                  </div>
                  <button
                    onClick={loadExistingEntry}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                  >
                    Edit Entry
                  </button>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => setShowMindsetSelector(true)}
                className="px-4 py-2 bg-gray-700 rounded-lg text-sm text-gray-300 hover:bg-gray-600 transition flex items-center gap-2"
              >
                <span className="text-xl">{mindsetDisplay.emoji}</span>
                <span>{mindsetDisplay.label}</span>
                <span>▼</span>
              </button>
              
              <div className="flex items-center gap-3">
                <div className="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">
                  {displayQuestions.length} questions today
                </div>
                <button
                  onClick={handleShuffle}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white transition flex items-center gap-2"
                  title="Shuffle questions"
                >
                  <span><TfiReload /></span>
                  <span className="hidden sm:inline">Shuffle</span>
                </button>
              </div>
            </div>
            
            <div className="mb-8">
              <h1 className="text-3xl font-light text-gray-100 mb-2">
                Daily Reflection
              </h1>
              <p className="text-sm text-gray-400">
                {mindset === 'overthinking' && 'Questions to clear your mind and find peace'}
                {mindset === 'stressed' && 'Questions to calm your nerves and breathe'}
                {mindset === 'confused' && 'Questions to find direction and answers'}
                {mindset === 'healing' && 'Questions to heal and process emotions'}
                {mindset === 'growth' && 'Questions to grow and become better'}
                {mindset === 'daily' && 'Free expression, just write'}
              </p>
              
              <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 transition-all duration-300"
                  style={{ width: `${((Object.keys(answers).length + (mood ? 1 : 0)) / (displayQuestions.length + 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-yellow-900/30 text-yellow-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            {saveStatus && (
              <div className={`mb-4 p-3 rounded-lg ${
                saveStatus === "success" ? "bg-green-900/30 text-green-400" :
                saveStatus === "updated" ? "bg-blue-900/30 text-blue-400" :
                saveStatus === "error" ? "bg-red-900/30 text-red-400" :
                "bg-yellow-900/30 text-yellow-400"
              }`}>
                {saveStatus === "success" ? "✓ New entry saved!" : 
                 saveStatus === "updated" ? "✎ Entry updated!" :
                 saveStatus === "error" ? "✗ Failed to save" : 
                 "Saving..."}
              </div>
            )}

            {isEditing && (
              <div className="mb-4 p-3 bg-blue-900/30 text-blue-400 rounded-lg text-sm flex items-center justify-between">
                <span> Editing today's entry</span>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="text-xs hover:underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {!showPreview && !structuredEntry && (
              <>
                <div className="mb-8">
                  <label className="block text-sm text-gray-400 mb-4">
                    How would you rate your overall day?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {moodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setMood(option.value)}
                        className={`p-4 rounded-xl border-2 transition-all transform hover:scale-105 ${
                          mood === option.value
                            ? "border-purple-500 bg-purple-600 text-white"
                            : "border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600"
                        }`}
                      >
                        <span className="text-3xl block mb-2">{option.emoji}</span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {currentQuestion && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500">
                        Question {currentQuestionIndex + 1} of {displayQuestions.length}
                      </span>
                    </div>
                    <QuestionCard
                      key={currentQuestion.id}
                      question={currentQuestion.question}
                      emoji={currentQuestion.emoji}
                      value={answers[currentQuestionIndex] || ""}
                      onChange={handleAnswer}
                      placeholder={currentQuestion.placeholder || "Write your answer here..."}
                    />
                  </div>
                )}

                <div className="flex justify-between mt-6">
                  <button
                    onClick={prevQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-6 py-2 rounded-lg transition ${
                      currentQuestionIndex === 0
                        ? "opacity-50 cursor-not-allowed text-gray-500"
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    ← Previous
                  </button>
                  
                  {currentQuestionIndex < displayQuestions.length - 1 ? (
                    <button
                      onClick={nextQuestion}
                      disabled={!answers[currentQuestionIndex]}
                      className={`px-6 py-2 bg-purple-600 text-white rounded-lg transition ${
                        !answers[currentQuestionIndex]
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-purple-700"
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

            {showPreview && !structuredEntry && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-100 mb-4">
                  Your Thoughts
                </h2>

                <div className="bg-gray-700/50 p-4 rounded-xl">
                  <p className="text-sm text-gray-400 mb-2">Your mood today</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{moodOptions.find(m => m.value === mood)?.emoji}</span>
                    <span className="font-medium text-gray-200">{moodOptions.find(m => m.value === mood)?.label}</span>
                  </div>
                </div>

                {Object.values(answers).map((answer, index) => (
                  answer && (
                    <div key={index} className="bg-gray-700/50 p-4 rounded-xl">
                      <p className="text-gray-300 text-lg italic">"{answer}"</p>
                    </div>
                  )
                ))}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={generateStructuredEntry}
                    disabled={isGenerating}
                    className={`flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg transition flex items-center justify-center gap-2 ${
                      isGenerating ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
                    }`}
                  >
                    {isGenerating ? (
                      <> Creating...</>
                    ) : (
                      <> Create Entry</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {structuredEntry && (
              <div className="mt-8 p-8 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl border-2 border-purple-700">
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-3xl">📖</span>
                  <h3 className="text-xl font-semibold text-gray-100">Your Journal Entry</h3>
                </div>
                
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg">{structuredEntry}</p>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={saveEntry}
                    disabled={saveStatus === "saving"}
                    className={`flex-1 py-3 rounded-lg transition ${
                      saveStatus === "saving"
                        ? "bg-gray-600 cursor-not-allowed"
                        : saveStatus === "success" || saveStatus === "updated"
                        ? "bg-green-600 text-white"
                        : "bg-purple-600 text-white hover:bg-purple-700"
                    }`}
                  >
                    {saveStatus === "saving" ? "💾 Saving..." : 
                     saveStatus === "success" ? "✓ Saved!" : 
                     saveStatus === "updated" ? "✓ Updated!" : 
                     "💾 Save Entry"}
                  </button>
                  <button
                    onClick={() => {
                      setStructuredEntry("");
                      setShowPreview(true);
                    }}
                    className="px-6 py-3 border border-gray-600 rounded-lg hover:bg-gray-700 transition"
                  >
                    New
                  </button>
                </div>
              </div>
            )}

            {!structuredEntry && !showPreview && (
              <div className="mt-8 pt-6 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-400 mb-3">
                  Progress: {Object.keys(answers).length} of {displayQuestions.length} questions answered
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {displayQuestions.map((q, idx) => (
                    <div 
                      key={q.id}
                      className={`text-xs p-2 rounded-lg flex items-center gap-1 ${
                        answers[idx] 
                          ? "bg-green-900/30 text-green-400" 
                          : "bg-gray-700/50 text-gray-500"
                      }`}
                    >
                      <span>{q.emoji}</span>
                      <span className="truncate flex-1">{q.question.substring(0, 20)}...</span>
                      {answers[idx] && <span className="ml-auto">✓</span>}
                    </div>
                  ))}
                  <div 
                    className={`text-xs p-2 rounded-lg flex items-center gap-1 ${
                      mood 
                        ? "bg-green-900/30 text-green-400" 
                        : "bg-gray-700/50 text-gray-500"
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

        {/* Mindset Selector Modal */}
        {showMindsetSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <MindsetSelector
              currentMindset={mindset}
              onSelect={handleMindsetChange}
              onClose={() => setShowMindsetSelector(false)}
            />
          </div>
        )}
      </div>

      {/* AI Bot Floating Button */}
 <button
  onClick={() => setShowAIBot(true)}
  className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50 group bg-transparent"
  title="Chat with Juno - Your AI companion"
>
  <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
  <div className="relative flex items-center justify-center w-full h-full">
    <img 
      src="/journalguide2.png" 
      alt="Journal Guide Logo" 
      className="w-12 h-12 object-cover rounded-full"
    />
    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></span>
  </div>
</button>
      {/* AI Bot Modal */}
      {showAIBot && (
        <AIBot
          mindset={mindset}
          onClose={() => setShowAIBot(false)}
        />
      )}
    </>
  );
}