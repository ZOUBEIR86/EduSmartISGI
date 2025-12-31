
import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle, AlertCircle, FileText, Download } from 'lucide-react';
import { gradeStudentWork } from '../services/geminiService';
import { GradingResult } from '../types';
import { jsPDF } from 'jspdf';

interface SmartGraderProps {
  onActivityLogged: (activity: any) => void;
}

const SmartGrader: React.FC<SmartGraderProps> = ({ onActivityLogged }) => {
  const [image, setImage] = useState<string | null>(null);
  const [subject, setSubject] = useState('Mathématiques');
  const [level, setLevel] = useState('Lycée');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradingResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGrade = async () => {
    if (!image) return;
    setLoading(true);
    try {
      const grading = await gradeStudentWork(image, subject, level);
      setResult(grading);
      onActivityLogged({
        id: Date.now().toString(),
        type: 'GRADING',
        date: new Date().toISOString(),
        title: `${subject} - ${level}`,
        score: `${grading.grade}/20`
      });
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'analyse. Essayez une image plus claire.");
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(2, 132, 199); // Blue
    doc.text("Rapport d'Évaluation EduSmart", 20, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(50, 50, 50);
    doc.text(`Matière : ${result.subject}`, 20, 35);
    doc.text(`Niveau : ${result.level}`, 20, 42);
    
    doc.setFontSize(28);
    doc.setTextColor(22, 163, 74); // Green
    doc.text(`${result.grade}/20`, 160, 40);

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Points Forts :", 20, 60);
    doc.setFontSize(12);
    result.strengths.forEach((s, i) => doc.text(`• ${s}`, 25, 70 + (i * 7)));

    doc.setFontSize(16);
    doc.text("Points à améliorer :", 20, 110);
    doc.setFontSize(12);
    result.improvements.forEach((s, i) => doc.text(`• ${s}`, 25, 120 + (i * 7)));

    doc.setFontSize(16);
    doc.text("Feedback détaillé :", 20, 160);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(result.detailedFeedback, 170);
    doc.text(splitText, 20, 170);

    doc.save(`Evaluation_${result.subject}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Correcteur Intelligent</h2>
          <p className="text-gray-500">Uploadez une photo de copie pour une correction assistée.</p>
        </div>
      </header>

      {!result ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-gray-700">Contexte</label>
              <select 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option>Mathématiques</option>
                <option>Français</option>
                <option>Histoire-Géo</option>
                <option>SVT</option>
                <option>Anglais</option>
              </select>
              <select 
                value={level} 
                onChange={(e) => setLevel(e.target.value)}
                className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 outline-none"
              >
                <option>Primaire</option>
                <option>Collège</option>
                <option>Lycée</option>
                <option>Université</option>
              </select>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-green-400 hover:bg-green-50 transition min-h-[200px]"
            >
              {image ? (
                <img src={image} alt="Copie" className="max-h-48 rounded-lg shadow-sm" />
              ) : (
                <>
                  <Upload size={48} className="text-gray-300 mb-4" />
                  <p className="text-sm font-medium text-gray-500">Déposer la photo de la copie</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG ou PDF</p>
                </>
              )}
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>
          </div>

          <button
            onClick={handleGrade}
            disabled={loading || !image}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:shadow-lg disabled:opacity-50 transition"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Camera size={20} />
                Lancer la correction
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <span className="text-sm font-bold text-gray-400 uppercase mb-2">Note Finale</span>
              <div className="w-32 h-32 rounded-full border-8 border-green-500 flex items-center justify-center">
                <span className="text-4xl font-black text-gray-800">{result.grade}<span className="text-lg text-gray-400">/20</span></span>
              </div>
              <p className="mt-4 text-sm text-gray-500 font-medium">{result.subject} • {result.level}</p>
            </div>
            
            <button 
              onClick={exportReport}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 text-white p-4 rounded-xl font-bold hover:bg-gray-700 transition"
            >
              <Download size={20} />
              Exporter le rapport
            </button>

            <button 
              onClick={() => setResult(null)}
              className="w-full p-4 rounded-xl border border-gray-200 font-bold text-gray-600 hover:bg-gray-50 transition"
            >
              Nouvelle Correction
            </button>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckCircle size={20} className="text-green-500" />
                Analyse Pédagogique
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Points Forts</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-green-50 text-green-700 p-2 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Points à améliorer</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {result.improvements.map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-amber-50 text-amber-700 p-2 rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-500 uppercase mb-2">Commentaire Global</h4>
                  <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                    {result.detailedFeedback}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartGrader;
