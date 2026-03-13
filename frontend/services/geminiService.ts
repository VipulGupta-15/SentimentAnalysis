import { GoogleGenAI, Type } from "@google/genai";
import { type AnalysisResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        sentiment: {
            type: Type.OBJECT,
            properties: {
                label: {
                    type: Type.STRING,
                    description: 'The sentiment category: "Positive", "Neutral", or "Negative".',
                },
                score: {
                    type: Type.NUMBER,
                    description: 'A numerical score from -1.0 (very negative) to 1.0 (very positive) representing the sentiment.',
                },
            },
            required: ['label', 'score'],
        },
        emotion: {
            type: Type.OBJECT,
            properties: {
                label: {
                    type: Type.STRING,
                    description: "The dominant emotion detected, e.g., 'Joy', 'Sadness', 'Anger', 'Surprise', 'Calmness'."
                },
                score: {
                    type: Type.NUMBER,
                    description: "A confidence score from 0.0 to 1.0 for the detected emotion."
                }
            },
            required: ['label', 'score']
        },
        userReaction: {
            type: Type.ARRAY,
            items: {
                type: Type.STRING,
            },
            description: "A list of 3-5 keywords describing the likely reaction of a typical viewer to the content (e.g., 'Intrigued', 'Amused', 'Inspired', 'Confused')."
        }
    },
    required: ['sentiment', 'emotion', 'userReaction'],
};

export async function analyzeMedia(
    mediaData: string[],
    mimeType: string,
    userPrompt: string
): Promise<AnalysisResult> {

    const mediaParts = mediaData.map(base64String => ({
        inlineData: {
            data: base64String.split(',')[1],
            mimeType: mimeType, // Always use the original file's mime type
        },
    }));

    const instruction = `
    Analyze the provided media (an image or a video file). Your analysis must be structured according to the JSON schema.

    1.  **Sentiment Analysis**: Based on both visual and audio cues (if present), determine the overall sentiment of the scene. Is it 'Positive', 'Neutral', or 'Negative'? Provide a confidence score from -1.0 (very negative) to 1.0 (very positive).
    2.  **Emotional Category**: Based on both visual and audio cues (if present), identify the dominant emotion conveyed. Examples include 'Joy', 'Sadness', 'Anger', 'Surprise', 'Fear', 'Calmness'. Provide a confidence score from 0.0 to 1.0 for this emotion.
    3.  **Predicted User Reaction**: Provide a list of 3-5 keywords describing the likely reaction of a typical viewer to this content (e.g., 'Intrigued', 'Amused', 'Inspired', 'Confused'). What thoughts or feelings might it evoke?

    ${userPrompt ? `The user has provided this specific focus for your analysis: "${userPrompt}"` : ''}

    Return the complete analysis in the specified JSON format.
    `;
    
    const textPart = {
        text: instruction,
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [...mediaParts, textPart] },
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.2,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as AnalysisResult;
        
        // Basic validation
        if (!parsedResult.sentiment || !parsedResult.emotion || !parsedResult.userReaction || !Array.isArray(parsedResult.userReaction)) {
            throw new Error("Invalid response structure from API.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get analysis from the AI. The model may have returned an unexpected format or an error occurred.");
    }
}