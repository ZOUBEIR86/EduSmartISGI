
import React from 'react';
import { BrainCircuit, FileCheck, Award, Clock, ChevronRight, Sparkles, Plus, GraduationCap, Zap, Trophy, Target } from 'lucide-react';
import { Activity, User } from '../types';

interface DashboardProps {
  onNavigate: (view: string) => void;
  history: Activity[];
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, history, user }) => {
  const hour = new Date().getHours();
  const greeting = hour < 18 ? 'Bonjour' : 'Bonsoir';
  
  const quizCount = history.filter(h => h.type === 'QUIZ').length;
  const gradingCount = history.filter(h => h.type === 'GRADING').length;

  const getPersonalizedMessage = () => {
    if (user.role === 'ETUDIANT') {
      if (quizCount === 0) {
        return "C'est le moment idéal pour booster vos connaissances avec un premier quiz !";
      } else if (quizCount < 5) {
        return `Belle progression ! Vous avez déjà complété ${quizCount} quiz. Continuez ainsi !`;
      } else {
        return "Impressionnant ! Votre régularité est la clé de votre réussite académique.";
      }
    } else {
      if (gradingCount === 0 && quizCount === 0) {
        return "Prêt à digitaliser vos supports pédagogiques aujourd'hui ?";
      } else if (gradingCount > 0) {
        return `Vous avez déjà corrigé ${gradingCount} copies avec l'IA. Quel gain de temps précieux !`;
      } else {
        return `Vos quiz sont prêts ! Vos étudiants attendent avec impatience de se tester.`;
      }
    }
  };

  const getHeroIcon = () => {
    if (user.role === 'ETUDIANT') {
      return quizCount > 3 ? <Trophy className="text-yellow-300" size={14} /> : <Target className="text-green-300" size={14} />;
    }
    return <Zap className="text-blue-300" size={14} />;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Hero Section Dynamic */}
      <div className={`relative overflow-hidden bg-gradient-to-br ${user.role === 'PROFESSEUR' ? 'from-blue-700 via-blue-600 to-indigo-800' : 'from-green-600 via-teal-600 to-blue-700'} rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-black/5 rounded-full -ml-20 -mb-20 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-1 border border-white/10">
              {getHeroIcon()}
              {user.role === 'ETUDIANT' ? 'Parcours Apprenant' : 'Console Enseignant'} • ISGI
            </div>
            <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-100">{user.name.split(' ')[0]}</span> !
            </h2>
            <p className="text-blue-50/90 max-w-lg font-bold text-sm md:text-lg leading-relaxed italic">
              "{getPersonalizedMessage()}"
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
             <button 
              onClick={() => onNavigate('quiz')}
              className="bg-white text-blue-700 px-6 py-4 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all font-black flex items-center justify-center gap-3 group"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              {user.role === 'ETUDIANT' ? 'Lancer un Quiz' : 'Créer un Support'}
            </button>
            {user.role === 'PROFESSEUR' && (
              <button 
                onClick={() => onNavigate('grader')}
                className="bg-blue-500/30 backdrop-blur-md text-white border border-white/20 px-6 py-4 rounded-2xl hover:bg-white/20 transition-all font-black flex items-center justify-center gap-3"
              >
                <FileCheck size={20} />
                Corriger
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow group">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BrainCircuit size={24} />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-800">{quizCount}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Modules Quiz</p>
          </div>
        </div>
        
        {user.role === 'PROFESSEUR' && (
          <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileCheck size={24} />
            </div>
            <div>
              <p className="text-3xl font-black text-gray-800">{gradingCount}</p>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Copies Analysées</p>
            </div>
          </div>
        )}

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-36 hover:shadow-md transition-shadow group col-span-2 md:col-span-1">
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award size={24} />
          </div>
          <div>
            <p className="text-3xl font-black text-gray-800">{user.role === 'ETUDIANT' ? 'S1 2024' : '14.2'}</p>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {user.role === 'ETUDIANT' ? 'Session Actuelle' : 'Moyenne Globale'}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            <h3 className="text-xl font-black text-gray-800">Activités Récentes</h3>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.length === 0 ? (
            <div className="col-span-full bg-white/50 border-2 border-dashed border-gray-200 rounded-[2.5rem] p-16 text-center">
              <Sparkles size={40} className="mx-auto text-gray-200 mb-4" />
              <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Prêt pour votre première session ?</p>
            </div>
          ) : (
            history
              .filter(a => user.role === 'PROFESSEUR' || a.type === 'QUIZ')
              .map((activity) => (
              <div 
                key={activity.id} 
                className="group bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-between hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all cursor-default"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3.5 rounded-2xl shadow-inner ${activity.type === 'QUIZ' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    {activity.type === 'QUIZ' ? <BrainCircuit size={22} /> : <FileCheck size={22} />}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">{activity.title}</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1.5 tracking-tighter flex items-center gap-1">
                       <Clock size={10} />
                       {new Date(activity.date).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-black px-3 py-1.5 rounded-xl ${activity.type === 'QUIZ' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                    {activity.score}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
