import JournalEntry from '../models/JournalEntry.js';

// @desc    Create a new journal entry (or update if exists for today)
// @route   POST /api/journal
// @access  Private
export const createJournalEntry = async (req, res) => {
  try {
    const { mood, content, answers, mindset, questions } = req.body;
    
    // Get start and end of today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if user already has an entry for today
    const existingEntry = await JournalEntry.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (existingEntry) {
      // Update existing entry
      existingEntry.mood = mood;
      existingEntry.content = content;
      existingEntry.answers = answers;
      existingEntry.mindset = mindset;
      existingEntry.questions = questions;
      existingEntry.updatedAt = new Date();
      
      await existingEntry.save();
      
      return res.json({
        success: true,
        data: existingEntry,
        message: 'Journal entry updated successfully',
        isUpdate: true
      });
    }

    // Create new entry
    const journalEntry = await JournalEntry.create({
      user: req.user.id,
      mood,
      content,
      answers,
      mindset,
      questions,
      date: new Date()
    });

    res.status(201).json({
      success: true,
      data: journalEntry,
      message: 'Journal entry created successfully',
      isUpdate: false
    });

  } catch (error) {
    console.error('Error creating/updating journal entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update journal entry'
    });
  }
};

// @desc    Get today's journal entry if exists
// @route   GET /api/journal/today
// @access  Private
export const getTodaysJournal = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await JournalEntry.findOne({
      user: req.user.id,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    res.json({
      success: true,
      hasEntry: !!entry,
      entry: entry || null
    });
  } catch (error) {
    console.error('Error fetching today\'s entry:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch today\'s entry'
    });
  }
};

// @desc    Get all journal entries for logged in user
// @route   GET /api/journal
// @access  Private
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

// @desc    Get journal statistics for user
// @route   GET /api/journal/stats
// @access  Private
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

// @desc    Delete journal entry
// @route   DELETE /api/journal/:id
// @access  Private
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