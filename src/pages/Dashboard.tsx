import { useState, useEffect } from "react";
import { obtenerMisInversiones, obtenerRendimiento } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Css/Dashboard.css";

function Dashboard() {
  const { usuario } = useAuth();
  const [inversiones, setInversiones] = useState<any[]>([]);
  const [rendimiento, setRendimiento] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, [usuario]);

  async function cargarDatos() {
    if (!usuario?.id) return;

    try {
      setCargando(true);
      const [dataInversiones, dataRendimiento] = await Promise.all([
        obtenerMisInversiones(usuario.id),
        obtenerRendimiento(usuario.id),
      ]);

      console.log("INVERSIONES:", dataInversiones);
      console.log("RENDIMIENTO:", dataRendimiento);

      setInversiones(dataInversiones);
      setRendimiento(dataRendimiento);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <main className="dashboard-page"><h1>Cargando...</h1></main>;

  const totalInvertido = inversiones.reduce(
    (sum, inv) => sum + Number(inv.montoInvertido || 0),
    0
  );

  const rentabilidadTotal =
    Array.isArray(rendimiento) && rendimiento.length > 0
      ? (rendimiento.reduce(
          (sum, inv) => sum + Number(inv.rendimientoAbsoluto || 0),
          0
        ) /
          rendimiento.reduce(
            (sum, inv) => sum + Number(inv.montoInvertido || 0),
            0
          )) *
        100
      : 0;

  return (
    <main className="dashboard-page">
      <h1>Bienvenido, {usuario?.nombre} 👋</h1>

      <p className="subtitle">
        Consulta el estado de tus productos financieros.
      </p>

      {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <span>Saldo disponible</span>
          <strong>${totalInvertido.toLocaleString()}</strong>
          <small>En inversiones activas</small>
        </div>

        <div className="dashboard-card">
          <span>Total invertido</span>
          <strong>${totalInvertido.toLocaleString()}</strong>
          <small className={rentabilidadTotal >= 0 ? "positive" : "negative"}>
            {rentabilidadTotal >= 0 ? "+" : ""}{rentabilidadTotal.toFixed(2)}% esta vez
          </small>
        </div>

        <div className="dashboard-card">
          <span>Fondos activos</span>
          <strong>{inversiones.length}</strong>
          <small>Inversiones vigentes</small>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;