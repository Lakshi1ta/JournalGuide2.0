import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

console.log('Mongoose version:', mongoose.version);

const testSchema = new mongoose.Schema({
  name: String
});

testSchema.pre('save', function(next) {
  console.log('Next is a function?', typeof next === 'function');
  console.log('Next type:', typeof next);
  next();
});

const Test = mongoose.model('Test', testSchema);

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const doc = new Test({ name: 'test' });
    await doc.save();
    console.log('Test document saved');
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
};

test();