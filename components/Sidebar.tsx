
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BrainCircuit, FileCheck, Smartphone, TrendingUp, X, LogOut, User as UserIcon, Search, SearchX } from 'lucide-react';
import { Activity, User } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  history: Activity[];
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, history, isOpen, onClose, user, onLogout }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const activeClass = "bg-blue-50 text-blue-600";
  const inactiveClass = "text-gray-600 hover:bg-gray-50";

  const filteredHistory = history.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col 
      transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      lg:translate-x-0
    `}>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <BrainCircuit className="text-white" size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">EduSmart <span className="text-blue-600">IA</span></h1>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>
      </div>

      <div className="px-6 mb-2">
         <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl border border-gray-100 mb-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
               <UserIcon size={20} />
            </div>
            <div className="min-w-0">
               <p className="text-xs font-black text-gray-800 truncate">{user.name}</p>
               <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tighter">{user.role}</p>
            </div>
         </div>

         {/* Global Search Bar */}
         <div className="relative group">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
               <Search size={14} className={`transition-colors ${searchQuery ? 'text-blue-500' : 'text-gray-400'}`} />
            </div>
            <input 
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-gray-300"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-3 flex items-center text-gray-300 hover:text-gray-500"
              >
                <X size={14} />
              </button>
            )}
         </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto scrollbar-hide">
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${currentView === 'dashboard' ? activeClass : inactiveClass}`}
        >
          <LayoutDashboard size={18} />
          <span className="font-bold text-sm">Tableau de bord</span>
        </button>
        <button
          onClick={() => onNavigate('quiz')}
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${currentView === 'quiz' ? activeClass : inactiveClass}`}
        >
          <BrainCircuit size={18} />
          <span className="font-bold text-sm">Générateur de Quiz</span>
        </button>
        
        {user.role === 'PROFESSEUR' && (
          <button
            onClick={() => onNavigate('grader')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${currentView === 'grader' ? activeClass : inactiveClass}`}
          >
            <FileCheck size={18} />
            <span className="font-bold text-sm">Correcteur Intelligent</span>
          </button>
        )}

        <div className="pt-4 pb-2">
          <div className="flex items-center justify-between px-4 mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-green-500" />
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activités</h3>
            </div>
            {searchQuery && (
              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                {filteredHistory.length}
              </span>
            )}
          </div>
          <div className="space-y-2 px-2">
            {filteredHistory.length === 0 ? (
              <div className="py-4 text-center px-2">
                <SearchX size={24} className="mx-auto text-gray-200 mb-1" />
                <p className="text-[10px] text-gray-400 font-bold uppercase italic">
                  {searchQuery ? 'Aucun résultat' : 'Aucune activité'}
                </p>
              </div>
            ) : (
              filteredHistory.slice(0, searchQuery ? 20 : 5).map((item) => (
                <div 
                  key={item.id} 
                  className="group p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-default"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[11px] font-bold text-gray-700 leading-tight line-clamp-2">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-black text-blue-500 whitespace-nowrap bg-blue-50 px-1.5 py-0.5 rounded">
                      {item.score}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-1">
                      <div className={`w-1 h-1 rounded-full ${item.type === 'QUIZ' ? 'bg-blue-400' : 'bg-green-400'}`} />
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                        {item.type === 'QUIZ' ? 'Quiz' : 'Copie'}
                      </span>
                    </div>
                    <span className="text-[9px] font-bold text-gray-300">
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>

      <div className="p-4 space-y-3">
        {deferredPrompt && (
          <button 
            onClick={handleInstallClick}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 transition-all active:scale-95"
          >
            <Smartphone size={18} />
            Installer l'App
          </button>
        )}

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-gray-400 hover:text-red-500 py-2 text-sm font-bold transition-colors active:scale-95"
        >
          <LogOut size={16} />
          Déconnexion
        </button>

        <div className="bg-gradient-to-br from-blue-600 to-indigo-500 p-4 rounded-2xl text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
            {user.role === 'ETUDIANT' ? 'Espace Étudiant' : 'Mode Professeur'}
          </p>
          <p className="font-black text-lg">ISGI Mauritanie</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
