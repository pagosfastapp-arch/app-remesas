import React from 'react';

export default function DashboardView({ transacciones }) {
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

  // Utilidad acumulada solo de operaciones donde NINGUNA de las dos partes esté pendiente
  const utilidadVesAcumulada = transacciones
    .filter(tx => {
      const divisaUpper = (tx.divisa || '').toUpperCase();
      const esDirectoUSDT = ['BIZUM', 'MXN', 'EUROS', 'EUR'].includes(divisaUpper);
      
      const cobroPendiente = (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente';
      const pagoPendiente = (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente';
      
      // Debe NO tener pendientes
      return !esDirectoUSDT && !cobroPendiente && !pagoPendiente;
    })
    .reduce((acc, tx) => acc + (parseFloat(tx.utilidadNeta) || 0), 0);

  const utilidadUsdtAcumulada = transacciones
    .filter(tx => {
      const divisaUpper = (tx.divisa || '').toUpperCase();
      const esDirectoUSDT = ['BIZUM', 'MXN', 'EUROS', 'EUR'].includes(divisaUpper);
      
      const cobroPendiente = (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente';
      const pagoPendiente = (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente';
      
      // Debe ser USDT directo y NO tener pendientes
      return esDirectoUSDT && !cobroPendiente && !pagoPendiente;
    })
    .reduce((acc, tx) => {
      const tasaProv = parseFloat(tx.tasaProveedor) || 0;
      const tasaClte = parseFloat(tx.tasaCliente) || 0;
      const gananciaUsdt = tasaProv - tasaClte;
      
      return acc + gananciaUsdt;
    }, 0);

  return (
    <div className="space-y-4 sm:space-y-6 pb-6">
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
            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Utilidad Neta Total</p>
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

      <div className="bg-slate-900/90 backdrop-blur-md p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg">
        <h2 className="text-base sm:text-lg font-semibold text-white mb-2">Resumen General del Negocio</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Monitorea el estado global de tus remesas, verifica saldos pendientes y gestiona tus cobros y pagos con una experiencia fluida y optimizada.
        </p>
      </div>
    </div>
  );
}