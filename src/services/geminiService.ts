import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface PlaylistSuggestion {
    name: string;
    songs: string[];
}

// Define safety settings
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

export async function generatePlaylistPrompt(userPrompt: string): Promise<PlaylistSuggestion> {
    try {
        const model = genAI.getGenerativeModel({ 
            model: "gemini-pro",
            generationConfig: {
                temperature: 0.9,
                topK: 32,
                topP: 1,
            },
            safetySettings, // Apply safety settings
        });
        
        const prompt = `As a professional music curator, create a family-friendly playlist based on this request: "${userPrompt}".

Guidelines for song selection:
- Focus on the specified genre, mood, or artist
- Include popular and well-known tracks
- Ensure songs are appropriate for all audiences
- Select songs available on Spotify
- Maintain consistent theme and energy

Return your response in this exact JSON format:
{
    "name": "A descriptive playlist name that reflects the theme",
    "songs": [
        "Song Title - Artist Name",
        "Song Title - Artist Name",
        // exactly 10 songs, following the format "Song - Artist"
    ]
}

Requirements:
- Return at least 10 songs and no more than 20
- Use accurate song titles and artist names
- Format must be "Song - Artist" for Spotify searching
- Return only the JSON object, no additional text
- If user requests top songs, include most popular tracks
- Consider the specified era/time period if mentioned
- Start playlist name with artist name if artist-specific
- Include only songs available on Spotify`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        
        // Clean up the response
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        
        return JSON.parse(text);
    } catch (error) {
        console.error('Error generating playlist:', error);
        if (error instanceof Error) {
            // Provide more specific error message to the user
            if (error.message.includes('SAFETY')) {
                throw new Error('Unable to generate playlist due to content restrictions. Please try a different prompt.');
            }
        }
        throw new Error('Failed to generate playlist');
    }
} 