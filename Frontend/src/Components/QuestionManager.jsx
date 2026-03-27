import React from "react";
import { useState, useEffect } from "react";
import axios from "axios";
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaArrowUp, FaArrowDown } from "react-icons/fa";

export default function QuestionManager({ onClose, onQuestionsUpdate }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    emoji: "📝",
    placeholder: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get("https://als-journal.onrender.com/api/auth/questions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setQuestions(response.data.questions);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestions = async () => {
    try {
      setSaveStatus("saving");
      await axios.put("https://als-journal.onrender.com/api/auth/questions", 
        { questions },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setSaveStatus("success");
      setTimeout(() => setSaveStatus(""), 2000);
      if (onQuestionsUpdate) onQuestionsUpdate();
    } catch (error) {
      console.error("Error saving questions:", error);
      setSaveStatus("error");
    }
  };

  const handleResetToDefault = async () => {
    if (window.confirm("Reset all questions to default? Your custom questions will be lost.")) {
      try {
        await axios.post("https://als-journal.onrender.com/api/auth/questions/reset", {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        await fetchQuestions();
        if (onQuestionsUpdate) onQuestionsUpdate();
      } catch (error) {
        console.error("Error resetting questions:", error);
      }
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.question.trim()) {
      alert("Please enter a question");
      return;
    }
    
    try {
      const response = await axios.post("https://als-journal.onrender.com/api/auth/questions",
        newQuestion,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setQuestions([...questions, response.data.question]);
      setNewQuestion({ question: "", emoji: "📝", placeholder: "" });
      setShowAddForm(false);
      if (onQuestionsUpdate) onQuestionsUpdate();
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const handleRemoveQuestion = async (id, isDefault) => {
    if (isDefault) {
      alert("Default questions cannot be removed. You can hide them by creating your own.");
      return;
    }
    
    if (window.confirm("Are you sure you want to remove this question?")) {
      try {
        await axios.delete(`https://als-journal.onrender.com/api/auth/questions/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setQuestions(questions.filter(q => q.id !== id));
        if (onQuestionsUpdate) onQuestionsUpdate();
      } catch (error) {
        console.error("Error removing question:", error);
      }
    }
  };

  const handleEditQuestion = (id, currentText) => {
    setEditingId(id);
    setEditValue(currentText);
  };

  const handleSaveEdit = (id) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, question: editValue } : q
    ));
    setEditingId(null);
  };

  const handleMoveQuestion = (index, direction) => {
    const newQuestions = [...questions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    setQuestions(newQuestions);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Customize Your Journal</h2>
          <p className="text-gray-400 text-sm mt-1">Add, remove, or reorder your journal questions</p>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Save Status */}
      {saveStatus && (
        <div className={`mb-4 p-3 rounded-lg ${
          saveStatus === "success" ? "bg-green-900/30 text-green-400" :
          saveStatus === "error" ? "bg-red-900/30 text-red-400" :
          "bg-yellow-900/30 text-yellow-400"
        }`}>
          {saveStatus === "success" ? "✓ Questions saved!" : 
           saveStatus === "error" ? "✗ Failed to save" : 
           "💾 Saving..."}
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-3 mb-6">
        {questions.map((q, index) => (
          <div key={q.id} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{q.emoji}</span>
              
              {editingId === q.id ? (
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onBlur={() => handleSaveEdit(q.id)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(q.id)}
                  autoFocus
                  className="flex-1 bg-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              ) : (
                <div className="flex-1">
                  <p className="text-gray-100">{q.question}</p>
                  {q.isDefault && (
                    <span className="text-xs text-purple-400">Default</span>
                  )}
                </div>
              )}
              
              <div className="flex gap-1">
                <button
                  onClick={() => handleMoveQuestion(index, 'up')}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  disabled={index === 0}
                >
                  <FaArrowUp className="text-gray-400 text-sm" />
                </button>
                <button
                  onClick={() => handleMoveQuestion(index, 'down')}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                  disabled={index === questions.length - 1}
                >
                  <FaArrowDown className="text-gray-400 text-sm" />
                </button>
                <button
                  onClick={() => handleEditQuestion(q.id, q.question)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition"
                >
                  <FaEdit className="text-gray-400" />
                </button>
                <button
                  onClick={() => handleRemoveQuestion(q.id, q.isDefault)}
                  className="p-2 hover:bg-red-900/30 rounded-lg transition"
                >
                  <FaTrash className="text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add New Question */}
      {showAddForm ? (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 mb-4">
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newQuestion.emoji}
              onChange={(e) => setNewQuestion({ ...newQuestion, emoji: e.target.value })}
              placeholder="Emoji"
              className="w-20 bg-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="text"
              value={newQuestion.question}
              onChange={(e) => setNewQuestion({ ...newQuestion, question: e.target.value })}
              placeholder="Your question..."
              className="flex-1 bg-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <input
            type="text"
            value={newQuestion.placeholder}
            onChange={(e) => setNewQuestion({ ...newQuestion, placeholder: e.target.value })}
            placeholder="Placeholder (optional)"
            className="w-full bg-gray-700 text-gray-100 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddQuestion}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Add Question
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-3 border-2 border-dashed border-gray-700 rounded-xl text-gray-400 hover:border-purple-500 hover:text-purple-400 transition flex items-center justify-center gap-2"
        >
          <FaPlus /> Add Your Own Question
        </button>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleSaveQuestions}
          className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
        >
          Save Changes
        </button>
        <button
          onClick={handleResetToDefault}
          className="px-6 py-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 transition"
        >
          Reset to Default
        </button>
      </div>
    </div>
  );
}