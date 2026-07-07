//
// Shared Utilities
//

// Generic timeout wrapper for fetch
async function safeFetch(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeout);
    return res;
  } catch (err) {
    clearTimeout(timeout);
    console.error(`[safeFetch] Error fetching ${url}:`, err);
    return null;
  }
}

// Standardized definition extractor for DictionaryAPI-like responses
function extractDictionaryDefinition(data) {
  return {
    definition:
      data?.[0]?.meanings?.[0]?.definitions?.[0]?.definition ||
      "No definition found.",
    audio: data?.[0]?.phonetics?.find(p => p.audio)?.audio || ""
  };
}

// Standard fallback definition
const FALLBACK_DEF = { definition: "No definition found.", audio: "" };

// Random helper
const pickRandom = arr => arr[Math.floor(Math.random() * arr.length)];

const pipelines = {
  //
  // 1. Simple Words (Kids)
  //
  "SimpleWords": {
    name: "Simple Words (Ages 5–10)",

    async getWord() {
      const url = "https://random-word-api.herokuapp.com/word?number=1";
      const res = await safeFetch(url);
      if (!res || !res.ok) return "error";

      const data = await res.json();
      return (data?.[0] || "error").toLowerCase();
    },

    async getDefinition(word) {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const res = await safeFetch(url);
      if (!res || !res.ok) return FALLBACK_DEF;

      const data = await res.json();
      return extractDictionaryDefinition(data);
    }
  },

  //
  // 2. Datamuse Medium Difficulty
  //
  "DatamuseMedium": {
    name: "Datamuse Medium Difficulty",

    async getWord() {
      const url = "https://api.datamuse.com/words?sp=????&max=1000";
      const res = await safeFetch(url);
      if (!res || !res.ok) return "error";

      const data = await res.json();
      const pick = pickRandom(data);
      return pick?.word?.toLowerCase() || "error";
    },

    async getDefinition(word) {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const res = await safeFetch(url);
      if (!res || !res.ok) return FALLBACK_DEF;

      const data = await res.json();
      return extractDictionaryDefinition(data);
    }
  },

  //
  // 3. DictionaryAPI (Balanced)
  //
  "DictionaryAPI": {
    name: "DictionaryAPI (Balanced)",

    async getWord() {
      const url = "https://random-word-api.herokuapp.com/word";
      const res = await safeFetch(url);
      if (!res || !res.ok) return "error";

      const data = await res.json();
      return (data?.[0] || "error").toLowerCase();
    },

    async getDefinition(word) {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const res = await safeFetch(url);
      if (!res || !res.ok) return FALLBACK_DEF;

      const data = await res.json();
      return extractDictionaryDefinition(data);
    }
  },

  //
  // 4. OwlBot
  //
  "OwlBot": {
    name: "OwlBot (Modern Words)",

    async getWord() {
      const url = "https://random-word-api.herokuapp.com/word";
      const res = await safeFetch(url);
      if (!res || !res.ok) return "error";

      const data = await res.json();
      return (data?.[0] || "error").toLowerCase();
    },

    async getDefinition(word) {
      const url = `https://owlbot.info/api/v4/dictionary/${word}`;
      const res = await safeFetch(url, {
        headers: { Authorization: "Token YOUR_KEY" }
      });

      if (!res || !res.ok) return FALLBACK_DEF;

      const data = await res.json();
      return {
        definition: data?.definitions?.[0]?.definition || "No definition found.",
        audio: ""
      };
    }
  },

  //
  // 5. Spelling Bee Championship
  //
  "SpellingBee": {
    name: "Spelling Bee Championship",

    async getWord() {
      const list = [
        "appoggiatura", "syzygy", "logorrhea", "cymotrichous",
        "koinonia", "gesellschaft", "bougainvillea", "phylloquinone",
        "xanthosis", "chiaroscurist"
      ];
      return pickRandom(list);
    },

    async getDefinition(word) {
      const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
      const res = await safeFetch(url);
      if (!res || !res.ok) return FALLBACK_DEF;

      const data = await res.json();
      return extractDictionaryDefinition(data);
    }
  },

  //
  // 6. Kids Words
  //
  "KidsWords": {
    name: "Kids Words (Ages 4–7)",

    async getWord() {
      const list = [
        "cat", "dog", "sun", "hat", "ball",
        "tree", "fish", "milk", "book", "car", "beach",
        "baby", "house"
      ];
      return pickRandom(list);
    },

    async getDefinition(word) {
      return {
        definition: `A simple word: ${word}.`,
        audio: ""
      };
    }
  }
};
