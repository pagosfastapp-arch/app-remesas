import React, { useEffect } from 'react';

export default function RegistrarView({
  cliente, setCliente,
  proveedor, setProveedor,
  montoOrigen, setMontoOrigen,
  divisa, setDivisa,
  tasaProveedor, setTasaProveedor,
  tasaCliente, setTasaCliente,
  montoVesCliente, setMontoVesCliente,
  estadoCobroProveedor, setEstadoCobroProveedor,
  estadoPagoCliente, setEstadoPagoCliente,
  onFileChange,
  comprobanteOrigenBase64, setComprobanteOrigenBase64,
  comprobanteCobroBase64, setComprobanteCobroBase64,
  comprobantePagoBase64, setComprobantePagoBase64,
  editandoId, limpiarFormulario, handleGuardarRemesa, guardando
}) {
  const esMetodoDirectoUSDT = divisa === 'Bizum' || divisa === 'MXN' || divisa === 'Euros' || divisa === 'EUR';

  useEffect(() => {
    setEstadoCobroProveedor(comprobanteCobroBase64 ? 'Cobrado' : 'Pendiente');
  }, [comprobanteCobroBase64, setEstadoCobroProveedor]);

  useEffect(() => {
    setEstadoPagoCliente(comprobantePagoBase64 ? 'Pagado' : 'Pendiente');
  }, [comprobantePagoBase64, setEstadoPagoCliente]);

  const calcularMatematicas = () => {
    const mvesCliente = parseFloat(montoVesCliente) || 0;
    const comisionBancariaVes = mvesCliente * 0.003;
    const totalVesConComision = mvesCliente + comisionBancariaVes;

    if (esMetodoDirectoUSDT) {
      const usdtEntrantes = parseFloat(tasaProveedor) || 0; 
      const usdtSalidos = parseFloat(tasaCliente) || 0;      
      
      const utilidadNeta = usdtEntrantes - usdtSalidos;
      const tasaClienteImplicita = usdtSalidos > 0 ? totalVesConComision / usdtSalidos : 0;

      return {
        comisionBancaria: comisionBancariaVes,
        usdtSalidos,
        tasaClienteImplicita,
        utilidadNeta
      };
    } else {
      const numOrigen = parseFloat(montoOrigen) || 0;
      const tProveedor = parseFloat(tasaProveedor) || 0;
      const totalEntradaVes = numOrigen * tProveedor;
      const comisionBancaria = totalEntradaVes * 0.003;
      const utilidadNeta = totalEntradaVes - mvesCliente - comisionBancaria;

      return {
        comisionBancaria,
        usdtSalidos: 0,
        tasaClienteImplicita: 0,
        utilidadNeta
      };
    }
  };

  const { comisionBancaria, tasaClienteImplicita, utilidadNeta } = calcularMatematicas();

  return (
    <div className="max-w-xl mx-auto bg-slate-900/95 backdrop-blur-md p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl pb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
          {editandoId ? 'Editar Operación' : 'Registrar Nueva Operación'}
        </h2>
        {editandoId && (
          <button 
            type="button" 
            onClick={limpiarFormulario}
            className="text-xs bg-slate-800 hover:bg-slate-700 active:scale-95 px-3 py-1.5 rounded-xl text-slate-300 transition-all font-medium"
          >
            Cancelar Edición
          </button>
        )}
      </div>

      <form onSubmit={handleGuardarRemesa} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Nombre del Cliente</label>
          <input 
            type="text" required value={cliente} onChange={(e) => setCliente(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Proveedor Asignado</label>
          <input 
            type="text" required value={proveedor} onChange={(e) => setProveedor(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Ej: Proveedor México / Aliada"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Monto Origen</label>
            <input 
              type="number" step="any" required value={montoOrigen} onChange={(e) => setMontoOrigen(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Divisa</label>
            <select 
              value={divisa} onChange={(e) => setDivisa(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            >
              <option value="Zelle">Zelle</option>
              <option value="Bizum">Bizum</option>
              <option value="COP">COP</option>
              <option value="MXN">MXN</option>
              <option value="Paypal">Paypal</option>
              <option value="Guayaquil">Guayaquil</option>
              <option value="Euros">Euros</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {esMetodoDirectoUSDT ? 'USDT Entrantes' : 'Tasa Proveedor'}
            </label>
            <input 
              type="number" step="any" value={tasaProveedor} onChange={(e) => setTasaProveedor(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder={esMetodoDirectoUSDT ? "Ej: 40.90" : "0.00"}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              {esMetodoDirectoUSDT ? 'USDT Salidos' : 'Tasa Cliente'}
            </label>
            <input 
              type="number" step="any" value={tasaCliente} onChange={(e) => setTasaCliente(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder={esMetodoDirectoUSDT ? "Ej: 26.82" : "0.00"}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pago total al Cliente en VES (Bs Enviados)</label>
          <input 
            type="number" step="any" value={montoVesCliente} onChange={(e) => setMontoVesCliente(e.target.value)}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base sm:text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="0.00 VES"
          />
        </div>

        {/* Sección de Comprobantes */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Comprobante de Origen</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'origen')} className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 cursor-pointer bg-slate-950 border border-slate-800 rounded-2xl p-1" />
              {editandoId && comprobanteOrigenBase64 && (
                <button type="button" onClick={() => setComprobanteOrigenBase64('')} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium active:scale-95 transition-all">Quitar</button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Comprobante de Cobro (Proveedor)</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'cobro')} className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-500/10 file:text-amber-400 cursor-pointer bg-slate-950 border border-slate-800 rounded-2xl p-1" />
              {editandoId && comprobanteCobroBase64 && (
                <button type="button" onClick={() => setComprobanteCobroBase64('')} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium active:scale-95 transition-all">Quitar</button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Comprobante de Pago (Cliente)</label>
            <div className="flex items-center gap-2">
              <input type="file" accept="image/*" onChange={(e) => onFileChange(e, 'pago')} className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-500/10 file:text-blue-400 cursor-pointer bg-slate-950 border border-slate-800 rounded-2xl p-1" />
              {editandoId && comprobantePagoBase64 && (
                <button type="button" onClick={() => setComprobantePagoBase64('')} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl text-xs font-medium active:scale-95 transition-all">Quitar</button>
              )}
            </div>
          </div>
        </div>

        {/* Estados automáticos */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Cobro (Proveedor)</label>
            <div className={`w-full px-3 py-2.5 bg-slate-950 border rounded-2xl text-xs font-semibold text-center ${
              estadoCobroProveedor === 'Cobrado' || estadoCobroProveedor === 'Pagado'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                : 'text-amber-400 border-amber-500/30 bg-amber-500/5'
            }`}>
              {estadoCobroProveedor || 'Pendiente'}
              <span className="text-[10px] font-normal text-slate-500 block mt-0.5">Automático por Comprobante</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Pago (Cliente)</label>
            <div className={`w-full px-3 py-2.5 bg-slate-950 border rounded-2xl text-xs font-semibold text-center ${
              estadoPagoCliente === 'Pagado'
                ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5'
                : 'text-red-400 border-red-500/30 bg-red-500/5'
            }`}>
              {estadoPagoCliente || 'Pendiente'}
              <span className="text-[10px] font-normal text-slate-500 block mt-0.5">Automático por Comprobante</span>
            </div>
          </div>
        </div>

        {/* Resumen dinámico */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Comisión Bancaria (0.3%):</span>
            <span className="text-red-400 font-medium">{comisionBancaria.toFixed(2)} VES</span>
          </div>
          {esMetodoDirectoUSDT && (
            <div className="flex justify-between text-slate-400">
              <span>Tasa Cliente Deducida:</span>
              <span className="text-amber-400 font-medium">{tasaClienteImplicita.toFixed(2)} VES/USDT</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-900">
            <span className="text-slate-200">
              {esMetodoDirectoUSDT ? 'Ganancia Neta (USDT):' : 'Ganancia Neta Est. (VES):'}
            </span>
            <span className={utilidadNeta >= 0 ? "text-emerald-400" : "text-red-400"}>
              {utilidadNeta.toFixed(2)} {esMetodoDirectoUSDT ? 'USDT' : 'VES'}
            </span>
          </div>
        </div>

        <button 
          type="submit" disabled={guardando}
          className={`w-full py-3.5 text-white font-semibold rounded-2xl text-sm transition-all shadow-lg active:scale-[0.99] disabled:opacity-50 ${
            editandoId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
          }`}
        >
          {guardando ? 'Guardando...' : editandoId ? 'Actualizar Operación' : 'Registrar Operación'}
        </button>
      </form>
    </div>
  );
}