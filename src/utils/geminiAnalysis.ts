import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY!);

export async function analyzeSpeech(transcript: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze the following speech transcript and provide feedback on areas to improve, focusing on clarity, coherence, and delivery:

  "${transcript}"

  Please provide your analysis in the following format:
  1. Cite a specific part of the speech (use quotation marks).
  2. Explain what could be improved about this part.
  3. Provide a specific suggestion for improvement.

  Repeat this format for 3-5 different aspects of the speech. Be concise and specific in your feedback.`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return text;
}