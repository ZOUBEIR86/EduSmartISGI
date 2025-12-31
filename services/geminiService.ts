
import { GoogleGenAI, Type } from "@google/genai";
import { QuizType, Difficulty, QuizResult, GradingResult } from "../types";

// Initialisation conforme aux directives (utilisation directe de process.env.API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateQuizFromText(
  text: string, 
  type: QuizType, 
  difficulty: Difficulty
): Promise<QuizResult> {
  // Utilisation de Gemini 3 Flash pour la génération rapide de quiz
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Génère un quiz pédagogique basé sur le texte suivant. 
  Type de questions : ${type === 'MCQ' ? 'QCM' : type === 'TRUE_FALSE' ? 'Vrai/Faux' : 'Trous'}. 
  Difficulté : ${difficulty}/5.
  Langue : Français.
  
  Texte source : ${text}`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING },
                  description: "Optionnel pour les QCM" 
                },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["id", "question", "answer", "explanation"]
            }
          }
        },
        required: ["title", "questions"]
      }
    }
  });

  if (!response.text) throw new Error("Réponse vide de l'IA");
  return JSON.parse(response.text);
}

export async function gradeStudentWork(
  imageData: string, 
  subject: string, 
  level: string
): Promise<GradingResult> {
  // Passage à Gemini 3 Pro pour une analyse plus profonde et un raisonnement complexe sur les copies
  const model = 'gemini-3-pro-preview';
  
  const prompt = `Agis en tant qu'enseignant expert en ${subject} pour le niveau ${level}. 
  Analyse l'image de cette copie d'élève. 
  Extrais le texte (OCR) et évalue le contenu avec précision.
  Donne une note sur 20.
  Fournis un feedback pédagogique constructif incluant les points forts et les axes d'amélioration.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: imageData.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          grade: { type: Type.NUMBER },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
          detailedFeedback: { type: Type.STRING },
          subject: { type: Type.STRING },
          level: { type: Type.STRING }
        },
        required: ["grade", "strengths", "improvements", "detailedFeedback", "subject", "level"]
      }
    }
  });

  if (!response.text) throw new Error("Réponse vide de l'IA");
  return JSON.parse(response.text);
}
