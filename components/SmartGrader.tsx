
import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, CheckCircle, AlertCircle, FileText, Download, ThumbsUp, Zap, Lightbulb, ArrowRight, Award } from 'lucide-react';
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
  const [manualGrade, setManualGrade] = useState<string>('');
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
    
    const gradeNum = manualGrade !== '' ? parseFloat(manualGrade) : undefined;
    
    try {
      const grading = await gradeStudentWork(image, subject, level, gradeNum);
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-gray-800 tracking-tight">Correcteur Intelligent</h2>
          <p className="text-gray-500 font-medium">L'IA au service de votre progression pédagogique.</p>
        </div>
      </header>

      {!result ? (
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-gray-100 p-8 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <FileText size={12} /> Informations de la copie
                </label>
                <div className="grid grid-cols-1 gap-3">
                   <select 
                    value={subject} 
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                  >
                    <option>Mathématiques</option>
                    <option>Français</option>
                    <option>Histoire-Géo</option>
                    <option>SVT</option>
                    <option>Anglais</option>
                    <option>Informatique</option>
                  </select>
                  <select 
                    value={level} 
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full p-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white outline-none font-bold text-sm transition-all shadow-inner"
                  >
                    <option>Primaire</option>
                    <option>Collège</option>
                    <option>Lycée</option>
                    <option>Université</option>
                    <option>Formation Pro</option>
                  </select>
                </div>
              </div>

              {/* Nouveau champ : Note Manuelle */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Award size={12} /> Note pré-établie (Optionnel)
                </label>
                <div className="relative group">
                  <input 
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    placeholder="Note / 20"
                    value={manualGrade}
                    onChange={(e) => setManualGrade(e.target.value)}
                    className="w-full p-4 pl-12 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white outline-none font-black text-lg transition-all shadow-inner placeholder:text-gray-300"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors">
                    <Award size={20} />
                  </div>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300 uppercase tracking-widest">
                    Sur 20
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 font-bold px-1">L'IA orientera son feedback pour justifier cette note.</p>
              </div>

              <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100/50">
                 <h4 className="text-xs font-black text-blue-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Lightbulb size={14} /> Astuce Correction
                 </h4>
                 <p className="text-xs text-blue-600/80 leading-relaxed font-medium">
                    Prenez une photo bien éclairée, perpendiculaire à la feuille pour que l'OCR puisse extraire le texte avec une précision maximale.
                 </p>
              </div>
            </div>

            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center p-8 cursor-pointer transition-all min-h-[300px] group overflow-hidden ${image ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
            >
              {image ? (
                <div className="relative w-full h-full flex flex-center items-center justify-center">
                  <img 
                    src={image} 
                    alt="Copie" 
                    className="inlineData max-h-64 rounded-2xl shadow-2xl object-contain animate-in zoom-in-95 duration-300" 
                    data-testid="inline-data-image"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                     <div className="bg-white p-3 rounded-full text-blue-600 shadow-xl">
                        <Camera size={24} />
                     </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} className="text-gray-300 group-hover:text-blue-500" />
                  </div>
                  <p className="text-sm font-black text-gray-500 uppercase tracking-widest">Uploader la Copie</p>
                  <p className="text-xs text-gray-400 mt-2 font-bold">PDF, JPG ou PNG acceptés</p>
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
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-blue-500/20 disabled:opacity-50 active:scale-[0.98] transition-all shadow-xl shadow-blue-200"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-4 border-white border-t-transparent" />
                <span className="animate-pulse">Analyse de la copie...</span>
              </div>
            ) : (
              <>
                <CheckCircle size={22} className="text-blue-200" />
                Lancer l'Évaluation {manualGrade !== '' ? 'Assistée' : ''}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/5 border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Moyenne Obtenue</span>
              <div className="relative">
                 <svg className="w-40 h-40">
                    <circle cx="80" cy="80" r="70" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                    <circle 
                      cx="80" cy="80" r="70" stroke="#10b981" strokeWidth="12" fill="transparent" 
                      strokeDasharray={440} 
                      strokeDashoffset={440 - (440 * result.grade) / 20} 
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-gray-800 tracking-tighter">{result.grade}</span>
                    <span className="text-xs font-black text-gray-400">/ 20</span>
                 </div>
              </div>
              <div className="mt-8 space-y-1">
                <p className="text-lg font-black text-gray-800">{result.subject}</p>
                <p className="text-xs font-bold text-blue-500 uppercase tracking-widest">{result.level}</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={exportReport}
                className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-5 rounded-3xl font-black hover:bg-black transition-all shadow-xl active:scale-95"
              >
                <Download size={20} />
                Exporter en PDF
              </button>

              <button 
                onClick={() => setResult(null)}
                className="w-full py-4 rounded-3xl border-2 border-gray-100 font-black text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all active:scale-95"
              >
                Nouvelle analyse
              </button>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            {/* Detailed Feedback Header */}
            <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-blue-500/5 border border-gray-100">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <CheckCircle size={22} />
                  </div>
                  <h3 className="text-xl font-black text-gray-800 tracking-tight">Analyse Pédagogique</h3>
               </div>
              
              <div className="space-y-10">
                {/* Strengths Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ThumbsUp size={16} className="text-emerald-500" />
                    <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Points de Maîtrise</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <p className="text-xs font-bold text-emerald-800 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Zap size={16} className="text-amber-500" />
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em]">Axes de Progression</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.improvements.map((s, i) => (
                      <div key={i} className="flex items-start gap-3 bg-amber-50/50 border border-amber-100 p-4 rounded-2xl">
                        <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <p className="text-xs font-bold text-amber-800 leading-relaxed">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Detailed Actionable Feedback */}
                <div className="pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb size={16} className="text-blue-500" />
                    <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">Plan d'Action Conseillé</h4>
                  </div>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                    <div className="relative bg-gray-50/80 p-6 rounded-3xl border border-gray-100 text-sm font-medium text-gray-700 leading-loose italic">
                      {result.detailedFeedback.split('\n').map((line, i) => (
                        <p key={i} className="mb-3 last:mb-0 flex items-start gap-3">
                           {line && <ArrowRight size={14} className="mt-1.5 text-blue-400 shrink-0" />}
                           {line}
                        </p>
                      ))}
                    </div>
                  </div>
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
