import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';

// Add global fetch for Node.js environment
if (!globalThis.fetch) {
    globalThis.fetch = fetch as any;
}

const GEMINI_API_KEY = 'AIzaSyA-AFBmaN5upC934PkYPgSxQXn2d_zQviA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface PlaylistSuggestion {
    name: string;
    songs: string[];
}

async function testGemini(userPrompt: string) {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.9,
                topK: 32,
                topP: 1,
            },
        });
        
        const prompt = `Act as a music expert and create a playlist based on this request: "${userPrompt}".
        Return your response in the following JSON format without any markdown formatting or additional text:
        {
            "name": "A creative name for the playlist",
            "songs": [
                "Song 1 - Artist 1",
                "Song 2 - Artist 2",
                // ... up to 10 songs
            ]
        }
        Make sure each song actually exists and include the artist name for accurate Spotify searching.
        Important: Return only the JSON object, no markdown formatting or backticks.`;

        console.log('Sending prompt to Gemini:', prompt);
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean up the response by removing markdown formatting
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        // Parse the JSON response
        try {
            const playlist: PlaylistSuggestion = JSON.parse(text);
            console.log('\nPlaylist Name:', playlist.name);
            console.log('Songs:');
            playlist.songs.forEach((song, index) => {
                console.log(`${index + 1}. ${song}`);
            });
            return playlist;
        } catch (e) {
            console.error('Failed to parse Gemini response as JSON. Raw response:', text);
            throw e;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Get input from command line
const userPrompt = process.argv[2] || "Create a playlist of the top 10 Beatles songs";
console.log('Testing with prompt:', userPrompt);
testGemini(userPrompt); 