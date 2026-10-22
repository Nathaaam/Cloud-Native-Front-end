import { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  obtenerMisInversiones,
  obtenerRendimiento,
} from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Css/Dashboard.css";

const PALETA = [
  "#ff4f9a",
  "#ff8a3d",
  "#5ee6c4",
  "#3ddc84",
  "#f6c667",
  "#6cc4f6",
];

const ICONOS = ["📈", "💰", "🏦", "💳", "🪙"];

function tiempoRelativo(fecha: string | Date) {
  const diffMs = Date.now() - new Date(fecha).getTime();
  const min = Math.floor(diffMs / 60000);

  if (min < 1) return "recién";
  if (min < 60) return `hace ${min} min`;

  const horas = Math.floor(min / 60);

  if (horas < 24) return `hace ${horas} h`;

  return `hace ${Math.floor(horas / 24)} d`;
}

function mesCorto(fecha: string | Date) {
  const label = new Date(fecha).toLocaleDateString(
    "es-ES",
    { month: "short" }
  );

  return label.charAt(0).toUpperCase() +
    label.slice(1).replace(".", "");
}

function Dashboard() {
  const { usuario, token } = useAuth();

  const [inversiones, setInversiones] = useState<any[]>([]);
  const [rendimiento, setRendimiento] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarDatos();
  }, [usuario, token]);

  async function cargarDatos() {
    if (!usuario?.id || !token) {
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError("");

      const [
        dataInversiones,
        dataRendimiento,
      ] = await Promise.all([
        obtenerMisInversiones(usuario.id, token),
        obtenerRendimiento(usuario.id, token),
      ]);

      setInversiones(
        Array.isArray(dataInversiones)
          ? dataInversiones
          : []
      );

      setRendimiento(
        Array.isArray(dataRendimiento)
          ? dataRendimiento
          : []
      );
    } catch (err: any) {
      setError(
        err.message ||
          "Error cargando información del dashboard"
      );
    } finally {
      setCargando(false);
    }
  }

  const rendimientoPorInversion = useMemo(() => {
    const map = new Map<number, any>();

    rendimiento.forEach((r) =>
      map.set(r.inversionId, r)
    );

    return map;
  }, [rendimiento]);

  const nombrePorFondo = useMemo(() => {
    const map = new Map<number, string>();

    rendimiento.forEach((r) =>
      map.set(r.fondoId, r.nombreFondo)
    );

    return map;
  }, [rendimiento]);

  const totalInvertido = inversiones.reduce(
    (sum, inv) =>
      sum + Number(inv.montoInvertido || 0),
    0
  );

  const rendimientoAbsolutoTotal = rendimiento.reduce(
    (sum, r) =>
      sum + Number(r.rendimientoAbsoluto || 0),
    0
  );

  const rentabilidadTotal =
    totalInvertido > 0
      ? (rendimientoAbsolutoTotal /
          totalInvertido) *
        100
      : 0;

  const puntosGrafico = useMemo(() => {
    const ordenadas = [...inversiones].sort(
      (a, b) =>
        new Date(a.fechaInversion).getTime() -
        new Date(b.fechaInversion).getTime()
    );

    let acumulado = 0;

    const serie = ordenadas.map((inv) => {
      const r = rendimientoPorInversion.get(inv.id);

      acumulado += Number(
        r?.valorTotalActual ??
          inv.montoInvertido ??
          0
      );

      return {
        label: mesCorto(inv.fechaInversion),
        valor: Math.round(acumulado),
      };
    });

    if (serie.length === 1) {
      serie.unshift({
        label: "Inicio",
        valor: 0,
      });
    }

    return serie.slice(-7);
  }, [inversiones, rendimientoPorInversion]);

  const picoValor = useMemo(
    () =>
      Math.max(
        0,
        ...puntosGrafico.map((p) => p.valor)
      ),
    [puntosGrafico]
  );

  const distribucion = useMemo(() => {
    const porFondo = new Map<
      number,
      { nombre: string; valor: number }
    >();

    rendimiento.forEach((r) => {
      const valor = Number(
        r.valorTotalActual || 0
      );

      const prev = porFondo.get(r.fondoId);

      if (prev) {
        prev.valor += valor;
      } else {
        porFondo.set(r.fondoId, {
          nombre:
            r.nombreFondo ||
            `Fondo #${r.fondoId}`,
          valor,
        });
      }
    });

    const total = Array.from(
      porFondo.values()
    ).reduce(
      (s, f) => s + f.valor,
      0
    );

    const items = Array.from(
      porFondo.values()
    )
      .sort((a, b) => b.valor - a.valor)
      .map((f, i) => ({
        ...f,
        color:
          PALETA[i % PALETA.length],
      }));

    return {
      items,
      total,
    };
  }, [rendimiento]);

  const movimientos = useMemo(() => {
    return [...inversiones]
      .sort(
        (a, b) =>
          new Date(
            b.fechaInversion
          ).getTime() -
          new Date(
            a.fechaInversion
          ).getTime()
      )
      .slice(0, 4)
      .map((inv, i) => ({
        id: inv.id,
        nombre:
          nombrePorFondo.get(inv.fondoId) ||
          `Fondo #${inv.fondoId}`,
        cuando: tiempoRelativo(
          inv.fechaInversion
        ),
        monto: Number(
          inv.montoInvertido || 0
        ),
        icono:
          ICONOS[i % ICONOS.length],
      }));
  }, [inversiones, nombrePorFondo]);

  if (cargando) {
    return (
      <main className="dashboard-page">
        <h1>Cargando...</h1>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <h1>
        Bienvenido, {usuario?.nombre} 👋
      </h1>

      <p className="subtitle">
        Consulta el estado de tus productos
        financieros.
      </p>

      {error && (
        <div
          style={{
            color: "red",
            padding: "10px",
          }}
        >
          {error}
        </div>
      )}

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <span>Saldo disponible</span>
          <strong>
            ${totalInvertido.toLocaleString()}
          </strong>
          <small>
            En inversiones activas
          </small>
        </div>

        <div className="dashboard-card">
          <span>Total invertido</span>
          <strong>
            ${totalInvertido.toLocaleString()}
          </strong>

          <small
            className={
              rentabilidadTotal >= 0
                ? "positive"
                : "negative"
            }
          >
            {rentabilidadTotal >= 0
              ? "+"
              : ""}
            {rentabilidadTotal.toFixed(2)}%
            esta vez
          </small>
        </div>

        <div className="dashboard-card">
          <span>Fondos activos</span>
          <strong>
            {inversiones.length}
          </strong>
          <small>
            Inversiones vigentes
          </small>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="panel-card chart-card">
          <div className="panel-card-header">
            <h2>
              Estado del portafolio
            </h2>
          </div>

          {puntosGrafico.length > 1 ? (
            <div className="chart-wrap">
              <div className="chart-pill">
                + $
                {picoValor.toLocaleString()}
              </div>

              <ResponsiveContainer
                width="100%"
                height={220}
              >
                <LineChart
                  data={puntosGrafico}
                  margin={{
                    top: 30,
                    right: 10,
                    left: 0,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="lineGrad"
                      x1="0"
                      y1="0"
                      x2="1"
                      y2="0"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--accent)"
                      />

                      <stop
                        offset="100%"
                        stopColor="var(--accent-3)"
                      />
                    </linearGradient>
                  </defs>

                  <XAxis
                    dataKey="label"
                    stroke="var(--text-2)"
                    tickLine={false}
                    axisLine={false}
                    fontSize={12.5}
                  />

                  <Tooltip
                    contentStyle={{
                      background:
                        "var(--bg-2)",
                      border:
                        "1px solid var(--panel-border)",
                      borderRadius: 10,
                      color:
                        "var(--text-0)",
                    }}
                    formatter={(
                      value: number
                    ) => [
                      `$${value.toLocaleString()}`,
                      "Valor",
                    ]}
                  />

                  <Line
                    type="monotone"
                    dataKey="valor"
                    stroke="url(#lineGrad)"
                    strokeWidth={3}
                    dot={{
                      r: 3,
                      fill: "var(--text-0)",
                    }}
                    activeDot={{
                      r: 6,
                      fill: "var(--accent-3)",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="empty-hint">
              Aún no hay suficientes datos
              para graficar tu historial.
              ¡Haz tu primera inversión!
            </p>
          )}
        </div>

        <div className="panel-card donut-card">
          <div className="panel-card-header">
            <h2>Distribución</h2>
          </div>

          {distribucion.items.length === 0 ? (
            <p className="empty-hint">
              Todavía no tienes inversiones
              activas.
            </p>
          ) : (
            <div className="donut-row">
              <div className="donut-wrap">
                <ResponsiveContainer
                  width={140}
                  height={140}
                >
                  <PieChart>
                    <Pie
                      data={distribucion.items}
                      dataKey="valor"
                      nameKey="nombre"
                      innerRadius={48}
                      outerRadius={66}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {distribucion.items.map(
                        (item, i) => (
                          <Cell
                            key={i}
                            fill={item.color}
                          />
                        )
                      )}
                    </Pie>

                    <Tooltip
                      contentStyle={{
                        background:
                          "var(--bg-2)",
                        border:
                          "1px solid var(--panel-border)",
                        borderRadius: 10,
                        color:
                          "var(--text-0)",
                      }}
                      formatter={(
                        value: number
                      ) => [
                        `$${value.toLocaleString()}`,
                        "",
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <span>Total</span>

                  <strong>
                    $
                    {Math.round(
                      distribucion.total
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div className="donut-legend">
                {distribucion.items
                  .slice(0, 5)
                  .map((item) => (
                    <div
                      className="donut-legend-item"
                      key={item.nombre}
                    >
                      <span
                        className="dot"
                        style={{
                          background:
                            item.color,
                        }}
                      />

                      <span>
                        {item.nombre}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        <div className="panel-card movements-card">
          <div className="panel-card-header">
            <h2>
              Movimientos recientes
            </h2>
          </div>

          {movimientos.length === 0 ? (
            <p className="empty-hint">
              No tienes movimientos todavía.
            </p>
          ) : (
            <ul className="movement-list">
              {movimientos.map((m) => (
                <li key={m.id}>
                  <span className="movement-icon">
                    {m.icono}
                  </span>

                  <div className="movement-info">
                    <strong>
                      {m.nombre}
                    </strong>

                    <span>
                      {m.cuando}
                    </span>
                  </div>

                  <span className="movement-amount">
                    -$
                    {m.monto.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}

export default Dashboard;