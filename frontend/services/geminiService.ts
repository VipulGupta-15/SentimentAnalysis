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
                    description: 'A numerical score from -1.0 (very negative) to 1.0 (very positive) representing the precise sentiment intensity.',
                },
            },
            required: ['label', 'score'],
        },
        emotion: {
            type: Type.OBJECT,
            properties: {
                label: {
                    type: Type.STRING,
                    description: 'The absolute dominant emotion. YOU MUST PICK EXACTLY ONE OF: "Angry", "Disgusted", "Fearful", "Happy (Joy)", "Neutral", "Sad", "Surprised".'
                },
                score: {
                    type: Type.NUMBER,
                    description: "A confidence score from 0.0 to 1.0 for the detected emotion."
                }
            },
            required: ['label', 'score']
        },
        audienceReaction: {
            type: Type.OBJECT,
            properties: {
                prediction: {
                    type: Type.STRING,
                    description: "A precise, one-sentence prediction of how an audience on social media (like Instagram or TikTok) will react to this content. E.g., 'Likely to drive high engagement due to controversial hooks.'"
                },
                growthPercent: {
                    type: Type.NUMBER,
                    description: "A 0-100 numerical estimate of growth potential or virality impact based on the content's emotional resonance."
                },
                keywords: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "A list of 3-5 keywords describing the viewer's likely reaction (e.g., 'Intrigued', 'Amused', 'Inspired')."
                }
            },
            required: ['prediction', 'growthPercent', 'keywords']
        }
    },
    required: ['sentiment', 'emotion', 'audienceReaction'],
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
    You are an expert Social Media Analytics AI designed to help digital marketing agencies understand the emotional impact of content and predict its performance.
    Analyze the provided media (an image or a video file). Your analysis must be structured exactly according to the JSON schema.

    1.  **Sentiment Analysis**: Consider the visual and audio elements. Is it 'Positive', 'Neutral', or 'Negative'? Provide a specific confidence score from -1.0 (extreme negative) to 1.0 (extreme positive).
    2.  **Emotional Category**: You must strictly identify the dominant emotion from this exact list: ["Angry", "Disgusted", "Fearful", "Happy (Joy)", "Neutral", "Sad", "Surprised"]. Provide a confidence score from 0.0 to 1.0.
    3.  **Predicted Audience Reaction**: Act as an agency expert. Provide a direct, one-sentence prediction on whether this post will perform well on social media. Calculate a realistic \`growthPercent\` (0-100) based on how emotionally engaging or "hooked" a viewer might be. Provide 3-5 \`keywords\` predicting the audience's state of mind.

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
                temperature: 0.2, // Low temperature for consistent classification
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText) as AnalysisResult;
        
        // Basic validation
        if (!parsedResult.sentiment || !parsedResult.emotion || !parsedResult.audienceReaction || !Array.isArray(parsedResult.audienceReaction.keywords)) {
            throw new Error("Invalid response structure from API.");
        }

        return parsedResult;

    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to get analysis from the AI. The model may have returned an unexpected format or an error occurred.");
    }
}