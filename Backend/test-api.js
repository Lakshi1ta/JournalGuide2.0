import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
console.log('API Key exists:', !!API_KEY);

const genAI = new GoogleGenerativeAI(API_KEY);

const test = async () => {
  try {
    console.log('🔍 Testing with model: gemini-3-flash-preview');
    
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    const result = await model.generateContent("Say 'Hello, journal app is working!' in a creative way");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success!');
    console.log('Response:', text);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
};

test();