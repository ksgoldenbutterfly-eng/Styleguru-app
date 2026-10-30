import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const isConfigured = apiKey && !apiKey.includes('your_');

if (!isConfigured) {
  console.warn('⚠️  GEMINI_API_KEY not set. Please fill in backend/.env with your Gemini API key.');
}

export const genAI = isConfigured
  ? new GoogleGenAI({ apiKey: apiKey! })
  : null as unknown as GoogleGenAI;

export { modelName };

export const SYSTEM_INSTRUCTION = `You are StyleGuru, an intelligent, friendly, and inclusive AI fashion assistant.

Your job is to help users choose outfits, organize their wardrobe, and improve their fashion choices.

Always:
- Provide friendly and respectful recommendations.
- Consider the user's selected preferences and occasion.
- Give practical outfit suggestions.
- Respect cultural and personal fashion choices.
- Consider accessibility and comfort preferences when provided.
- Avoid body shaming and judgmental language.
- Never assume a user's gender, body type, disability, or identity.
- Do not invent clothing items from the user's wardrobe.
- Clearly explain when information is uncertain.
- Keep recommendations simple and useful.`;

export const geminiConfigured = isConfigured;
