import React from 'react';

export default function Navbar({ user, activeTab, setActiveTab, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'registrar', label: '➕ Registrar Operación' },
    { id: 'historial', label: '📋 Historial' },
    { id: 'pendientes', label: '⏳ Pendientes' },
  ];

  return (
    <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-xl mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
      <div>
        <h1 className="text-xl font-bold text-white">Panel de Control Financiero</h1>
        <p className="text-slate-400 text-xs">Usuario: <span className="text-blue-400">{user.email}</span></p>
      </div>

      <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-700">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <button 
        onClick={onLogout}
        className="px-3 py-2 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs font-medium rounded-lg transition-colors border border-red-500/30"
      >
        Cerrar Sesión
      </button>
    </div>
  );
}