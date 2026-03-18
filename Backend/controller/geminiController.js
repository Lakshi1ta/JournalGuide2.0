import { GoogleGenerativeAI } from "@google/generative-ai";

// NO dotenv import - it's already loaded
console.log('🔑 Initializing Gemini Controller...');
console.log('🔑 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateJournalEntry = async (req, res) => {
  try {
    const { answers, mood } = req.body;

    console.log('📝 Generating journal entry...');

    if (!answers || answers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No answers provided'
      });
    }

    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const answersText = answers.map((ans, i) => {
      const questions = [
        "How are you feeling",
        "What matters today",
        "What weight to let go",
        "Would I be proud",
        "Best part of day",
        "Challenge and learning",
        "Gratitude",
        "Tomorrow's intention"
      ];
      return `${questions[i]}: ${ans}`;
    }).join('\n');

    const prompt = `You are a warm, thoughtful journaling assistant. Create a beautiful, reflective journal entry based on these answers:

Today's Mood: ${mood.emoji} ${mood.label}
Date: ${date}

User's reflections:
${answersText}

Write a SINGLE flowing paragraph that:
1. Weaves all reflections together naturally
2. Fixes grammar/spelling mistakes
3. Adds emotional depth and wisdom
4. Ends with a hopeful note

Return ONLY the paragraph, nothing else.`;

    console.log('🤖 Sending to Gemini...');
    
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedEntry = response.text();

    res.json({
      success: true,
      entry: generatedEntry.trim()
    });

  } catch (error) {
    console.error('❌ Gemini API Error:', error);
    
    const fallbackEntry = `Today, ${new Date().toLocaleDateString()}, was a ${req.body.mood?.label?.toLowerCase() || 'peaceful'} day. ${req.body.answers?.join(' ') || 'A day of reflection.'}`;
    
    res.json({
      success: true,
      entry: fallbackEntry,
      usingFallback: true
    });
  }
};

export const testGeminiConnection = async (req, res) => {
  try {
    console.log('🧪 Testing Gemini connection...');
    
    const model = genAI.getGenerativeModel({ model: "models/gemini-2.5-flash" });
    const result = await model.generateContent("Say 'connected' in one word");
    const response = await result.response;
    const text = response.text();
    
    res.json({
      success: true,
      message: 'Gemini is working!',
      response: text
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};