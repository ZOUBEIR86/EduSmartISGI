
import React, { useState } from 'react';
import { BrainCircuit, GraduationCap, UserCheck, AlertCircle, ArrowRight, ShieldCheck, Star, Mail, CheckCircle2 } from 'lucide-react';
import { User, UserRole } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<UserRole>('ETUDIANT');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const ADMIN_EMAIL = "mzeinebou@gmail.com";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();

    if (!trimmedEmail.includes('@')) {
      setError('Veuillez entrer une adresse email valide.');
      return;
    }

    if (!trimmedFirstName || !trimmedLastName) {
      setError('Veuillez renseigner votre prénom et votre nom.');
      return;
    }

    // Vérification de l'exception administrateur
    const isAdmin = trimmedEmail === ADMIN_EMAIL;
    
    // Autoriser @isgi.mr et @gmail.com
    const isAcceptedDomain = trimmedEmail.endsWith('.isgi.mr') || trimmedEmail.endsWith('@gmail.com');

    if (!isAcceptedDomain && !isAdmin) {
      setError(`Accès restreint. Veuillez utiliser une adresse @isgi.mr ou @gmail.com.`);
      return;
    }

    // Déclencher l'animation de succès
    setIsLoggingIn(true);

    // Si c'est l'admin, on force le rôle Professeur (Admis)
    const finalRole = isAdmin ? 'PROFESSEUR' : role;
    
    // Construction du nom complet
    const fullName = isAdmin 
      ? "Administrateur Zeinebou" 
      : `${trimmedFirstName.charAt(0).toUpperCase() + trimmedFirstName.slice(1)} ${trimmedLastName.toUpperCase()}`;
    
    // Petit délai pour laisser l'utilisateur voir l'animation de succès
    setTimeout(() => {
      onLogin({
        email: trimmedEmail,
        role: finalRole,
        name: fullName
      });
    }, 800);
  };

  const isEnteringAdmin = email.trim().toLowerCase() === ADMIN_EMAIL;
  const isGmail = email.trim().toLowerCase().endsWith('@gmail.com') && !isEnteringAdmin;

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden border border-white relative">
        <div className={`p-10 text-center relative overflow-hidden transition-colors duration-500 ${isEnteringAdmin ? 'bg-gradient-to-br from-indigo-700 to-purple-800' : isGmail ? 'bg-gradient-to-br from-teal-600 to-emerald-700' : 'bg-gradient-to-br from-blue-700 to-indigo-800'}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-blue-50/20">
            {isEnteringAdmin ? <Star className="text-indigo-600 animate-pulse" size={32} /> : <BrainCircuit className={isGmail ? 'text-teal-600' : 'text-blue-600'} size={32} />}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">EduSmart IA</h1>
          <p className="text-blue-100 text-sm mt-1 opacity-80">
            {isEnteringAdmin ? 'Bienvenue, Administrateur' : 'Connexion Étudiant & Professeur'}
          </p>
        </div>

        <div className="p-8 md:p-10 space-y-6">
          {!isEnteringAdmin && (
            <div className="space-y-2 animate-in fade-in duration-500">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">Choisissez votre profil</p>
              <div className="flex bg-gray-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => setRole('ETUDIANT')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${role === 'ETUDIANT' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <GraduationCap size={16} />
                  ÉTUDIANT
                </button>
                <button
                  type="button"
                  disabled={isLoggingIn}
                  onClick={() => setRole('PROFESSEUR')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black transition-all ${role === 'PROFESSEUR' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  <UserCheck size={16} />
                  PROFESSEUR
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Prénom</label>
                <input
                  type="text"
                  required
                  disabled={isLoggingIn}
                  placeholder="Ahmed"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 disabled:opacity-50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Nom</label>
                <input
                  type="text"
                  required
                  disabled={isLoggingIn}
                  placeholder="Vall"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-medium placeholder:text-gray-300 disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Mail size={10} /> Email de connexion
                </label>
                <div className="flex gap-1">
                  <span className="text-[8px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">@isgi.mr</span>
                  <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full">@gmail.com</span>
                </div>
              </div>
              <input
                type="email"
                required
                disabled={isLoggingIn}
                placeholder="votre.email@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-5 py-4 rounded-2xl bg-gray-50 border-2 border-transparent transition-all text-sm font-medium placeholder:text-gray-300 disabled:opacity-50 ${isEnteringAdmin ? 'focus:border-indigo-500 focus:bg-white ring-2 ring-indigo-50' : isGmail ? 'focus:border-teal-500 focus:bg-white' : 'focus:border-blue-500 focus:bg-white'}`}
              />
            </div>

            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 animate-in fade-in zoom-in duration-300">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <p className="text-xs font-bold leading-relaxed">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className={`w-full py-5 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 group relative overflow-hidden ${isEnteringAdmin ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' : isGmail ? 'bg-teal-600 hover:bg-teal-700 shadow-teal-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'} ${isLoggingIn ? 'scale-105' : ''}`}
            >
              {isLoggingIn ? (
                <div className="flex items-center gap-2 animate-in zoom-in duration-300">
                  <CheckCircle2 size={22} className="text-white animate-bounce" />
                  <span>Connexion réussie !</span>
                </div>
              ) : (
                <>
                  <span>Continuer vers l'espace {isEnteringAdmin ? 'Administrateur' : role.toLowerCase()}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-center gap-2">
            <ShieldCheck size={14} className={isEnteringAdmin ? 'text-indigo-500' : 'text-green-500'} />
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter text-center">
              {isEnteringAdmin ? 'Accès Administrateur Déverrouillé' : 'Domaines autorisés : ISGI & GMAIL'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
