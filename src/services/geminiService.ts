import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface OwnershipVerdict {
  owner: string;
  firstAppearanceUrl?: string;
  firstAppearanceDate?: string;
  confidence: number;
  metadata?: {
    camera?: string;
    location?: string;
    software?: string;
  };
  reasoning: string;
}

export async function analyzeImageForensics(imageBuffer: ArrayBuffer, mimeType: string): Promise<OwnershipVerdict> {
  const base64 = btoa(
    new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), "")
  );

  const prompt = `
    Analyze this image for visual forensics and ownership clues. 
    Act as a digital IP detective. Look for:
    1. Visual style consistency and artist marks or watermarks.
    2. Surviving metadata patterns.
    3. Compression artifact analysis.
    4. Text/OCR info.
    
    Return your verdict in this EXACT JSON format:
    {
      "owner": "Name or Account",
      "firstAppearanceUrl": "URL if found, else null",
      "firstAppearanceDate": "Estimated date",
      "confidence": 0-100,
      "metadata": { "camera": "...", "location": "...", "software": "..." },
      "reasoning": "Explain your findings in 2-3 sentences."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: [
        {
           parts: [
               { text: prompt },
               { inlineData: { data: base64, mimeType } }
           ]
        }
      ]
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Failed to parse verdict");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      owner: "Unknown",
      confidence: 0,
      reasoning: "The asset's visual fingerprint is complex or partially occluded, preventing a high-confidence match.",
    };
  }
}
