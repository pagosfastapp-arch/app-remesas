import React from 'react';

export default function DetalleModal({ operacion, onClose }) {
  if (!operacion) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-slate-800 p-6 rounded-2xl max-w-lg w-full border border-slate-700 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3">
          <h3 className="text-lg font-bold text-white">Detalles de la Operación</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <p><strong>Cliente:</strong> {operacion.cliente}</p>
          <p><strong>Proveedor:</strong> {operacion.proveedor}</p>
          <p><strong>Monto Origen:</strong> {operacion.montoOrigen} {operacion.divisa}</p>
          <p><strong>Tasa Proveedor:</strong> {operacion.tasaProveedor}</p>
          <p><strong>Tasa Cliente:</strong> {operacion.tasaCliente}</p>
          <p><strong>Pago al Cliente:</strong> {operacion.pagoVesCliente?.toFixed(2)} VES</p>
          <p><strong>Total Proveedor VES:</strong> {operacion.totalProveedorVes?.toFixed(2)} VES</p>
          <p><strong>Comisión Bancaria (0.3%):</strong> {operacion.comisionBancaria?.toFixed(2)} VES</p>
          <p><strong>Ganancia Neta:</strong> <span className="text-emerald-400 font-bold">{operacion.utilidadNeta?.toFixed(2)} VES</span></p>
          <p><strong>Estado Cobro Proveedor:</strong> {operacion.estadoCobroProveedor || 'Pendiente'}</p>
          <p><strong>Estado Pago Cliente:</strong> {operacion.estadoPagoCliente || 'Pendiente'}</p>
          <p><strong>Registrado por:</strong> {operacion.usuarioRegistro}</p>
        </div>
        <div className="flex justify-end pt-3 border-t border-slate-700">
          <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}