import React, { useState } from 'react';

export default function DashboardView({ 
  transacciones, 
  cierres = [], 
  onGuardarCierre, 
  onDeshacerCierre 
}) {
  const [mostrarModalCierre, setMostrarModalCierre] = useState(false);
  
  const idsCerrados = cierres.flatMap(c => c.keysCerradas || []);

  const totalCobrarProv = transacciones
    .filter(tx => (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente')
    .reduce((acc, tx) => acc + (parseFloat(tx.montoOrigen) || 0), 0);

  const totalPagarCliente = transacciones
    .filter(tx => (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente')
    .reduce((acc, tx) => acc + (parseFloat(tx.pagoVesCliente) || 0), 0);

  const operacionesPendientesCount = transacciones
    .filter(tx => 
      (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente' || 
      (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente'
    ).length;

  // Clave estable basada en propiedades únicas (sin depender del índice del array para evitar desincronizaciones)
  const getTxKey = (tx) => tx.id || `${tx.fecha || ''}-${tx.montoOrigen || ''}-${tx.tasaCliente || ''}-${tx.pagoVesCliente || ''}`;

  const txCompletadasVes = transacciones
    .map(tx => ({ tx }))
    .filter(({ tx }) => {
      const key = getTxKey(tx);
      if (idsCerrados.includes(key)) return false;

      const divisaUpper = (tx.divisa || '').toUpperCase();
      const esDirectoUSDT = ['BIZUM', 'MXN', 'EUROS', 'EUR'].includes(divisaUpper);
      const cobroPendiente = (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente';
      const pagoPendiente = (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente';
      return !esDirectoUSDT && !cobroPendiente && !pagoPendiente;
    });

  const utilidadVesAcumulada = txCompletadasVes.reduce((acc, { tx }) => acc + (parseFloat(tx.utilidadNeta) || 0), 0);

  const txCompletadasUsdt = transacciones
    .map(tx => ({ tx }))
    .filter(({ tx }) => {
      const key = getTxKey(tx);
      if (idsCerrados.includes(key)) return false;

      const divisaUpper = (tx.divisa || '').toUpperCase();
      const esDirectoUSDT = ['BIZUM', 'MXN', 'EUROS', 'EUR'].includes(divisaUpper);
      const cobroPendiente = (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente';
      const pagoPendiente = (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente';
      return esDirectoUSDT && !cobroPendiente && !pagoPendiente;
    });

  const utilidadUsdtAcumulada = txCompletadasUsdt.reduce((acc, { tx }) => {
    const tasaProv = parseFloat(tx.tasaProveedor) || 0;
    const tasaClte = parseFloat(tx.tasaCliente) || 0;
    return acc + (tasaProv - tasaClte);
  }, 0);

  const totalOpsCerrables = txCompletadasVes.length + txCompletadasUsdt.length;

  // Verificación exacta de si se han registrado operaciones nuevas después del último cierre
  const ultimoCierre = cierres[0];
  const seRegistraronOpsDespues = ultimoCierre ? (
    ultimoCierre.totalTransaccionesAlCerrar !== undefined 
      ? transacciones.length > ultimoCierre.totalTransaccionesAlCerrar 
      : totalOpsCerrables > 0
  ) : false;

  const ejecutarCierre = async () => {
    if (totalOpsCerrables === 0 && utilidadVesAcumulada === 0 && utilidadUsdtAcumulada === 0) {
      alert('No hay ganancias nuevas para cerrar en este momento.');
      return;
    }

    const keysNuevas = [
      ...txCompletadasVes.map(({ tx }) => getTxKey(tx)),
      ...txCompletadasUsdt.map(({ tx }) => getTxKey(tx))
    ];

    const nuevoCierre = {
      id: Date.now().toString(),
      fecha: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      opsCount: totalOpsCerrables,
      ves: utilidadVesAcumulada,
      usdt: utilidadUsdtAcumulada,
      keysCerradas: keysNuevas,
      totalTransaccionesAlCerrar: transacciones.length, // Almacenamos el total exacto de transacciones al momento del cierre
    };

    if (onGuardarCierre) {
      await onGuardarCierre(nuevoCierre);
      setMostrarModalCierre(false);
      alert('¡Cierre sincronizado con éxito en todos los dispositivos!');
    } else {
      alert('Error: La función de guardado en la nube no está conectada.');
    }
  };

  const deshacerCierre = async (cierreEspecificoId = null) => {
    if (cierres.length === 0) return;
    
    const idAEliminar = cierreEspecificoId || ultimoCierre?.id;
    const cierreObj = cierres.find(c => c.id === idAEliminar) || ultimoCierre;

    const keysVacias = !cierreObj.keysCerradas || cierreObj.keysCerradas.length === 0;
    const sinMontos = (!cierreObj.ves || cierreObj.ves === 0) && (!cierreObj.usdt || cierreObj.usdt === 0);
    const esVacio = keysVacias && sinMontos;

    const hayOpsDespues = cierreObj.totalTransaccionesAlCerrar !== undefined 
      ? transacciones.length > cierreObj.totalTransaccionesAlCerrar 
      : totalOpsCerrables > 0;

    // Traba de seguridad: Solo se permite deshacer si no se han registrado operaciones después del cierre
    if (!cierreEspecificoId && hayOpsDespues && !esVacio) {
      alert('⛔ ACCIÓN DENEGADA:\nNo se puede deshacer el cierre anterior porque ya se han registrado nuevas operaciones después de este cierre.\n\nPara mantener una contabilidad sana y evitar alteraciones en los saldos, debes realizar un nuevo cierre o eliminar las operaciones añadidas.');
      return;
    }

    if (cierreEspecificoId && !window.confirm('¿Seguro que deseas eliminar este registro de cierre vacío?')) {
      return;
    }
    
    if (onDeshacerCierre) {
      await onDeshacerCierre(idAEliminar);
      alert(esVacio ? '¡Cierre vacío eliminado con éxito!' : '¡Cierre deshecho con éxito! Las operaciones han regresado al dashboard.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
      <div className="flex justify-end">
        <button
          onClick={() => setMostrarModalCierre(true)}
          className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
        >
          <span>🔒</span>
          <span>Realizar Cierre de Período</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        
        <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between active:scale-[0.99] transition-all">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Por Cobrar (Prov.)</p>
            <h3 className="text-lg sm:text-xl font-bold text-amber-400">{totalCobrarProv.toFixed(2)} Divisas</h3>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400">⏳</div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between active:scale-[0.99] transition-all">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Por Pagar (Clte.)</p>
            <h3 className="text-lg sm:text-xl font-bold text-red-400">{totalPagarCliente.toFixed(2)} VES</h3>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400">💸</div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between active:scale-[0.99] transition-all">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Utilidad Neta Actual (Sin Cierre)</p>
            <div className="space-y-0.5 sm:space-y-1">
              <div className="text-sm sm:text-base font-bold text-emerald-400">{utilidadVesAcumulada.toFixed(2)} VES</div>
              <div className="text-sm sm:text-base font-bold text-cyan-400">{utilidadUsdtAcumulada.toFixed(2)} USDT</div>
            </div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400">📈</div>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between active:scale-[0.99] transition-all">
          <div>
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Ops. con Pendientes</p>
            <h3 className="text-lg sm:text-xl font-bold text-blue-400">{operacionesPendientesCount}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400">📋</div>
        </div>

      </div>

      {/* Historial de Cierres */}
      <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg space-y-4">
        <h2 className="text-base sm:text-lg font-semibold text-white flex items-center gap-2">
          <span>🗂️</span> Historial de Cierres Realizados
        </h2>
        {cierres.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-400 italic">
            Aún no hay cierres registrados. Realiza tu primer cierre para comenzar a acumular el historial.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {cierres.map((cierre, index) => {
              const esUltimo = index === 0;
              const keysVacias = !cierre.keysCerradas || cierre.keysCerradas.length === 0;
              const sinMontos = (!cierre.ves || cierre.ves === 0) && (!cierre.usdt || cierre.usdt === 0);
              const esVacio = keysVacias && sinMontos;

              return (
                <div key={cierre.id || index} className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-emerald-400">Cierre #{cierres.length - index}</span>
                      
                      {esVacio ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deshacerCierre(cierre.id);
                          }}
                          title="Eliminar cierre vacío"
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors border shadow-sm bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border-red-500/30 flex items-center gap-1"
                        >
                          <span>🗑️</span> Eliminar Vacío
                        </button>
                      ) : esUltimo && (
                        <button
                          onClick={() => deshacerCierre()}
                          disabled={seRegistraronOpsDespues}
                          title={seRegistraronOpsDespues ? "Bloqueado por seguridad: Ya se registraron operaciones después de este cierre" : "Deshacer este cierre"}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-colors border shadow-sm ${
                            seRegistraronOpsDespues 
                              ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed opacity-70' 
                              : 'bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white border-red-500/30'
                          }`}
                        >
                          {seRegistraronOpsDespues ? '🔒 Cierre Bloqueado' : '↩️ Deshacer Cierre'}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{cierre.fecha || 'Fecha no registrada'}</p>
                    <p className="text-xs text-slate-300 mt-1">{cierre.opsCount || 0} operaciones liquidadas</p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm font-bold text-emerald-400">{Number(cierre.ves || 0).toFixed(2)} VES</div>
                    <div className="text-sm font-bold text-cyan-400">{Number(cierre.usdt || 0).toFixed(2)} USDT</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {mostrarModalCierre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>📊</span> Confirmar Cierre de Período
                </h3>
                <p className="text-xs text-slate-400">Esto reiniciará las ganancias actuales del dashboard</p>
              </div>
              <button 
                onClick={() => setMostrarModalCierre(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex justify-between items-center">
                <span className="text-xs text-slate-400">Operaciones a cerrar:</span>
                <span className="text-sm font-bold text-white">{totalOpsCerrables} operaciones</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400">Ganancia en VES a liquidar:</span>
                <div className="text-xl font-extrabold text-emerald-400">{utilidadVesAcumulada.toFixed(2)} VES</div>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-xs text-slate-400">Ganancia en USDT a liquidar:</span>
                <div className="text-xl font-extrabold text-cyan-400">{utilidadUsdtAcumulada.toFixed(2)} USDT</div>
              </div>

              <p className="text-[11px] text-amber-400/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-center">
                ⚠️ Al confirmar, estas ganancias se archivarán en la base de datos y el dashboard volverá a cero en todos los equipos.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setMostrarModalCierre(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={ejecutarCierre}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-600/30 transition-all"
              >
                Confirmar y Sincronizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}