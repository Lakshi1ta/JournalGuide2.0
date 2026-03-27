import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// @desc    Generate beautiful journal entry using Gemini
// @route   POST /api/gemini/generate
// @access  Private
export const generateJournalEntry = async (req, res) => {
  try {
    const { answers, mood, mindset } = req.body;

    console.log('📝 Generating natural journal entry...');
    console.log('Mood:', mood);
    console.log('Answers:', answers);

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

    // Join answers with context
    const answersText = answers.join('\n\n');

    const prompt = `You are helping someone write a personal journal entry. The person has answered some questions about their day. Your job is to turn their answers into ONE natural, flowing paragraph that sounds exactly like they wrote it themselves.

IMPORTANT RULES:
- Write like a real person talking to themselves
- Use simple, everyday language
- Keep their unique voice and personality
- Don't use fancy words or complex sentences
- Make it feel raw and authentic
- It should sound like someone journaling privately
- Fix grammar naturally without making it sound perfect
- Use phrases like "I feel...", "I think...", "I realize..."
- Keep their original style (short sentences, fragments, etc.)
- No AI-sounding phrases like "In conclusion" or "Furthermore"

Here are their answers:
${answersText}

Overall mood: ${mood.label} ${mood.emoji}
Date: ${date}

Write ONE paragraph that flows naturally. Make it sound like they're writing to themselves. Keep it under 150 words. Return ONLY the paragraph.`;

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
    
    const fallbackEntry = generateFallbackEntry(req.body.answers, req.body.mood);
    res.json({
      success: true,
      entry: fallbackEntry,
      usingFallback: true
    });
  }
};

// @desc    Test Gemini connection
// @route   GET /api/gemini/test
// @access  Private
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

// Natural fallback entry
function generateFallbackEntry(answers, mood) {
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let entry = `Today, ${date}, I'm feeling ${mood.label.toLowerCase()}. `;
  
  // Add each answer naturally
  answers.forEach((answer, i) => {
    if (answer) {
      if (i === 0) entry += `${answer} `;
      else if (i === 1) entry += `What mattered today was ${answer}. `;
      else if (i === 2) entry += `I'm trying to let go of ${answer}. `;
      else if (i === 3) entry += `I think about ${answer}. `;
      else if (i === 4) entry += `The best part was ${answer}. `;
      else if (i === 5) entry += `I learned that ${answer}. `;
      else if (i === 6) entry += `I'm grateful for ${answer}. `;
      else if (i === 7) entry += `Tomorrow, I want to ${answer}. `;
      else entry += `${answer} `;
    }
  });
  
  entry += `That's where my head is at today.`;
  
  return entry;
}