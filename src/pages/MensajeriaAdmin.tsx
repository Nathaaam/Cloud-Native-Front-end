import { useState, useEffect } from "react";
import {
  obtenerCola,
  crearCola,
  eliminarCola,
  crearExchange,
  eliminarExchange,
  crearBinding,
  eliminarBinding,
  type TipoExchange,
} from "../services/apiService";

/** Colas que declara el backend, con su DLQ, para ver su estado de un vistazo. */
const COLAS_SISTEMA = [
  "inversiones.comprobante.q",
  "usuarios.registro.q",
  "usuarios.estado.q",
  "fondos.valorcuota.q",
].flatMap((cola) => [cola, `${cola}.dlq`]);

const TIPOS_EXCHANGE: TipoExchange[] = [
  "DIRECT",
  "TOPIC",
  "FANOUT",
  "HEADERS",
];

interface EstadoCola {
  mensajes: number;
  consumidores: number;
}

function MensajeriaAdmin({ token }: { token: string }) {
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [procesando, setProcesando] = useState(false);

  const [estadoColas, setEstadoColas] = useState<
    Record<string, EstadoCola | null>
  >({});
  const [cargandoColas, setCargandoColas] = useState(false);

  const [cola, setCola] = useState({
    name: "",
    durable: true,
    deadLetterExchange: "",
    deadLetterRoutingKey: "",
    ttlMs: "",
  });

  const [exchange, setExchange] = useState({
    name: "",
    type: "TOPIC" as TipoExchange,
    durable: true,
  });

  const [binding, setBinding] = useState({
    queue: "",
    exchange: "",
    routingKey: "",
  });

  const [eliminar, setEliminar] = useState({
    tipo: "cola" as "cola" | "exchange",
    nombre: "",
  });

  const [consulta, setConsulta] = useState("");
  const [resultadoConsulta, setResultadoConsulta] =
    useState<any>(null);

  useEffect(() => {
    refrescarColas();
  }, [token]);

  async function refrescarColas() {
    setCargandoColas(true);

    const resultados = await Promise.all(
      COLAS_SISTEMA.map(async (nombre) => {
        try {
          const info = await obtenerCola(nombre, token);
          return [nombre, info] as const;
        } catch {
          return [nombre, null] as const;
        }
      })
    );

    setEstadoColas(Object.fromEntries(resultados));
    setCargandoColas(false);
  }

  /** Ejecuta una operación mostrando el resultado y refrescando las colas. */
  async function ejecutar(
    operacion: () => Promise<unknown>,
    mensajeExito: string
  ) {
    try {
      setProcesando(true);
      setError("");
      setExito("");

      await operacion();

      setExito(mensajeExito);
      setTimeout(() => setExito(""), 3000);
      await refrescarColas();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setProcesando(false);
    }
  }

  async function manejarCrearCola() {
    const ok = await ejecutar(
      () =>
        crearCola(
          {
            name: cola.name.trim(),
            durable: cola.durable,
            ...(cola.deadLetterExchange && {
              deadLetterExchange: cola.deadLetterExchange.trim(),
            }),
            ...(cola.deadLetterRoutingKey && {
              deadLetterRoutingKey:
                cola.deadLetterRoutingKey.trim(),
            }),
            ...(cola.ttlMs && { ttlMs: Number(cola.ttlMs) }),
          },
          token
        ),
      `Cola ${cola.name} creada`
    );

    if (ok) {
      setCola({
        name: "",
        durable: true,
        deadLetterExchange: "",
        deadLetterRoutingKey: "",
        ttlMs: "",
      });
    }
  }

  async function manejarCrearExchange() {
    const ok = await ejecutar(
      () =>
        crearExchange(
          { ...exchange, name: exchange.name.trim() },
          token
        ),
      `Exchange ${exchange.name} creado`
    );

    if (ok) {
      setExchange({ name: "", type: "TOPIC", durable: true });
    }
  }

  async function manejarBinding(accion: "crear" | "eliminar") {
    const data = {
      queue: binding.queue.trim(),
      exchange: binding.exchange.trim(),
      routingKey: binding.routingKey.trim(),
    };

    await ejecutar(
      () =>
        accion === "crear"
          ? crearBinding(data, token)
          : eliminarBinding(data, token),
      accion === "crear"
        ? "Binding creado"
        : "Binding eliminado"
    );
  }

  async function manejarEliminar() {
    const nombre = eliminar.nombre.trim();

    if (
      !window.confirm(
        `¿Eliminar ${eliminar.tipo === "cola" ? "la cola" : "el exchange"} "${nombre}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    const ok = await ejecutar(
      () =>
        eliminar.tipo === "cola"
          ? eliminarCola(nombre, token)
          : eliminarExchange(nombre, token),
      `${eliminar.tipo === "cola" ? "Cola" : "Exchange"} ${nombre} eliminado`
    );

    if (ok) {
      setEliminar({ ...eliminar, nombre: "" });
    }
  }

  async function manejarConsulta() {
    setResultadoConsulta(null);

    try {
      setError("");
      setResultadoConsulta(
        await obtenerCola(consulta.trim(), token)
      );
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <>
      {error && <div className="alert-error">{error}</div>}
      {exito && <div className="alert-success">{exito}</div>}

      <section className="admin-section">
        <h2>Colas del sistema</h2>

        <table className="fondos-table">
          <thead>
            <tr>
              <th>Cola</th>
              <th>Mensajes</th>
              <th>Consumidores</th>
            </tr>
          </thead>

          <tbody>
            {COLAS_SISTEMA.map((nombre) => {
              const info = estadoColas[nombre];
              const esDlq = nombre.endsWith(".dlq");

              return (
                <tr key={nombre}>
                  <td>
                    {nombre}{" "}
                    {esDlq && (
                      <span className="badge-inactive">DLQ</span>
                    )}
                  </td>
                  <td>{info ? info.mensajes : "—"}</td>
                  <td>
                    {info ? (
                      info.consumidores
                    ) : (
                      <span className="badge-inactive">
                        No existe
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="form-group">
          <button
            onClick={refrescarColas}
            disabled={cargandoColas}
          >
            {cargandoColas ? "Actualizando..." : "Actualizar"}
          </button>
        </div>
      </section>

      <section className="admin-section">
        <h2>Crear cola</h2>

        <div className="form-group">
          <input
            placeholder="Nombre (ej. pagos.q)"
            value={cola.name}
            onChange={(e) =>
              setCola({ ...cola, name: e.target.value })
            }
            disabled={procesando}
          />

          <input
            placeholder="Dead letter exchange (opcional)"
            value={cola.deadLetterExchange}
            onChange={(e) =>
              setCola({
                ...cola,
                deadLetterExchange: e.target.value,
              })
            }
            disabled={procesando}
          />

          <input
            placeholder="Dead letter routing key (opcional)"
            value={cola.deadLetterRoutingKey}
            onChange={(e) =>
              setCola({
                ...cola,
                deadLetterRoutingKey: e.target.value,
              })
            }
            disabled={procesando}
          />

          <input
            type="number"
            placeholder="TTL de mensajes en ms (opcional)"
            value={cola.ttlMs}
            onChange={(e) =>
              setCola({ ...cola, ttlMs: e.target.value })
            }
            disabled={procesando}
            min="1"
          />

          <label className="check-row">
            <input
              type="checkbox"
              checked={cola.durable}
              onChange={(e) =>
                setCola({ ...cola, durable: e.target.checked })
              }
              disabled={procesando}
            />
            Durable (sobrevive a reinicios del broker)
          </label>

          <button
            onClick={manejarCrearCola}
            disabled={procesando || !cola.name.trim()}
          >
            Crear cola
          </button>
        </div>
      </section>

      <section className="admin-section">
        <h2>Crear exchange</h2>

        <div className="form-group">
          <input
            placeholder="Nombre (ej. bancocloud.pagos)"
            value={exchange.name}
            onChange={(e) =>
              setExchange({ ...exchange, name: e.target.value })
            }
            disabled={procesando}
          />

          <select
            value={exchange.type}
            onChange={(e) =>
              setExchange({
                ...exchange,
                type: e.target.value as TipoExchange,
              })
            }
            disabled={procesando}
          >
            {TIPOS_EXCHANGE.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>

          <label className="check-row">
            <input
              type="checkbox"
              checked={exchange.durable}
              onChange={(e) =>
                setExchange({
                  ...exchange,
                  durable: e.target.checked,
                })
              }
              disabled={procesando}
            />
            Durable
          </label>

          <button
            onClick={manejarCrearExchange}
            disabled={procesando || !exchange.name.trim()}
          >
            Crear exchange
          </button>
        </div>
      </section>

      <section className="admin-section">
        <h2>Bindings</h2>

        <div className="form-group">
          <input
            placeholder="Cola"
            value={binding.queue}
            onChange={(e) =>
              setBinding({ ...binding, queue: e.target.value })
            }
            disabled={procesando}
          />

          <input
            placeholder="Exchange"
            value={binding.exchange}
            onChange={(e) =>
              setBinding({ ...binding, exchange: e.target.value })
            }
            disabled={procesando}
          />

          <input
            placeholder="Routing key (admite * y #; vacía para fanout)"
            value={binding.routingKey}
            onChange={(e) =>
              setBinding({
                ...binding,
                routingKey: e.target.value,
              })
            }
            disabled={procesando}
          />

          <div className="button-row">
            <button
              onClick={() => manejarBinding("crear")}
              disabled={
                procesando ||
                !binding.queue.trim() ||
                !binding.exchange.trim()
              }
            >
              Crear binding
            </button>

            <button
              className="btn-secondary"
              onClick={() => manejarBinding("eliminar")}
              disabled={
                procesando ||
                !binding.queue.trim() ||
                !binding.exchange.trim()
              }
            >
              Eliminar binding
            </button>
          </div>
        </div>
      </section>

      <section className="admin-section">
        <h2>Consultar o eliminar</h2>

        <div className="form-group">
          <input
            placeholder="Nombre de la cola a consultar"
            value={consulta}
            onChange={(e) => setConsulta(e.target.value)}
          />

          <button
            onClick={manejarConsulta}
            disabled={!consulta.trim()}
          >
            Consultar cola
          </button>

          {resultadoConsulta && (
            <p className="resultado-consulta">
              <strong>{resultadoConsulta.name}</strong>:{" "}
              {resultadoConsulta.mensajes} mensajes,{" "}
              {resultadoConsulta.consumidores} consumidores
            </p>
          )}
        </div>

        <div className="form-group">
          <select
            value={eliminar.tipo}
            onChange={(e) =>
              setEliminar({
                ...eliminar,
                tipo: e.target.value as "cola" | "exchange",
              })
            }
            disabled={procesando}
          >
            <option value="cola">Cola</option>
            <option value="exchange">Exchange</option>
          </select>

          <input
            placeholder="Nombre a eliminar"
            value={eliminar.nombre}
            onChange={(e) =>
              setEliminar({ ...eliminar, nombre: e.target.value })
            }
            disabled={procesando}
          />

          <button
            className="btn-secondary"
            onClick={manejarEliminar}
            disabled={procesando || !eliminar.nombre.trim()}
          >
            Eliminar
          </button>
        </div>
      </section>
    </>
  );
}

export default MensajeriaAdmin;
