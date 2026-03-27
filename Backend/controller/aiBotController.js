import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Chat with AI companion bot
// @route   POST /api/aibot/chat
// @access  Private
export const chatWithBot = async (req, res) => {
  try {
    const { message, conversationHistory, mindset } = req.body;

    console.log('💬 AI Bot chat request:', message);

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'No message provided'
      });
    }

    const lowerMessage = message.toLowerCase().trim();
    
    // Check if user is saying something sweet/positive about the bot
    const sweetMessages = ['sweet of you', 'made me smile', 'nice of you', 'you are nice', 'you make me happy', 'i love talking to you', 'you helped me'];
    const isSweetMessage = sweetMessages.some(word => lowerMessage.includes(word));
    
    if (isSweetMessage) {
      const sweetResponses = [
        "Aww, that really means a lot to me! 🥰 I'm glad I could make you smile. So tell me more - how are you really feeling today?",
        "That just made my day! 😊 You're really kind. What's been going on in your world lately?",
        "I'm so happy to hear that! 💙 It makes me smile knowing I could help. What's on your mind right now?",
        "That's so sweet of you to say! 🥹 I'm here for you. How has your day been otherwise?",
        "You're making me smile now too! 😊 Tell me more about your day. What's been happening?"
      ];
      const reply = sweetResponses[Math.floor(Math.random() * sweetResponses.length)];
      return res.json({ success: true, reply });
    }
    
    // Check for goodbye messages
    const goodbyeMessages = ['bye', 'goodbye', 'bye bye', 'talk later', 'gtg', 'gotta go', 'see you', 'bye for now'];
    const isGoodbye = goodbyeMessages.some(word => lowerMessage.includes(word));
    
    if (isGoodbye) {
      const goodbyeResponses = [
        "Take care! I'm here whenever you need me. 💙",
        "Bye for now. Hope you feel better. Reach out anytime. 🫂",
        "Goodbye! Remember, I'm always here to listen. Take care. 🌱"
      ];
      const reply = goodbyeResponses[Math.floor(Math.random() * goodbyeResponses.length)];
      return res.json({ success: true, reply });
    }
    
    // Check for random topics (movies, TV shows, cooking, books, etc.)
    const randomTopics = [
      'movie', 'show', 'tv', 'television', 'series', 'netflix', 'prime', 'hulu',
      'cook', 'recipe', 'food', 'dinner', 'lunch', 'breakfast', 'restaurant',
      'book', 'read', 'author', 'novel', 'best seller',
      'song', 'music', 'album', 'artist', 'band',
      'game', 'play', 'video game', 'xbox', 'playstation',
      'travel', 'vacation', 'trip', 'beach', 'mountain',
      'sport', 'football', 'cricket', 'basketball'
    ];
    
    const isRandomTopic = randomTopics.some(word => lowerMessage.includes(word));
    
    if (isRandomTopic) {
      const redirectResponses = [
        "I'd love to chat about that, but I'm here to listen to your feelings! 😊 How are you really doing today?",
        "That sounds fun! But tell me - how's your heart feeling right now? 💙",
        "Interesting! But I'm more curious about you. What's been on your mind lately?",
        "I'm your journaling friend! Let's focus on your feelings. How's your day going? 🫂",
        "We can chat about that later! Right now, I want to know - how are you really feeling?"
      ];
      const reply = redirectResponses[Math.floor(Math.random() * redirectResponses.length)];
      return res.json({ success: true, reply });
    }
    
    // Check for positive short responses
    const positiveShort = ['good', 'great', 'fine', 'okay', 'alright', 'not bad', 'feeling good', 'im good', 'i am good'];
    const isPositiveShort = positiveShort.some(word => lowerMessage.includes(word)) && message.length < 20;
    
    if (isPositiveShort) {
      const followUpResponses = [
        "That's nice! What made today good? 💙",
        "Glad to hear that! Anything special happen?",
        "Awesome! What's one thing that made you smile today? 🌟",
        "Happy to hear that! What's been going well for you?",
        "That's great! Want to share what's making you feel good?"
      ];
      const reply = followUpResponses[Math.floor(Math.random() * followUpResponses.length)];
      return res.json({ success: true, reply });
    }
    
    // Check for negative feelings
    const negativeFeelings = ['bad', 'sad', 'stressed', 'anxious', 'tired', 'exhausted', 'depressed', 'upset', 'angry', 'frustrated'];
    const isNegative = negativeFeelings.some(word => lowerMessage.includes(word));
    
    if (isNegative) {
      const comfortResponses = [
        "I'm sorry you're feeling that way. Want to talk about what's bothering you? 🫂",
        "That sounds hard. I'm here to listen. What's going on?",
        "I hear you. Sometimes days are tough. Want to share more? 💙",
        "You're not alone in this. Tell me what's on your mind.",
        "I'm here for you. What's been weighing on your heart?"
      ];
      const reply = comfortResponses[Math.floor(Math.random() * comfortResponses.length)];
      return res.json({ success: true, reply });
    }

    // Get last few messages to avoid repetition
    const lastMessages = conversationHistory?.slice(-3).map(m => m.content) || [];
    
    // Create system prompt with context to avoid repetition
    let systemPrompt = `You are Journey, a caring friend who listens and responds naturally. You're having a conversation with someone who's journaling.

PREVIOUS MESSAGES (to avoid repeating yourself):
${lastMessages.map((msg, i) => `${i+1}. ${msg}`).join('\n')}

YOUR PERSONALITY:
- Warm and caring
- Ask natural follow-up questions based on what they just said
- Show genuine curiosity
- Never repeat the same phrase twice
- Keep responses short (1-2 sentences usually)

RESPONSE STYLES:
- If they compliment you → say thank you warmly and ask about them
- If they're sharing a story → ask "What happened next?" or "How did that make you feel?"
- If they're venting → say "I hear you" or "That sounds really tough"
- If they're happy → celebrate with them
- If they're confused → help them think through it
- If they mention something vague → ask for details
- If they answered your question → acknowledge it and ask something new

User's message: "${message}"

Your natural, caring response (short, like a real friend, and DIFFERENT from your previous responses):`;

    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    let botReply = response.text();

    // Clean up response
    botReply = botReply.replace(/["']/g, '').trim();

    // Ensure response isn't too long
    if (botReply.split(' ').length > 20) {
      botReply = botReply.split(' ').slice(0, 18).join(' ') + '...';
    }

    res.json({
      success: true,
      reply: botReply
    });

  } catch (error) {
    console.error('❌ AI Bot Error:', error);
    
    const fallbackReplies = [
      "I'm here for you. What's on your mind? 💙",
      "Tell me more about how you're feeling.",
      "That's really nice. How are you doing?",
      "I'm listening. How are you really feeling right now?"
    ];
    
    res.json({
      success: true,
      reply: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)]
    });
  }
};

// @desc    Get welcome message from bot
// @route   GET /api/aibot/welcome
// @access  Private
export const getWelcomeMessage = async (req, res) => {
  try {
    const { mindset } = req.query;
    
    const welcomeMessages = {
      overthinking: "Hey, I'm here. What's on your mind today? 💙",
      stressed: "Hey there. Want to share what's stressing you? I'm listening. 🫂",
      healing: "Hi. How are you really feeling today? I'm here for you. 🌱",
      confused: "Hey. What's been confusing you lately? Let's talk it through. 🤔",
      growth: "Hey! What's on your mind today? I'd love to hear. 🌟",
      daily: "Hey! How's your day going? I'm here to listen. 💙"
    };
    
    res.json({
      success: true,
      message: welcomeMessages[mindset] || "Hey! How are you feeling today? 💙"
    });
  } catch (error) {
    res.json({
      success: true,
      message: "Hey! How are you feeling today? 💙"
    });
  }
};