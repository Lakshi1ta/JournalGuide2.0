const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = 'mongodb://localhost:27017/journal-guide';

console.log('🔍 Testing MongoDB connection...');
console.log('Connection string:', MONGODB_URI);

// Remove the options object
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log('Database:', mongoose.connection.db.databaseName);
    return mongoose.connection.db.listCollections().toArray();
  })
  .then(collections => {
    console.log('📊 Collections:', collections.map(c => c.name).join(', ') || 'No collections yet');
    console.log('✨ Test complete!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ FAILED:', err.message);
    process.exit(1);
  });