import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from the correct path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

console.log('📁 Environment loaded from:', path.join(__dirname, '..', '.env'));
console.log('🔑 GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
console.log('🔑 GEMINI_API_KEY prefix:', process.env.GEMINI_API_KEY?.substring(0, 15) + '...');

export default process.env;