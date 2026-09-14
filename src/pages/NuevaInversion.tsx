import { useState, useEffect } from "react";
import { obtenerFondosActivos, crearInversion } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Css/NuevaInversion.css";

function NuevaInversion() {
  const { usuario } = useAuth();
  const [fondos, setFondos] = useState<any[]>([]);
  const [fondoSeleccionado, setFondoSeleccionado] = useState<any>(null);
  const [monto, setMonto] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  useEffect(() => {
    cargarFondos();
  }, []);

  async function cargarFondos() {
    try {
      const data = await obtenerFondosActivos();
      setFondos(data);
      if (data.length > 0) {
        setFondoSeleccionado(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function confirmarInversion() {
    if (!monto || !fondoSeleccionado) {
      setError("Selecciona fondo y monto");
      return;
    }

    if (parseFloat(monto) <= 0) {
      setError("El monto debe ser mayor a 0");
      return;
    }

    setCargando(true);
    setError("");
    setExito("");

    try {
      await crearInversion({
        usuarioId: usuario?.id,
        fondoId: fondoSeleccionado.id,
        montoInvertido: parseFloat(monto),
      });

      setExito("¡Inversión creada correctamente!");
      setMonto("");
      setTimeout(() => {
        setExito("");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Error al crear inversión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="investment-page">
      <h1>Nueva inversión</h1>
      <p>Invierte tu dinero en fondos mutuos disponibles.</p>

      <section className="investment-form">
        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
        {exito && <div style={{ color: "green", marginBottom: "10px" }}>{exito}</div>}

        <label>Seleccionar fondo</label>
        <select
          value={fondoSeleccionado?.id || ""}
          onChange={(e) => {
            const fondo = fondos.find((f) => f.id === parseInt(e.target.value));
            setFondoSeleccionado(fondo);
          }}
          disabled={cargando || fondos.length === 0}
        >
          <option>-- Selecciona un fondo --</option>
          {fondos.map((fondo) => (
            <option key={fondo.id} value={fondo.id}>
              {fondo.nombre} (Cuota: ${fondo.valorCuota.toFixed(2)})
            </option>
          ))}
        </select>

        <label>Monto a invertir</label>
        <input
          type="number"
          placeholder="Ingrese monto"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          disabled={cargando}
        />

        {fondoSeleccionado && (
          <div className="summary">
            <h3>Resumen</h3>
            <p><strong>Fondo:</strong> {fondoSeleccionado.nombre}</p>
            <p><strong>Descripción:</strong> {fondoSeleccionado.descripcion}</p>
            <p><strong>Valor cuota:</strong> ${fondoSeleccionado.valorCuota.toFixed(2)}</p>
            <p><strong>Monto:</strong> ${monto || "0"}</p>
            {monto && (
              <p>
                <strong>Cuotas a adquirir:</strong>{" "}
                {(parseFloat(monto) / fondoSeleccionado.valorCuota).toFixed(2)}
              </p>
            )}
          </div>
        )}

        <button onClick={confirmarInversion} disabled={cargando || fondos.length === 0}>
          {cargando ? "Procesando..." : "Confirmar inversión"}
        </button>
      </section>
    </main>
  );
}

export default NuevaInversion;