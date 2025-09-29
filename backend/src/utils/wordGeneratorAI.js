// generateWordsPerplexity.js

import axios from "axios";
import dotenv from "dotenv";
import wordList from "../constants/wordList.js";
dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  throw new Error("Missing PERPLEXITY_API_KEY in .env");
}

/**
 * Generates a list of words for a drawing game.
 * @param {number} rounds - Number of rounds in the game.
 * @param {number} maxPlayers - Maximum number of players.
 * @param {string} difficulty - Difficulty level (e.g., easy, medium, hard).
 * @param {string|null} theme - Optional theme for the words.
 * @returns {Promise<string[]>} - Array of words.
 */
async function generateWordList(rounds, maxPlayers, difficulty, theme = null) {
  const totalWords = rounds * maxPlayers * 3;

  // Construct the user prompt
const prompt = `
Generate exactly ${totalWords} unique single-word nouns suitable for a drawing game like Scribble.
Words must meet the following criteria:
- ${difficulty} difficulty
- Family-friendly
- Easy to understand
- Playable in a drawing game
- Each word must be less than 10 characters
${theme ? `- Theme: ${theme}.` : ""}
Return ONLY the words as a **comma-separated list**, with no numbering, quotes, or extra text.
Ensure that all words are unique, with no repetitions.
`;


  // Prepare the JSON payload
  const payload = {
    model: "sonar-pro",
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: Math.max(200, totalWords * 5), // approximate tokens per word
    temperature: 0.8
  };

  try {
    const res = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = res.data.choices[0].message.content;
    const words = text
      .split(",")
      .map(w => w.trim())
      .filter(Boolean);

    console.log("Word List Generated:", words);
    return words;

  } catch (err) {
    console.error("Error generating words with Perplexity:", err.response?.data || err.message);
    return wordList; // fallback to default word list
  }
}

export default generateWordList;
