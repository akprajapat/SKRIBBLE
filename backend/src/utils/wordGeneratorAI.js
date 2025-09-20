// generateWordsPerplexity.js

import axios from "axios";
import dotenv from "dotenv";
import wordList from "../constants/wordList.js";
dotenv.config();

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  throw new Error("Missing PERPLEXITY_API_KEY in .env");
}

async function generateWordList(rounds, maxPlayers, difficulty, theme = null) {
  const totalWords = rounds * maxPlayers * 3;

  const prompt = `
Generate ${totalWords} single-word nouns for a drawing game like Scribble.
Words should be ${difficulty} difficulty, family-friendly, and easy to understand.
${theme ? `Theme: ${theme}.` : ""}
Return the words as a comma-separated list without numbering.
`;

  try {
    const res = await axios.post(
      "https://api.perplexity.ai/chat/completions",
      {
        model: "sonar-pro",   // or another model available to you
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 200,
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = res.data.choices[0].message.content;
    const words =  text.split(",").map(w => w.trim()).filter(Boolean);
    console.log("Word List Generated", words);
    return words;

  } catch (err) {
    console.error("Error generating words with Perplexity:", err.response?.data || err.message);
    return wordList;
  }
}

export default generateWordList;
