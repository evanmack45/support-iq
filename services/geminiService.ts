import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    transcript: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          speaker: { type: Type.STRING, enum: ["Agent", "Customer"] },
          text: { type: Type.STRING },
          sentimentScore: { type: Type.NUMBER, description: "A score from 1 (very negative) to 10 (very positive) representing the sentiment of this specific segment." },
        },
        required: ["speaker", "text", "sentimentScore"],
      },
    },
    coaching: {
      type: Type.OBJECT,
      properties: {
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3 distinct things the agent did well.",
        },
        missedOpportunities: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of 3 distinct missed opportunities for improvement.",
        },
        summary: { type: Type.STRING, description: "A brief 2-sentence summary of the call." },
      },
      required: ["strengths", "missedOpportunities", "summary"],
    },
    overallEngagementScore: {
      type: Type.NUMBER,
      description: "Overall engagement score for the call from 0 to 100.",
    },
  },
  required: ["transcript", "coaching", "overallEngagementScore"],
};

export const analyzeAudio = async (base64Audio: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio,
            },
          },
          {
            text: `Analyze this support call audio. You are an expert support team coach.
            1. Diarize the transcript between the 'Agent' and the 'Customer'.
            2. Assign a sentiment score (1-10) to each transcript segment based on tone and content.
            3. Create a coaching card with exactly 3 key strengths and 3 missed opportunities for the Agent.
            4. Provide an overall engagement score (0-100).
            
            Return the result purely as JSON matching the provided schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: {
          thinkingBudget: 32768, 
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(text) as AnalysisResult;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
