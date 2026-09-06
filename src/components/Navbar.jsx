import React from 'react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'registrar', icon: '➕', label: 'Registrar' },
    { id: 'historial', icon: '📋', label: 'Historial' },
    { id: 'pendientes', icon: '⏳', label: 'Pendientes' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 px-3 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-2xl flex items-center justify-between gap-2">
      <div className="flex items-center gap-1 flex-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex-1 py-1.5 px-1 rounded-xl text-[10px] sm:text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="truncate w-full text-center leading-tight">{item.label}</span>
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        title="Cerrar Sesión"
        className="p-2.5 bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium rounded-xl transition-colors border border-red-500/20 flex items-center justify-center shrink-0"
      >
        🚪
      </button>
    </nav>
  );
}