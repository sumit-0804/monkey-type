const words = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "is", "was", "are", "been", "has", "had", "were", "said", "did", "having",
  "may", "should", "could", "being", "might", "must", "shall", "can", "will", "would",
  "through", "between", "under", "where", "before", "after", "above", "below", "during", "without",
  "against", "among", "throughout", "despite", "towards", "upon", "concerning", "off", "right", "left",
  "program", "system", "computer", "software", "hardware", "network", "internet", "website", "application", "database",
  "function", "variable", "method", "class", "object", "array", "string", "number", "boolean", "return",
  "public", "private", "static", "void", "int", "double", "float", "char", "long", "short",
  "while", "for", "if", "else", "switch", "case", "break", "continue", "return", "try",
  "catch", "throw", "finally", "new", "delete", "this", "super", "extends", "implements", "interface",
  "package", "import", "export", "default", "const", "let", "var", "async", "await", "promise",
  "America", "London", "Google", "Microsoft", "Apple", "Internet", "Europe", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday", "Sunday", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December", "English", "French", "German", "Spanish",
  "thing", "point", "state", "world", "fact", "house", "night", "life", "mind", "water",
  "money", "head", "hand", "eye", "side", "business", "power", "change", "interest", "line",
  "member", "law", "car", "city", "community", "name", "president", "team", "minute", "idea",
  "kid", "body", "information", "back", "parent", "face", "others", "level", "office", "door",
  "health", "person", "art", "war", "history", "party", "result", "change", "morning", "reason",
  "research", "girl", "guy", "moment", "air", "teacher", "force", "education", "foot", "boy",
  "age", "policy", "everything", "love", "process", "music", "market", "sense", "nation", "plan",
  "college", "interest", "death", "experience", "effect", "use", "class", "control", "care", "field",
  "development", "role", "effort", "rate", "heart", "drug", "show", "leader", "light", "voice",
  "wife", "police", "mind", "finally", "pull", "return", "free", "military", "less", "hope",
  "even", "game", "account", "probably", "already", "listen", "stay", "history", "fall", "near",
  "page", "standard", "test", "focus", "wait", "clear", "south", "energy", "step", "ready",
  "across", "today", "record", "build", "enough", "strong", "modern", "support", "quite", "bring",
  "follow", "design", "case", "main", "top", "find", "large", "once", "low", "almost",
  "help", "road", "often", "short", "produce", "around", "base", "really", "though", "less",
  "stay", "before", "cut", "hot", "point", "full", "model", "show", "light", "end",
  "early", "late", "next", "hard", "easy", "real", "best", "total", "better", "each",
  "many", "few", "other", "some", "every", "all", "more", "most", "same", "different",
  "small", "large", "high", "low", "long", "short", "old", "young", "new", "early",
  "late", "good", "bad", "big", "little", "right", "wrong", "next", "last", "main",
  "even", "only", "also", "just", "very", "too", "back", "well", "down", "up"
];

const punctuationMarks = [",", ".", "!", "?", ";", ":", "'", '"', "-", "(", ")", "[", "]"];
const numberChars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * Generates normal typing text from an in-memory dictionary.
 * Does not make any external API calls.
 */
export function generateFromDictionary(
  wordCount: number = 50,
  includePunctuation: boolean = false,
  includeNumbers: boolean = false
): string {
  const result: string[] = [];

  for (let i = 0; i < wordCount; i++) {
    // Pick random word
    let word = words[Math.floor(Math.random() * words.length)];
    if (!word) word = "the"; // Type safety fallback

    // Add numbers randomly within words (20% chance if enabled)
    if (includeNumbers && Math.random() < 0.2) {
      const numCount = Math.floor(Math.random() * 3) + 1;
      const numberStr = Array.from({ length: numCount }, () => {
        const char = numberChars[Math.floor(Math.random() * numberChars.length)];
        return char || "1";
      }).join('');
      // Decide whether to append, prepend, or just use the number
      const pos = Math.random();
      if (pos < 0.33) {
        word = numberStr; // replace word entirely with number occasionally
      } else if (pos < 0.66) {
        word = word + numberStr;
      } else {
        word = numberStr + word;
      }
    }

    // Add punctuation if enabled
    if (includePunctuation) {
      // Capitalize first letter of sentence
      if (i === 0 || (i > 0 && ['.', '!', '?'].some(p => result[i - 1]?.includes(p)))) {
        if (!/^[A-Z]/.test(word)) {
          word = word.charAt(0).toUpperCase() + word.slice(1);
        }
      }

      // Add punctuation at end of word (15% chance)
      if (Math.random() < 0.15) {
        const punct = punctuationMarks[Math.floor(Math.random() * punctuationMarks.length)] || ".";
        word = word + punct;
      } else if ((i + 1) % 10 === 0 && i !== wordCount - 1) {
        // Add a period roughly every 10 words if we haven't added punctuation
        word = word + '.';
      }
    }

    result.push(word);
  }

  // Ensure last word has a period if punctuation is enabled
  if (includePunctuation && result.length > 0) {
    const lastWord = result[result.length - 1];
    if (lastWord && !['.', '!', '?'].some(p => lastWord.includes(p))) {
       // Replace any trailing punctuation with a period
       result[result.length - 1] = lastWord.replace(/[,;:'"\-\(\)\[\]]+$/, '') + '.';
    }
  }

  return result.join(' ');
}
