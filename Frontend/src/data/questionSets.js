
export const questionSets = {
  overthinking: {
    name: "Overthinking / Overwhelmed",
    emoji: "😵",
    description: "Reduce mental noise and bring clarity",
    color: "from-purple-500 to-indigo-500",
    questions: [
      { id: "ot1", question: "What's on your mind right now?", placeholder: "Let it out...", type: "text" },
      { id: "ot2", question: "What's bothering you the most about this?", placeholder: "The main thing that's troubling you...", type: "text" },
      { id: "ot3", question: "What are you overthinking repeatedly?", placeholder: "What thoughts keep looping?", type: "text" },
      { id: "ot4", question: "What is the worst-case scenario you're imagining?", placeholder: "What's the worst that could happen?", type: "text" },
      { id: "ot5", question: "How likely is that worst-case scenario actually?", placeholder: "Rate from 1-10...", type: "text" },
      { id: "ot6", question: "What part of this situation is in your control?", placeholder: "What can you actually do?", type: "text" },
      { id: "ot7", question: "What part is completely out of your control?", placeholder: "What must you let go of?", type: "text" },
      { id: "ot8", question: "What would you say to a friend in the same situation?", placeholder: "What advice would you give?", type: "text" },
      { id: "ot9", question: "What's one small step you can take right now?", placeholder: "A tiny action you can do...", type: "text" },
      { id: "ot10", question: "If this didn't matter in 5 years, how would you feel about it today?", placeholder: "Gain perspective...", type: "text" }
    ]
  },
  stressed: {
    name: "Stress / Anxiety",
    emoji: "😰",
    description: "Calm your mind and ground yourself",
    color: "from-orange-500 to-red-500",
    questions: [
      { id: "st1", question: "What is making you feel stressed right now?", placeholder: "Identify the source...", type: "text" },
      { id: "st2", question: "When did this feeling start?", placeholder: "When did it begin?", type: "text" },
      { id: "st3", question: "What triggered this stress?", placeholder: "What set it off?", type: "text" },
      { id: "st4", question: "Where do you feel this stress in your body?", placeholder: "Shoulders, chest, stomach...", type: "text" },
      { id: "st5", question: "What thoughts are running through your mind?", placeholder: "What are you telling yourself?", type: "text" },
      { id: "st6", question: "What usually helps you feel calm?", placeholder: "What works for you?", type: "text" },
      { id: "st7", question: "What is one small thing you can do to relax?", placeholder: "A simple calming action...", type: "text" },
      { id: "st8", question: "Is there anything you're avoiding because of this stress?", placeholder: "What are you putting off?", type: "text" },
      { id: "st9", question: "What would help you feel even 10% better right now?", placeholder: "A small improvement...", type: "text" }
    ]
  },
  confused: {
    name: "Confusion / Lack of Clarity",
    emoji: "🤔",
    description: "Find direction and make decisions",
    color: "from-blue-500 to-cyan-500",
    questions: [
      { id: "cn1", question: "What are you confused about right now?", placeholder: "What's unclear?", type: "text" },
      { id: "cn2", question: "What decision are you trying to make?", placeholder: "What choice are you facing?", type: "text" },
      { id: "cn3", question: "What options do you currently have?", placeholder: "List your options...", type: "text" },
      { id: "cn4", question: "What are the pros of each option?", placeholder: "The good parts...", type: "text" },
      { id: "cn5", question: "What are the cons of each option?", placeholder: "The downsides...", type: "text" },
      { id: "cn6", question: "What feels right to you emotionally?", placeholder: "Trust your gut...", type: "text" },
      { id: "cn7", question: "What is stopping you from deciding?", placeholder: "What's holding you back?", type: "text" },
      { id: "cn8", question: "What would happen if you made no decision?", placeholder: "What if you wait?", type: "text" },
      { id: "cn9", question: "What would your future self advise you to do?", placeholder: "Imagine you in 5 years...", type: "text" },
      { id: "cn10", question: "What is one step you can take today toward clarity?", placeholder: "A small step forward...", type: "text" }
    ]
  },
  healing: {
    name: "Emotional Healing",
    emoji: "💔",
    description: "Express and release emotions",
    color: "from-pink-500 to-rose-500",
    questions: [
      { id: "hl1", question: "What are you feeling right now?", placeholder: "Name your emotions...", type: "text" },
      { id: "hl2", question: "What caused this feeling?", placeholder: "What triggered this?", type: "text" },
      { id: "hl3", question: "What do you miss the most?", placeholder: "What are you longing for?", type: "text" },
      { id: "hl4", question: "What hurt you the most?", placeholder: "The deepest pain...", type: "text" },
      { id: "hl5", question: "What are you struggling to accept?", placeholder: "What's hard to accept?", type: "text" },
      { id: "hl6", question: "What would you say if you could express everything freely?", placeholder: "Let it all out...", type: "text" },
      { id: "hl7", question: "What have you learned from this experience?", placeholder: "What wisdom did you gain?", type: "text" },
      { id: "hl8", question: "What part of this situation made you stronger?", placeholder: "Your hidden strength...", type: "text" },
      { id: "hl9", question: "What do you need right now to feel better?", placeholder: "What would comfort you?", type: "text" },
      { id: "hl10", question: "What does healing look like for you?", placeholder: "Imagine your healed self...", type: "text" }
    ]
  },
  growth: {
    name: "Self-Growth / Reflection",
    emoji: "🌱",
    description: "Improve awareness and grow daily",
    color: "from-green-500 to-emerald-500",
    questions: [
      { id: "gr1", question: "How was your day overall?", placeholder: "Describe your day...", type: "text" },
      { id: "gr2", question: "What went well today?", placeholder: "Your wins, big or small...", type: "text" },
      { id: "gr3", question: "What didn't go as planned?", placeholder: "What could be better?", type: "text" },
      { id: "gr4", question: "What did you learn today?", placeholder: "New insights...", type: "text" },
      { id: "gr5", question: "What are you proud of today?", placeholder: "Something you did well...", type: "text" },
      { id: "gr6", question: "What could you have done better?", placeholder: "Room for improvement...", type: "text" },
      { id: "gr7", question: "What habits are helping you grow?", placeholder: "Your positive habits...", type: "text" },
      { id: "gr8", question: "What habits are holding you back?", placeholder: "What's limiting you?", type: "text" },
      { id: "gr9", question: "What is one thing you want to improve?", placeholder: "Your next goal...", type: "text" },
      { id: "gr10", question: "What is one goal for tomorrow?", placeholder: "A small intention...", type: "text" }
    ]
  },
  daily: {
    name: "General Journaling",
    emoji: "✍️",
    description: "Free expression, just write",
    color: "from-gray-500 to-gray-600",
    questions: [
      { id: "dj1", question: "What do you want to write about today?", placeholder: "Whatever comes to mind...", type: "text" },
      { id: "dj2", question: "How are you feeling right now?", placeholder: "Check in with yourself...", type: "text" },
      { id: "dj3", question: "What is on your mind?", placeholder: "What's occupying your thoughts?", type: "text" },
      { id: "dj4", question: "What stood out to you today?", placeholder: "A moment that mattered...", type: "text" },
      { id: "dj5", question: "What are you grateful for?", placeholder: "Three things you appreciate...", type: "text" },
      { id: "dj6", question: "What challenged you today?", placeholder: "Your obstacles...", type: "text" },
      { id: "dj7", question: "What made you happy?", placeholder: "Your joy moments...", type: "text" },
      { id: "dj8", question: "What are you thinking about lately?", placeholder: "Recurring thoughts...", type: "text" },
      { id: "dj9", question: "What do you want to let go of?", placeholder: "Release what no longer serves you...", type: "text" },
      { id: "dj10", question: "What do you want more of in life?", placeholder: "Your desires and dreams...", type: "text" }
    ]
  }
};

export const mindsetOptions = [
  { 
    id: "overthinking", 
    emoji: "😵", 
    label: "Overthinking / Overwhelmed", 
    description: "Clear your mind and find peace",
    color: "purple" 
  },
  { 
    id: "stressed", 
    emoji: "😰", 
    label: "Stressed / Anxious", 
    description: "Calm your nerves and breathe",
    color: "orange" 
  },
  { 
    id: "confused", 
    emoji: "🤔", 
    label: "Confused / Lack of Clarity", 
    description: "Find direction and answers",
    color: "blue" 
  },
  { 
    id: "healing", 
    emoji: "💔", 
    label: "Emotional Healing", 
    description: "Heal and process your emotions",
    color: "pink" 
  },
  { 
    id: "growth", 
    emoji: "🌱", 
    label: "Self-Growth / Reflection", 
    description: "Grow and become better",
    color: "green" 
  },
  { 
    id: "daily", 
    emoji: "✍️", 
    label: "Just Journaling", 
    description: "Free expression, no pressure",
    color: "gray" 
  }
];