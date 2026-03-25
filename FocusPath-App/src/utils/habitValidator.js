// AI-style habit category validator
// Checks if a habit description matches the selected category

const PHYSICAL_KEYWORDS = [
  'run', 'jog', 'walk', 'gym', 'lift', 'workout', 'exercise', 'pushup', 'push-up',
  'pullup', 'pull-up', 'squat', 'plank', 'stretch', 'yoga', 'swim', 'bike', 'cycle',
  'hike', 'climb', 'jump', 'sprint', 'cardio', 'weightlifting', 'boxing', 'martial',
  'basketball', 'football', 'soccer', 'tennis', 'sports', 'train', 'abs', 'situp',
  'sit-up', 'burpee', 'lunge', 'deadlift', 'bench', 'press', 'curl', 'row',
  'jumping jack', 'skipping', 'skip rope', 'jump rope', 'dance', 'fitness',
  'mile', 'steps', 'water', 'hydrate', 'drink water', 'sleep', 'eat healthy',
  'diet', 'nutrition', 'cold shower', 'shower', 'morning routine',
];

const SPIRITUAL_KEYWORDS = [
  'pray', 'prayer', 'salah', 'salat', 'fajr', 'dhuhr', 'asr', 'maghrib', 'isha',
  'quran', "qur'an", 'read quran', 'surah', 'ayah', 'dhikr', 'zikr', 'thikr',
  'tasbih', 'istighfar', 'dua', 'supplication', 'mosque', 'masjid', 'jummah',
  'friday prayer', 'tahajjud', 'qiyam', 'fasting', 'fast', 'ramadan', 'charity',
  'sadaqah', 'zakat', 'allah', 'god', 'worship', 'devotion', 'faith',
  'bible', 'church', 'temple', 'meditate', 'meditation', 'mindful', 'gratitude',
  'thankful', 'grateful', 'reflect', 'spiritual', 'soul', 'forgive', 'forgiveness',
  'patience', 'sabr', 'tawakkul', 'trust in god', 'hadith', 'sunnah', 'seerah',
  'islamic', 'recite', 'memorize quran', 'hifz', 'tafsir', 'tajweed',
];

const MENTAL_KEYWORDS = [
  'read', 'book', 'pages', 'journal', 'write', 'writing', 'study', 'learn',
  'course', 'class', 'lecture', 'podcast', 'audiobook', 'article', 'research',
  'puzzle', 'chess', 'brain', 'memory', 'focus', 'concentrate', 'think',
  'plan', 'organize', 'schedule', 'goal', 'vision board', 'affirmation',
  'therapy', 'counseling', 'mental health', 'self-care', 'mindfulness',
  'breathing', 'calm', 'relax', 'stress', 'anxiety', 'code', 'coding',
  'programming', 'language', 'vocabulary', 'math', 'science', 'history',
  'philosophy', 'creative', 'draw', 'paint', 'art', 'music', 'instrument',
  'guitar', 'piano', 'practice', 'skill', 'hobby', 'no phone', 'screen time',
  'digital detox', 'limit social media', 'news', 'education',
];

function getMatchScore(text, keywords) {
  const lower = text.toLowerCase();
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) {
      score += kw.split(' ').length; // multi-word matches score higher
    }
  }
  return score;
}

function getCategoryName(key) {
  return key === 'physical' ? 'Physical' : key === 'spiritual' ? 'Spiritual' : 'Mental';
}

function getSuggestedCategory(text) {
  const scores = {
    physical: getMatchScore(text, PHYSICAL_KEYWORDS),
    spiritual: getMatchScore(text, SPIRITUAL_KEYWORDS),
    mental: getMatchScore(text, MENTAL_KEYWORDS),
  };

  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best[1] > 0) return best[0];
  return null;
}

export function validateHabitCategory(habitText, selectedCategory) {
  const selected = getCategoryName(selectedCategory);
  const scores = {
    physical: getMatchScore(habitText, PHYSICAL_KEYWORDS),
    spiritual: getMatchScore(habitText, SPIRITUAL_KEYWORDS),
    mental: getMatchScore(habitText, MENTAL_KEYWORDS),
  };

  const selectedScore = scores[selectedCategory];
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];

  // If no keywords matched at all, allow it (could be a custom/niche habit)
  if (best[1] === 0) {
    return { valid: true };
  }

  // If the selected category has the highest or tied score, it's valid
  if (selectedScore >= best[1]) {
    return { valid: true };
  }

  // The selected category doesn't match — suggest the right one
  const suggestedName = getCategoryName(best[0]);

  // Build a helpful message
  const messages = {
    physical: {
      spiritual: `"${habitText}" sounds more like a Spiritual habit. Physical habits involve body movement and exercise.`,
      mental: `"${habitText}" sounds more like a Mental habit. Physical habits involve body movement and fitness.`,
    },
    spiritual: {
      physical: `"${habitText}" sounds more like a Physical habit. Spiritual habits involve prayer, worship, and faith.`,
      mental: `"${habitText}" sounds more like a Mental habit. Spiritual habits involve prayer, worship, and faith.`,
    },
    mental: {
      physical: `"${habitText}" sounds more like a Physical habit. Mental habits involve reading, learning, and thinking.`,
      spiritual: `"${habitText}" sounds more like a Spiritual habit. Mental habits involve reading, learning, and thinking.`,
    },
  };

  const message = messages[selectedCategory]?.[best[0]]
    || `This habit seems more like a ${suggestedName} habit than ${selected}. Try switching the category.`;

  return {
    valid: false,
    message,
    suggestedCategory: best[0],
  };
}
