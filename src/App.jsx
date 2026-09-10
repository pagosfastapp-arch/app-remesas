import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

// Componentes
import Login from './components/Login';
import Navbar from './components/Navbar';
import ComprobanteModal from './components/ComprobanteModal';
import DetalleModal from './components/DetalleModal';

// Vistas
import DashboardView from './views/DashboardView';
import RegistrarView from './views/RegistrarView';
import HistorialView from './views/HistorialView';
import PendientesView from './views/PendientesView';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Form states
  const [cliente, setCliente] = useState('');
  const [proveedor, setProveedor] = useState('');
  const [montoOrigen, setMontoOrigen] = useState('');
  const [divisa, setDivisa] = useState('Zelle');
  const [tasaProveedor, setTasaProveedor] = useState('');
  const [tasaCliente, setTasaCliente] = useState('');
  const [montoVesCliente, setMontoVesCliente] = useState('');
  const [comprobanteOrigenBase64, setComprobanteOrigenBase64] = useState('');
  const [comprobanteCobroBase64, setComprobanteCobroBase64] = useState('');
  const [comprobantePagoBase64, setComprobantePagoBase64] = useState('');
  const [estadoCobroProveedor, setEstadoCobroProveedor] = useState('Pendiente');
  const [estadoPagoCliente, setEstadoPagoCliente] = useState('Pendiente');

  // Estados de Transacciones y Cierres
  const [transacciones, setTransacciones] = useState([]);
  const [cierres, setCierres] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  // Modales
  const [operacionSeleccionada, setOperacionSeleccionada] = useState(null);
  const [imagenModal, setImagenModal] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        cargarTransacciones();
        cargarCierres();
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password) => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    } finally {
      setLoading(false);
    }
  };

  const cargarTransacciones = async () => {
    try {
      const q = query(collection(db, 'transacciones'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      setTransacciones(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error cargando transacciones:", err);
    }
  };

  // --- FUNCIÓN INTELIGENTE DE MIGRACIÓN GLOBAL ---
  const cargarCierres = async () => {
    try {
      // 1. Cargar desde Firebase primero
      const q = query(collection(db, 'cierres'), orderBy('fechaGuardado', 'desc'));
      const querySnapshot = await getDocs(q);
      const cierresFirebase = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Escanear todo el localStorage buscando listas de datos guardadas en el teléfono
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        if (key && !key.includes('firebase') && !key.includes('authUser')) {
          try {
            const rawData = localStorage.getItem(key);
            const parsedData = JSON.parse(rawData);

            if (Array.isArray(parsedData) && parsedData.length > 0) {
              console.log(`¡Datos encontrados en la clave local: "${key}"! Migrando a Firebase...`);

              for (const cierre of parsedData) {
                await addDoc(collection(db, 'cierres'), {
                  ...cierre,
                  fechaGuardado: serverTimestamp()
                });
              }

              localStorage.removeItem(key);
              return cargarCierres();
            }
          } catch (e) {
            // Ignorar claves que no sean JSON válidos
          }
        }
      }

      // 3. Actualizar el estado con lo que hay en Firebase
      setCierres(cierresFirebase);
    } catch (err) {
      console.error("Error cargando cierres:", err);
    }
  };

  const handleGuardarCierre = async (nuevoCierre) => {
    try {
      const cierreData = {
        ...nuevoCierre,
        fechaGuardado: serverTimestamp()
      };
      await addDoc(collection(db, 'cierres'), cierreData);
      cargarCierres();
    } catch (err) {
      console.error("Error al guardar el cierre:", err);
      alert("Hubo un error al sincronizar el cierre en la nube.");
    }
  };

  const handleDeshacerCierre = async (idCierre) => {
    try {
      await deleteDoc(doc(db, 'cierres', idCierre));
      cargarCierres();
    } catch (err) {
      console.error("Error al deshacer el cierre:", err);
      alert("Hubo un error al eliminar el cierre de la nube.");
    }
  };

  const calcularMatematicas = () => {
    const origen = parseFloat(montoOrigen) || 0;
    const tProv = parseFloat(tasaProveedor) || 0;
    const pagoVes = parseFloat(montoVesCliente) || 0;
    const totalProveedorVes = origen * tProv;
    const comisionBancaria = pagoVes * 0.003;
    const utilidadNeta = totalProveedorVes - pagoVes - comisionBancaria;
    return { totalProveedorVes, comisionBancaria, utilidadNeta };
  };

  const handleFileChange = (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (tipo === 'origen') setComprobanteOrigenBase64(reader.result);
      if (tipo === 'cobro') setComprobanteCobroBase64(reader.result);
      if (tipo === 'pago') setComprobantePagoBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const limpiarFormulario = () => {
    setCliente(''); setProveedor(''); setMontoOrigen(''); setTasaProveedor('');
    setTasaCliente(''); setMontoVesCliente(''); setComprobanteOrigenBase64('');
    setComprobanteCobroBase64(''); setComprobantePagoBase64('');
    setEstadoCobroProveedor('Pendiente'); setEstadoPagoCliente('Pendiente');
    setEditandoId(null);
  };

  const handleGuardarRemesa = async (e) => {
    e.preventDefault();
    setGuardando(true);
    const { totalProveedorVes, comisionBancaria, utilidadNeta } = calcularMatematicas();

    try {
      const datosRemesa = {
        cliente, proveedor, montoOrigen: parseFloat(montoOrigen), divisa,
        tasaProveedor: parseFloat(tasaProveedor), tasaCliente: parseFloat(tasaCliente),
        pagoVesCliente: parseFloat(montoVesCliente), totalProveedorVes,
        comisionBancaria, utilidadNeta, estadoCobroProveedor, estadoPagoCliente,
        usuarioRegistro: user.email,
        urlComprobanteOrigen: comprobanteOrigenBase64,
        urlComprobanteCobro: comprobanteCobroBase64,
        urlComprobantePago: comprobantePagoBase64
      };

      if (editandoId) {
        await updateDoc(doc(db, 'transacciones', editandoId), datosRemesa);
        alert('¡Remesa actualizada con éxito!');
      } else {
        datosRemesa.fecha = serverTimestamp();
        await addDoc(collection(db, 'transacciones'), datosRemesa);
        alert('¡Remesa registrada con éxito!');
      }

      limpiarFormulario();
      cargarTransacciones();
      setActiveTab('historial');
    } catch (err) {
      console.error("Error al guardar:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setGuardando(false);
    }
  };

  const handleIniciarEdicion = (tx, e) => {
    e.stopPropagation();
    setEditandoId(tx.id);
    setCliente(tx.cliente || '');
    setProveedor(tx.proveedor || '');
    setMontoOrigen(tx.montoOrigen || '');
    setDivisa(tx.divisa || 'Zelle');
    setTasaProveedor(tx.tasaProveedor || '');
    setTasaCliente(tx.tasaCliente || '');
    setMontoVesCliente(tx.pagoVesCliente || '');
    setComprobanteOrigenBase64(tx.urlComprobanteOrigen || '');
    setComprobanteCobroBase64(tx.urlComprobanteCobro || '');
    setComprobantePagoBase64(tx.urlComprobantePago || '');
    setEstadoCobroProveedor(tx.estadoCobroProveedor || 'Pendiente');
    setEstadoPagoCliente(tx.estadoPagoCliente || 'Pendiente');
    setActiveTab('registrar');
  };

  const handleEliminar = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta operación?')) return;
    try {
      await deleteDoc(doc(db, 'transacciones', id));
      cargarTransacciones();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const cambiarEstadoRapido = async (id, campo, valorActual, e) => {
    e.stopPropagation();
    const nuevoValor = valorActual === 'Pendiente' ? 'Pagado' : 'Pendiente';
    try {
      await updateDoc(doc(db, 'transacciones', id), { [campo]: nuevoValor });
      cargarTransacciones();
    } catch (err) {
      console.error("Error al actualizar estado:", err);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} error={error} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 relative">
      <div className="max-w-6xl mx-auto">
        <Navbar 
          user={user} 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onLogout={() => signOut(auth)} 
        />

        {activeTab === 'dashboard' && (
          <DashboardView 
            transacciones={transacciones} 
            cierres={cierres}
            onGuardarCierre={handleGuardarCierre}
            onDeshacerCierre={handleDeshacerCierre}
          />
        )}
        
        {activeTab === 'registrar' && (
          <RegistrarView 
            {...{
              cliente, setCliente, proveedor, setProveedor, montoOrigen, setMontoOrigen,
              divisa, setDivisa, tasaProveedor, setTasaProveedor, tasaCliente, setTasaCliente,
              montoVesCliente, setMontoVesCliente, estadoCobroProveedor, setEstadoCobroProveedor,
              estadoPagoCliente, setEstadoPagoCliente, onFileChange: handleFileChange,
              comprobanteOrigenBase64, setComprobanteOrigenBase64,
              comprobanteCobroBase64, setComprobanteCobroBase64,
              comprobantePagoBase64, setComprobantePagoBase64,
              editandoId, limpiarFormulario, handleGuardarRemesa, guardando, calcularMatematicas
            }}
          />
        )}

        {activeTab === 'historial' && (
          <HistorialView 
            transacciones={transacciones}
            onEditar={handleIniciarEdicion}
            onEliminar={handleEliminar}
            onCambiarEstado={cambiarEstadoRapido}
            onVerImagen={setImagenModal}
            onSeleccionarOperacion={setOperacionSeleccionada}
          />
        )}

        {activeTab === 'pendientes' && (
          <PendientesView 
            transacciones={transacciones}
            onCambiarEstado={cambiarEstadoRapido}
            onVerImagen={setImagenModal}
            onSeleccionarOperacion={setOperacionSeleccionada}
          />
        )}
      </div>

      <ComprobanteModal imagenUrl={imagenModal} onClose={() => setImagenModal(null)} />
      <DetalleModal operacion={operacionSeleccionada} onClose={() => setOperacionSeleccionada(null)} />
    </div>
  );
}