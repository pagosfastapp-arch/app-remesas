import React from 'react';

export default function PendientesView({ transacciones, onVerImagen, onSeleccionarOperacion }) {
  const pendientes = transacciones.filter(
    tx => (tx.estadoCobroProveedor || 'Pendiente') === 'Pendiente' || (tx.estadoPagoCliente || 'Pendiente') === 'Pendiente'
  );

  return (
    <div className="bg-slate-900/90 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-xl">
      <h2 className="text-base sm:text-lg font-semibold mb-1 text-white">Operaciones con Saldos Pendientes</h2>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">Listado de transacciones con cobros o pagos pendientes (el estado cambia automáticamente al subir su comprobante).</p>

      <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
        <table className="w-full text-left text-sm text-slate-300 min-w-[600px]">
          <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider rounded-xl">
            <tr>
              <th className="p-3 rounded-l-xl">Cliente / Prov.</th>
              <th className="p-3">Monto Origen</th>
              <th className="p-3">Pago VES</th>
              <th className="p-3 text-center">Cobro Prov.</th>
              <th className="p-3 text-center">Pago Clte.</th>
              <th className="p-3 text-center rounded-r-xl">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {pendientes.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-slate-500 text-xs">¡Excelente! No hay operaciones pendientes.</td></tr>
            ) : (
              pendientes.map((tx) => {
                const estadoCobro = tx.estadoCobroProveedor || 'Pendiente';
                const estadoPago = tx.estadoPagoCliente || 'Pendiente';

                return (
                  <tr key={tx.id} onClick={() => onSeleccionarOperacion(tx)} className="hover:bg-slate-800/40 active:bg-slate-800/60 cursor-pointer transition-colors">
                    <td className="p-3">
                      <div className="font-medium text-white">{tx.cliente}</div>
                      <div className="text-[11px] text-slate-400">Prov: {tx.proveedor}</div>
                    </td>
                    <td className="p-3 text-xs sm:text-sm">{tx.montoOrigen} {tx.divisa}</td>
                    <td className="p-3 font-semibold text-white text-xs sm:text-sm">{tx.pagoVesCliente?.toFixed(2)} VES</td>
                    
                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border inline-block ${
                        estadoCobro === 'Pagado' || estadoCobro === 'Cobrado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {estadoCobro}
                      </span>
                    </td>

                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border inline-block ${
                        estadoPago === 'Pagado' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {estadoPago}
                      </span>
                    </td>

                    <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                      {tx.urlComprobanteOrigen && (
                        <button onClick={() => onVerImagen(tx.urlComprobanteOrigen)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-medium active:scale-95 transition-all">
                          📁 Ver
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}