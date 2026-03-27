import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AIBot({ mindset, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-focus on input field when component loads
  useEffect(() => {
    fetchWelcomeMessage();
    // Focus the input field after component mounts
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Auto-focus after bot responds
  useEffect(() => {
    if (!isTyping) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isTyping]);

  const fetchWelcomeMessage = async () => {
    try {
      const response = await axios.get(`https://als-journal.onrender.com/api/aibot/welcome?mindset=${mindset}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      setMessages([{
        id: Date.now(),
        text: response.data.message,
        sender: "bot",
        timestamp: new Date()
      }]);
    } catch (error) {
      setMessages([{
        id: Date.now(),
        text: "Hey! I'm here for you. How are you feeling today? 💙",
        sender: "bot",
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/aibot/chat",
        {
          message: inputMessage,
          conversationHistory: messages.map(m => ({
            role: m.sender,
            content: m.text
          })),
          mindset: mindset
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }
      );

      const botMessage = {
        id: Date.now() + 1,
        text: response.data.reply,
        sender: "bot",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm here for you. Want to tell me more? 💙",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden shadow-2xl border border-gray-700">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <img src="/journalguide2.png" alt="Journal Guide Logo" />
              </div>
              <div>
                <h2 className="text-white font-semibold">Juno</h2>
                <p className="text-purple-200 text-xs">Just a friend listening</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                  msg.sender === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-gray-800 text-gray-200 rounded-bl-none"
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <p className={`text-xs mt-1 ${
                  msg.sender === "user" ? "text-purple-200" : "text-gray-500"
                }`}>
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl rounded-bl-none px-4 py-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type here..."
              className="flex-1 px-4 py-3 bg-gray-700 text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-500"
              disabled={isTyping}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !inputMessage.trim()}
              className={`px-6 py-3 rounded-xl transition ${
                isTyping || !inputMessage.trim()
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              } text-white`}
            >
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Just type. I'm listening.
          </p>
        </div>
      </div>
    </div>
  );
}