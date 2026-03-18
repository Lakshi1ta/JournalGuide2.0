import JournalEntry from '../models/JournalEntry.js';

export const createJournalEntry = async (req, res) => {
  try {
    const { mood, content, date } = req.body;

    const journalEntry = await JournalEntry.create({
      user: req.user.id,
      mood,
      content,
      date: date || Date.now()
    });

    res.status(201).json({
      success: true,
      data: journalEntry
    });
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create journal entry'
    });
  }
};

export const getJournalEntries = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id })
      .sort({ date: -1 });

    res.json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch journal entries'
    });
  }
};

export const getJournalStats = async (req, res) => {
  try {
    const entries = await JournalEntry.find({ user: req.user.id });
    
    const totalEntries = entries.length;
    
    // Calculate streak
    let streak = 0;
    if (entries.length > 0) {
      const sortedEntries = entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const latestEntryDate = new Date(sortedEntries[0].date);
      latestEntryDate.setHours(0, 0, 0, 0);
      
      const diffTime = today - latestEntryDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      
      if (diffDays <= 1) {
        streak = 1;
        let currentDate = latestEntryDate;
        for (let i = 1; i < sortedEntries.length; i++) {
          const entryDate = new Date(sortedEntries[i].date);
          entryDate.setHours(0, 0, 0, 0);
          
          const expectedPrevDate = new Date(currentDate);
          expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
          
          if (entryDate.getTime() === expectedPrevDate.getTime()) {
            streak++;
            currentDate = entryDate;
          } else {
            break;
          }
        }
      }
    }
    
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const recentEntries = entries.filter(entry => 
      new Date(entry.date) >= last7Days
    ).length;
    
    const moodCounts = {};
    entries.forEach(entry => {
      if (entry.mood && entry.mood.label) {
        moodCounts[entry.mood.label] = (moodCounts[entry.mood.label] || 0) + 1;
      }
    });

    res.json({
      success: true,
      data: {
        totalEntries,
        streak,
        recentEntries,
        moodCounts
      }
    });
  } catch (error) {
    console.error('Error fetching journal stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch journal statistics'
    });
  }
};

export const deleteJournalEntry = async (req, res) => {
  try {
    const entry = await JournalEntry.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        error: 'Journal entry not found'
      });
    }

    await entry.deleteOne();

    res.json({
      success: true,
      message: 'Journal entry deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete journal entry'
    });
  }
};