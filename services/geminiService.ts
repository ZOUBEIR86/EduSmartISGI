
import { GoogleGenAI, Type } from "@google/genai";
import { QuizType, Difficulty, QuizResult, GradingResult } from "../types";

// Fonction utilitaire pour récupérer la clé API de manière sécurisée
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

// Initialisation différée ou sécurisée
const ai = new GoogleGenAI({ apiKey: getApiKey() });

export async function generateQuizFromText(
  text: string, 
  type: QuizType, 
  difficulty: Difficulty
): Promise<QuizResult> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Génère un quiz pédagogique basé sur le texte suivant. 
  Type de questions : ${type === 'MCQ' ? 'QCM' : type === 'TRUE_FALSE' ? 'Vrai/Faux' : 'Trous'}. 
  Difficulté : ${difficulty}/5.
  Langue : Français.
  
  Texte source : ${text}`;

  try {
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
  } catch (error) {
    console.error("Erreur Gemini Generation:", error);
    throw error;
  }
}

export async function generateQuizFromTopic(
  topic: string,
  difficulty: Difficulty
): Promise<QuizResult> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `Génère un quiz pédagogique de type QCM (Multiple Choice) sur le thème suivant : "${topic}". 
  Génère au moins 5 questions de haute qualité.
  Difficulté : ${difficulty}/5.
  Langue : Français.`;

  try {
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
                    items: { type: Type.STRING }
                  },
                  answer: { type: Type.STRING },
                  explanation: { type: Type.STRING }
                },
                required: ["id", "question", "answer", "explanation", "options"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    if (!response.text) throw new Error("Réponse vide de l'IA");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Erreur Gemini Topic Generation:", error);
    throw error;
  }
}

export async function gradeStudentWork(
  imageData: string, 
  subject: string, 
  level: string,
  manualGrade?: number
): Promise<GradingResult> {
  const model = 'gemini-3-pro-preview';
  
  let prompt = `Agis en tant qu'enseignant expert en ${subject} pour le niveau ${level}. 
  Analyse l'image de cette copie d'élève. 
  Extrais le texte (OCR) et évalue le contenu avec précision.
  
  ${manualGrade !== undefined 
    ? `L'enseignant a déjà attribué la note de ${manualGrade}/20. Ton rôle est de fournir un feedback pédagogique (points forts, points à améliorer et plan d'action) qui justifie et complète cette note. Utilise la note de ${manualGrade} dans ta réponse.`
    : "Donne une note sur 20 basée sur ton analyse pédagogique."}
  
  IMPORTANT : Le feedback doit être hautement pédagogique :
  - Les 'strengths' doivent être des compétences précises maîtrisées.
  - Les 'improvements' doivent être des conseils actionnables.
  - Le 'detailedFeedback' doit être structuré comme un plan d'action.`;

  try {
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
    const result = JSON.parse(response.text);
    
    // On s'assure que la note manuelle est respectée si fournie
    if (manualGrade !== undefined) {
      result.grade = manualGrade;
    }
    
    return result;
  } catch (error) {
    console.error("Erreur Gemini Grading:", error);
    throw error;
  }
}
