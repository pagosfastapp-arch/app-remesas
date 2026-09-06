import React, { useState } from 'react';

export default function HistorialView({ transacciones, onEditar, onEliminar, onVerImagen }) {
  const [detalleTx, setDetalleTx] = useState(null);

  const handleCardClick = (tx) => {
    setDetalleTx(tx);
  };

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl relative">
      <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">Historial de Movimientos</h2>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">Toca cualquier tarjeta para ver todos los detalles y gestionar los comprobantes.</p>
      
      <div className="space-y-3">
        {transacciones.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-800/60">
            No hay transacciones registradas.
          </div>
        ) : (
          transacciones.map((tx) => {
            const esDirectoUSDT = tx.divisa === 'Bizum' || tx.divisa === 'MXN' || tx.divisa === 'Euros' || tx.divisa === 'EUR';
            const ganancia = esDirectoUSDT 
              ? (parseFloat(tx.tasaProveedor) || 0) - (parseFloat(tx.tasaCliente) || 0)
              : (tx.utilidadNeta || 0);

            const estadoCobro = tx.estadoCobroProveedor || 'Pendiente';
            const estadoPago = tx.estadoPagoCliente || 'Pendiente';

            // Contar cuántos pendientes tiene la operación (1 o 2)
            let pendientesCount = 0;
            if (estadoCobro === 'Pendiente') pendientesCount++;
            if (estadoPago === 'Pendiente') pendientesCount++;

            return (
              <div 
                key={tx.id} 
                onClick={() => handleCardClick(tx)}
                className="bg-slate-950/70 hover:bg-slate-800/50 active:scale-[0.99] border border-slate-800/80 p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all shadow-md relative overflow-hidden"
              >
                {/* Lado izquierdo: Cliente, Proveedor, Monto Origen y Ganancia */}
                <div className="space-y-1 pr-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white text-sm tracking-tight">{tx.cliente}</span>
                    {pendientesCount > 0 && (
                      <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                        {pendientesCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    Prov: <strong className="text-slate-300">{tx.proveedor}</strong>
                  </div>
                  <div className="flex items-center gap-3 pt-0.5 flex-wrap">
                    <span className="text-xs font-bold text-cyan-400">
                      {tx.montoOrigen} {tx.divisa}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-400">
                      Gan: {ganancia.toFixed(2)} {esDirectoUSDT ? 'USDT' : 'VES'}
                    </span>
                  </div>
                </div>

                {/* Lado derecho: Acciones rápidas (Editar / Eliminar) */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={(e) => onEditar(tx, e)} 
                    className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 active:scale-95 transition-all text-xs"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={(e) => onEliminar(tx.id, e)} 
                    className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20 active:scale-95 transition-all text-xs"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Único de Detalle Completo de la Operación */}
      {detalleTx && (() => {
        const tx = detalleTx;
        const esDirectoUSDT = tx.divisa === 'Bizum' || tx.divisa === 'MXN' || tx.divisa === 'Euros' || tx.divisa === 'EUR';
        const ganancia = esDirectoUSDT 
          ? (parseFloat(tx.tasaProveedor) || 0) - (parseFloat(tx.tasaCliente) || 0)
          : (tx.utilidadNeta || 0);

        const compOrigen = tx.urlComprobanteOrigen || tx.comprobanteOrigenBase64;
        const compCobro = tx.urlComprobanteCobro || tx.comprobanteCobroBase64;
        const compPago = tx.urlComprobantePago || tx.comprobantePagoBase64;

        return (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
              
              {/* Cabecera del Detalle */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{tx.cliente}</h3>
                  <p className="text-xs text-slate-400">Proveedor: <span className="text-slate-200 font-medium">{tx.proveedor}</span></p>
                </div>
                <button 
                  onClick={() => setDetalleTx(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 text-sm font-bold transition-all active:scale-95"
                >
                  ✕
                </button>
              </div>

              {/* Información Financiera Completa */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Monto Origen</span>
                  <strong className="text-white text-sm">{tx.montoOrigen} {tx.divisa}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Pago VES (Cliente)</span>
                  <strong className="text-white text-sm">{tx.pagoVesCliente ? tx.pagoVesCliente.toFixed(2) : '0.00'} VES</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tasa Cliente</span>
                  <strong className="text-slate-200">{tx.tasaCliente || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Tasa Proveedor</span>
                  <strong className="text-slate-200">{tx.tasaProveedor || '-'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Estado Cobro Prov.</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md inline-block ${
                    (tx.estadoCobroProveedor || 'Pendiente') === 'Cobrado' || (tx.estadoCobroProveedor || 'Pendiente') === 'Pagado'
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                  }`}>
                    {tx.estadoCobroProveedor || 'Pendiente'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Estado Pago Clte.</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-md inline-block ${
                    (tx.estadoPagoCliente || 'Pendiente') === 'Pagado'
                      ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                      : 'text-red-400 bg-red-500/10 border border-red-500/20'
                  }`}>
                    {tx.estadoPagoCliente || 'Pendiente'}
                  </span>
                </div>
                {tx.referencia && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Referencia / Notas</span>
                    <strong className="text-slate-200">{tx.referencia}</strong>
                  </div>
                )}
                <div className="col-span-2 pt-2 border-t border-slate-900 flex justify-between items-center">
                  <span className="text-slate-400">Ganancia Neta:</span>
                  <strong className="text-emerald-400 text-sm font-bold">
                    {ganancia.toFixed(2)} {esDirectoUSDT ? 'USDT' : 'VES'}
                  </strong>
                </div>
              </div>

              {/* Sección de Comprobantes con Botones Interactivos */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Comprobantes</h4>
                
                <div className="grid grid-cols-1 gap-2">
                  {/* Comprobante de Origen */}
                  {compOrigen ? (
                    <button 
                      onClick={() => onVerImagen && onVerImagen(compOrigen)}
                      className="w-full flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 transition-all active:scale-[0.99] group shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">📁</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Origen</div>
                          <div className="text-[10px] text-emerald-400 font-medium">Cargado • Toca para ver imagen</div>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-emerald-500/30 transition-all">Ver</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setDetalleTx(null); onEditar(tx); }}
                      className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 transition-all active:scale-[0.99] group border-dashed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">⚠️</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Origen Faltante</div>
                          <div className="text-[10px] text-amber-400 font-medium">Clic aquí para subirlo y actualizar</div>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-amber-500/30 transition-all">Subir</span>
                    </button>
                  )}

                  {/* Comprobante de Cobro Proveedor */}
                  {compCobro ? (
                    <button 
                      onClick={() => onVerImagen && onVerImagen(compCobro)}
                      className="w-full flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 transition-all active:scale-[0.99] group shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">📁</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Cobro (Proveedor)</div>
                          <div className="text-[10px] text-emerald-400 font-medium">Cargado • Toca para ver imagen</div>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-emerald-500/30 transition-all">Ver</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setDetalleTx(null); onEditar(tx); }}
                      className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 transition-all active:scale-[0.99] group border-dashed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">⚠️</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Cobro Faltante</div>
                          <div className="text-[10px] text-amber-400 font-medium">Clic aquí para subirlo y actualizar</div>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-amber-500/30 transition-all">Subir</span>
                    </button>
                  )}

                  {/* Comprobante de Pago Cliente */}
                  {compPago ? (
                    <button 
                      onClick={() => onVerImagen && onVerImagen(compPago)}
                      className="w-full flex items-center justify-between p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400 transition-all active:scale-[0.99] group shadow-md"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">📁</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Pago (Cliente)</div>
                          <div className="text-[10px] text-emerald-400 font-medium">Cargado • Toca para ver imagen</div>
                        </div>
                      </div>
                      <span className="text-xs bg-emerald-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-emerald-500/30 transition-all">Ver</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setDetalleTx(null); onEditar(tx); }}
                      className="w-full flex items-center justify-between p-3 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-2xl text-amber-400 transition-all active:scale-[0.99] group border-dashed"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-base">⚠️</span>
                        <div className="text-left">
                          <div className="text-xs font-bold text-white">Comprobante de Pago Faltante</div>
                          <div className="text-[10px] text-amber-400 font-medium">Clic aquí para subirlo y actualizar</div>
                        </div>
                      </div>
                      <span className="text-xs bg-amber-500/20 px-2.5 py-1 rounded-xl font-semibold group-hover:bg-amber-500/30 transition-all">Subir</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Botón Inferior de Editar Operación */}
              <button 
                onClick={() => { setDetalleTx(null); onEditar(tx); }}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl text-xs transition-all shadow-lg active:scale-[0.99]"
              >
                Editar Operación Completa
              </button>

            </div>
          </div>
        );
      })()}
    </div>
  );
}