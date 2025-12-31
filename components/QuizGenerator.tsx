
import React, { useState } from 'react';
import { Upload, FileText, Sparkles, ChevronRight, CheckCircle2, Download, RefreshCcw, ArrowLeft, Copy, Check, Hash, Lightbulb } from 'lucide-react';
import { QuizType, Difficulty, QuizResult } from '../types';
import { generateQuizFromText, generateQuizFromTopic } from '../services/geminiService';
import { jsPDF } from 'jspdf';

interface QuizGeneratorProps {
  onActivityLogged: (activity: any) => void;
}

const QuizGenerator: React.FC<QuizGeneratorProps> = ({ onActivityLogged }) => {
  const [inputText, setInputText] = useState('');
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState<'text' | 'topic'>('text');
  const [quizType, setQuizType] = useState<QuizType>('MCQ');
  const [difficulty, setDifficulty] = useState<Difficulty>(3);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const SUGGESTIONS = ["Histoire de la Mauritanie", "Intelligence Artificielle", "Les bases du Python", "Géographie de l'Afrique", "Le Système Solaire"];

  const handleGenerate = async () => {
    if (mode === 'text' && !inputText.trim()) return;
    if (mode === 'topic' && !topic.trim()) return;
    
    setLoading(true);
    try {
      const quiz = mode === 'text' 
        ? await generateQuizFromText(inputText, quizType, difficulty)
        : await generateQuizFromTopic(topic, difficulty);

      setResult(quiz);
      onActivityLogged({
        id: Date.now().toString(),
        type: 'QUIZ',
        date: new Date().toISOString(),
        title: quiz.title,
        score: `${quiz.questions.length} Q`
      });
    } catch (error) {
      console.error(error);
      alert("Erreur. Vérifiez votre connexion ou votre clé API.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyQuestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportToPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(2, 132, 199);
    doc.text(result.title, 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    let y = 35;
    result.questions.forEach((q, i) => {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}. ${q.question}`, 20, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      if (q.options) {
        q.options.forEach(opt => {
          doc.text(`[ ] ${opt}`, 25, y);
          y += 7;
        });
      }
      y += 5;
    });
    doc.save(`Quiz_${result.title}.pdf`);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => result ? setResult(null) : window.history.back()}
          className="p-2 bg-white rounded-full shadow-sm text-gray-400 hover:text-blue-600 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-black text-gray-800">Générateur de Quiz</h2>
        <div className="w-9 h-9"></div>
      </div>

      {!result ? (
        <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-500/5 border border-gray-100 p-6 md:p-8 space-y-8">
          {/* Mode Selector */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl">
            <button 
              onClick={() => setMode('text')}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${mode === 'text' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              <FileText size={16} />
              TEXTE SOURCE
            </button>
            <button 
              onClick={() => { setMode('topic'); setQuizType('MCQ'); }}
              className={`flex-1 py-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${mode === 'topic' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
            >
              <Hash size={16} />
              THÈME DIRECT
            </button>
          </div>

          {mode === 'text' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-blue-600" />
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Contenu Source</span>
              </div>
              <textarea
                className="w-full h-64 p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base leading-relaxed placeholder:text-gray-300 shadow-inner"
                placeholder="Collez ici le cours ou les notes à transformer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={18} className="text-blue-600" />
                  <span className="text-xs font-black uppercase tracking-widest text-gray-400">Sujet du Quiz</span>
                </div>
                <input
                  type="text"
                  className="w-full p-6 rounded-3xl bg-gray-50 border-none focus:ring-2 focus:ring-blue-500 transition-all text-sm md:text-base font-bold placeholder:text-gray-300 shadow-inner"
                  placeholder="Ex: La révolution industrielle, Algèbre linéaire..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Lightbulb size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Suggestions</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button 
                      key={s}
                      onClick={() => setTopic(s)}
                      className="px-4 py-2 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl text-[11px] font-bold text-gray-500 transition-all border border-gray-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Format</span>
              <div className="flex flex-wrap gap-2">
                {(['MCQ', 'TRUE_FALSE', 'FILL_BLANKS'] as QuizType[]).map((type) => (
                  <button
                    key={type}
                    disabled={mode === 'topic'}
                    onClick={() => setQuizType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all border ${quizType === type ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-gray-500 border-gray-100 hover:bg-gray-50'} ${mode === 'topic' && type !== 'MCQ' ? 'opacity-30 cursor-not-allowed' : ''}`}
                  >
                    {type === 'MCQ' ? 'QCM' : type === 'TRUE_FALSE' ? 'Vrai/Faux' : 'Texte à trous'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest text-gray-400">Difficulté</span>
                <span className="text-blue-600 font-black text-sm">{difficulty}/5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={difficulty}
                onChange={(e) => setDifficulty(parseInt(e.target.value) as Difficulty)}
                className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || (mode === 'text' ? !inputText.trim() : !topic.trim())}
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-200 disabled:opacity-50 active:scale-95 transition-all"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <RefreshCcw className="animate-spin" size={24} />
                <span className="animate-pulse">Génération en cours...</span>
              </div>
            ) : (
              <>
                <Sparkles size={22} className="text-blue-200" />
                Générer mon Quiz {mode === 'topic' ? 'Express' : ''}
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Résultat IA</p>
              <h3 className="text-xl font-black">{result.title}</h3>
            </div>
            <button 
              onClick={exportToPDF}
              className="p-3 bg-white/20 backdrop-blur-md rounded-2xl hover:bg-white/30 transition shadow-inner"
            >
              <Download size={20} />
            </button>
          </div>

          <div className="grid gap-4">
            {result.questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 group/card relative overflow-hidden">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black flex-shrink-0 text-sm shadow-inner transition-transform group-hover/card:scale-110">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <p className="text-base font-extrabold text-gray-800 leading-tight pt-1">{q.question}</p>
                      
                      {/* Enhanced Copy Button */}
                      <button 
                        onClick={() => handleCopyQuestion(q.question, q.id)}
                        className={`
                          flex items-center gap-2 p-2 rounded-xl transition-all shrink-0 
                          ${copiedId === q.id 
                            ? 'bg-green-50 text-green-600 border border-green-100' 
                            : 'text-gray-300 hover:text-blue-600 hover:bg-blue-50 border border-transparent'}
                        `}
                        title="Copier la question"
                      >
                        {copiedId === q.id ? (
                          <div className="flex items-center gap-1.5 animate-in fade-in zoom-in duration-300">
                            <Check size={16} />
                            <span className="text-[10px] font-black uppercase tracking-tight">Copié !</span>
                          </div>
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                    
                    {q.options && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className="px-4 py-3 rounded-2xl bg-gray-50 border border-gray-50 text-gray-600 font-bold text-xs flex items-center gap-2 hover:bg-blue-50 transition-colors cursor-default group/option">
                             <div className="w-1.5 h-1.5 rounded-full bg-blue-200 group-hover/option:bg-blue-400 transition-colors" />
                             {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        onClick={() => setShowAnswers(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                        className="text-xs font-black text-blue-600 flex items-center gap-1 uppercase tracking-widest hover:underline decoration-2 underline-offset-4"
                      >
                        {showAnswers[q.id] ? "Cacher l'explication" : "Vérifier la réponse"}
                        <ChevronRight size={14} className={`transition-transform duration-300 ${showAnswers[q.id] ? 'rotate-90' : ''}`} />
                      </button>
                    </div>

                    {showAnswers[q.id] && (
                      <div className="p-5 rounded-3xl bg-green-50 border border-green-100 space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <div className="flex items-center gap-2 text-green-700 font-black text-sm">
                          <CheckCircle2 size={16} />
                          Correction : {q.answer}
                        </div>
                        <p className="text-xs text-green-800 font-medium italic leading-relaxed opacity-80">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => setResult(null)} 
            className="w-full py-4 rounded-3xl bg-gray-800 text-white font-black hover:bg-gray-900 transition-all shadow-lg active:scale-95"
          >
            Générer un autre quiz
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizGenerator;
