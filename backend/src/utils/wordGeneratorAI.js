import axios from "axios";
import dotenv from "dotenv";
import wordList from "../constants/wordList.js";
dotenv.config();

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
if (!TOGETHER_API_KEY) {
    throw new Error("Missing TOGETHER_API_KEY in .env");
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
            "https://api.together.xyz/v1/chat/completions",
            {
                model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 200,
                temperature: 0.8
            },
            {
                headers: {
                    Authorization: `Bearer ${TOGETHER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const text = res.data.choices[0].message.content;
        return text.split(",").map(w => w.trim()).filter(Boolean);

    } catch (err) {
        console.error("Error generating words:", err.response?.data || err.message);
        return wordList;
    }
}

export default generateWordList;
