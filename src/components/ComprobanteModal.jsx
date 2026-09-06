import React, { useState } from 'react';

export default function ComprobanteModal({ imagenUrl, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!imagenUrl) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="relative bg-slate-800 p-4 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col items-center border border-slate-700">
        <div className="flex justify-between w-full items-center mb-2">
          <h3 className="text-sm font-semibold text-white">Visualizar Comprobante</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.25, 3))}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs rounded text-white"
            >
              Acercar (+)
            </button>
            <button 
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.25, 0.5))}
              className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs rounded text-white"
            >
              Alejar (-)
            </button>
            <button 
              onClick={onClose}
              className="px-2 py-1 bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white text-xs rounded transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
        <div className="overflow-auto w-full flex-1 flex items-center justify-center p-2">
          <img 
            src={imagenUrl} 
            alt="Comprobante" 
            style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.1s ease' }}
            className="max-h-[70vh] object-contain rounded"
          />
        </div>
      </div>
    </div>
  );
}