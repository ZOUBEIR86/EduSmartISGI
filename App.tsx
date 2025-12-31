
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import QuizGenerator from './components/QuizGenerator';
import SmartGrader from './components/SmartGrader';
import Login from './components/Login';
import { Activity, User } from './types';
import { LayoutDashboard, BrainCircuit, FileCheck, User as UserIcon, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('dashboard');
  const [history, setHistory] = useState<Activity[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('edusmart_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("History parse error", e);
      }
    }

    const savedUser = localStorage.getItem('edusmart_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('edusmart_user');
      }
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('edusmart_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('edusmart_user');
    setCurrentView('dashboard');
  };

  const handleActivityLogged = (newActivity: Activity) => {
    const updated = [newActivity, ...history].slice(0, 10);
    setHistory(updated);
    localStorage.setItem('edusmart_history', JSON.stringify(updated));
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} history={history} user={user} />;
      case 'quiz':
        return <QuizGenerator onActivityLogged={handleActivityLogged} />;
      case 'grader':
        // Sécurité supplémentaire : même si l'URL ou l'état change, on bloque le rendu pour les étudiants
        if (user.role === 'ETUDIANT') return <Dashboard onNavigate={setCurrentView} history={history} user={user} />;
        return <SmartGrader onActivityLogged={handleActivityLogged} />;
      default:
        return <Dashboard onNavigate={setCurrentView} history={history} user={user} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F0F4F8]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar 
          currentView={currentView} 
          onNavigate={setCurrentView} 
          history={history} 
          isOpen={true}
          onClose={() => {}}
          user={user}
          onLogout={handleLogout}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-0 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 sticky top-0 z-30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
               <BrainCircuit size={16} className="text-white" />
            </div>
            <h1 className="font-extrabold text-gray-900 tracking-tight">EduSmart <span className="text-blue-600">IA</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">{user.role}</p>
                <p className="text-[10px] font-bold text-gray-400 truncate w-20">{user.name}</p>
             </div>
             <button onClick={handleLogout} className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
               <LogOut size={16} />
             </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>

      {/* Bottom Navigation for Mobile - Hidden grader for students */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-100 flex items-center justify-around p-3 pb-6 z-50">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === 'dashboard' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Accueil</span>
        </button>
        <button 
          onClick={() => setCurrentView('quiz')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'quiz' ? 'text-blue-600' : 'text-gray-400'}`}
        >
          <BrainCircuit size={24} strokeWidth={currentView === 'quiz' ? 2.5 : 2} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Quiz</span>
        </button>
        
        {user.role === 'PROFESSEUR' && (
          <button 
            onClick={() => setCurrentView('grader')}
            className={`flex flex-col items-center gap-1 transition-all ${currentView === 'grader' ? 'text-blue-600' : 'text-gray-400'}`}
          >
            <FileCheck size={24} strokeWidth={currentView === 'grader' ? 2.5 : 2} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Correction</span>
          </button>
        )}
      </nav>
    </div>
  );
};

export default App;
