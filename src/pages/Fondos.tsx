import { useState, useEffect } from "react";
import { obtenerMisInversiones, obtenerRendimiento } from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Css/Fondos.css";

function Fondos({ irAInvertir }: any) {
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

      setInversiones(dataInversiones);
      setRendimiento(dataRendimiento);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (cargando) return <main className="fondos-page"><h1>Cargando...</h1></main>;

  const totalInvertido = inversiones.reduce((sum, inv) => sum + inv.montoInvertido, 0);
  const rentabilidadTotal = rendimiento?.rentabilidadTotal || 0;

  return (
    <main className="fondos-page">
      <div className="fondos-header">
        <div>
          <h1>Mi Portafolio</h1>
          <p>Administra y revisa tus inversiones</p>
        </div>
        <button className="btn-primary" onClick={irAInvertir}>
          + Nueva inversión
        </button>
      </div>

      {error && <div style={{ color: "red", padding: "10px" }}>{error}</div>}

      <section className="fondos-summary">
        <div className="summary-card">
          <span>Total invertido</span>
          <strong>${totalInvertido.toLocaleString()}</strong>
        </div>

        <div className="summary-card">
          <span>Rentabilidad</span>
          <strong className={rentabilidadTotal >= 0 ? "positive" : "negative"}>
            {rentabilidadTotal >= 0 ? "+" : ""}{rentabilidadTotal.toFixed(2)}%
          </strong>
        </div>

        <div className="summary-card">
          <span>Inversiones activas</span>
          <strong>{inversiones.length}</strong>
        </div>
      </section>

      <section className="fondos-list">
        <h2>Mis inversiones</h2>

        {inversiones.length === 0 ? (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
            No tienes inversiones aún. ¡Crea una nueva inversión!
          </p>
        ) : (
          <div className="fondos-grid">
            {inversiones.map((inv) => (
              <article className="fondo-card" key={inv.id}>
                <div className="fondo-top">
                  <div className="fondo-icon">📈</div>
                  <span className="fondo-risk">{inv.estado}</span>
                </div>

                <h3>Fondo #{inv.fondoId}</h3>

                <div className="fondo-info">
                  <div>
                    <span>Monto invertido</span>
                    <strong>${inv.montoInvertido.toLocaleString()}</strong>
                  </div>

                  <div>
                    <span>Cuotas</span>
                    <strong>{inv.cuotas}</strong>
                  </div>

                  <div>
                    <span>Valor cuota compra</span>
                    <strong>${inv.valorCuotaCompra.toFixed(2)}</strong>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Fondos;