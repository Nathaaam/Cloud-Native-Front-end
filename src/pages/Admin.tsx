import { useState, useEffect } from "react";
import {
  obtenerFondos,
  crearFondo,
  actualizarValorCuota,
  obtenerTodosUsuarios,
  autorizarUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  obtenerMisInversiones,
} from "../services/apiService";
import { useAuth } from "../context/AuthContext";
import "./Css/Admin.css";

function Admin() {
  const { usuario, esAdmin } = useAuth();
  const [fondos, setFondos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");

  // Form crear fondo
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [valorCuota, setValorCuota] = useState("");

  // Form actualizar cuota
  const [fondoEditarId, setFondoEditarId] = useState("");
  const [nuevoValorCuota, setNuevoValorCuota] = useState("");

  // Usuarios registrados
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [inversionesPorUsuario, setInversionesPorUsuario] = useState<Record<number, number>>({});
  const [accionandoId, setAccionandoId] = useState<number | null>(null);

  useEffect(() => {
    if (!esAdmin()) {
      return;
    }
    cargarFondos();
    cargarUsuarios();
  }, []);

  async function cargarUsuarios() {
    try {
      setCargandoUsuarios(true);
      const data = await obtenerTodosUsuarios();
      const lista = Array.isArray(data) ? data : [];
      setUsuarios(lista);

      // Para cada usuario, contamos cuántas inversiones tiene (dato real, no inventado).
      const conteos: Record<number, number> = {};
      await Promise.all(
        lista.map(async (u: any) => {
          try {
            const inversiones = await obtenerMisInversiones(u.id);
            conteos[u.id] = Array.isArray(inversiones) ? inversiones.length : 0;
          } catch {
            conteos[u.id] = 0;
          }
        })
      );
      setInversionesPorUsuario(conteos);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargandoUsuarios(false);
    }
  }

  async function manejarAutorizar(id: number) {
    try {
      setAccionandoId(id);
      setError("");
      await autorizarUsuario(id, true);
      setExito("Usuario autorizado correctamente");
      await cargarUsuarios();
      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccionandoId(null);
    }
  }

  async function manejarBloqueo(id: number, estaBloqueado: boolean) {
    try {
      setAccionandoId(id);
      setError("");
      if (estaBloqueado) {
        await desbloquearUsuario(id);
        setExito("Usuario desbloqueado");
      } else {
        await bloquearUsuario(id);
        setExito("Usuario bloqueado");
      }
      await cargarUsuarios();
      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setAccionandoId(null);
    }
  }

  async function cargarFondos() {
    try {
      setCargando(true);
      const data = await obtenerFondos();
      setFondos(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function crearNuevoFondo() {
    if (!nombre || !descripcion || !valorCuota) {
      setError("Completa todos los campos");
      return;
    }

    try {
      setCargando(true);
      setError("");
      await crearFondo({
        nombre,
        descripcion,
        valorCuota: parseFloat(valorCuota),
      });

      setExito("Fondo creado correctamente");
      setNombre("");
      setDescripcion("");
      setValorCuota("");
      await cargarFondos();

      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function actualizarCuota() {
    if (!fondoEditarId || !nuevoValorCuota) {
      setError("Selecciona fondo y nuevo valor");
      return;
    }

    try {
      setCargando(true);
      setError("");
      await actualizarValorCuota(parseInt(fondoEditarId), parseFloat(nuevoValorCuota));

      setExito("Valor cuota actualizado");
      setFondoEditarId("");
      setNuevoValorCuota("");
      await cargarFondos();

      setTimeout(() => setExito(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  if (!esAdmin()) {
    return (
      <main className="admin-page">
        <h1>Acceso denegado</h1>
        <p>Solo administradores pueden acceder</p>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <h1>Panel Administrativo</h1>
      <p>Bienvenido {usuario?.nombre}</p>

      {error && <div className="alert-error">{error}</div>}
      {exito && <div className="alert-success">{exito}</div>}

      {/* Crear Fondo */}
      <section className="admin-section">
        <h2>Crear nuevo fondo</h2>

        <div className="form-group">
          <input
            type="text"
            placeholder="Nombre del fondo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            disabled={cargando}
          />

          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            disabled={cargando}
          />

          <input
            type="number"
            placeholder="Valor inicial de cuota"
            value={valorCuota}
            onChange={(e) => setValorCuota(e.target.value)}
            disabled={cargando}
            step="0.01"
          />

          <button onClick={crearNuevoFondo} disabled={cargando}>
            {cargando ? "Creando..." : "Crear fondo"}
          </button>
        </div>
      </section>

      {/* Actualizar Valor Cuota */}
      <section className="admin-section">
        <h2>Actualizar valor de cuota</h2>

        <div className="form-group">
          <select
            value={fondoEditarId}
            onChange={(e) => setFondoEditarId(e.target.value)}
            disabled={cargando}
          >
            <option value="">-- Selecciona un fondo --</option>
            {fondos.map((fondo) => (
              <option key={fondo.id} value={fondo.id}>
                {fondo.nombre} (Actual: ${fondo.valorCuota.toFixed(2)})
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Nuevo valor de cuota"
            value={nuevoValorCuota}
            onChange={(e) => setNuevoValorCuota(e.target.value)}
            disabled={cargando}
            step="0.01"
          />

          <button onClick={actualizarCuota} disabled={cargando}>
            {cargando ? "Actualizando..." : "Actualizar cuota"}
          </button>
        </div>
      </section>

      {/* Lista de Fondos */}
      <section className="admin-section">
        <h2>Fondos disponibles</h2>

        {fondos.length === 0 ? (
          <p style={{ textAlign: "center", color: "#666" }}>No hay fondos creados</p>
        ) : (
          <table className="fondos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Valor Cuota</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {fondos.map((fondo) => (
                <tr key={fondo.id}>
                  <td>{fondo.id}</td>
                  <td>{fondo.nombre}</td>
                  <td>{fondo.descripcion}</td>
                  <td>${fondo.valorCuota.toFixed(2)}</td>
                  <td>
                    <span className={fondo.estado === "ACTIVO" ? "badge-active" : "badge-inactive"}>
                      {fondo.estado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Usuarios registrados */}
      <section className="admin-section">
        <h2>Usuarios registrados</h2>

        {cargandoUsuarios ? (
          <p style={{ textAlign: "center", color: "var(--text-2)" }}>Cargando usuarios...</p>
        ) : usuarios.length === 0 ? (
          <p style={{ textAlign: "center", color: "var(--text-2)" }}>No hay usuarios registrados</p>
        ) : (
          <table className="fondos-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acceso</th>
                <th>Inversiones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const bloqueado = u.estado === "BLOQUEADO";
                return (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.nombre} {u.apellido || ""}</td>
                    <td>{u.email}</td>
                    <td>{u.rol}</td>
                    <td>
                      <span className={bloqueado ? "badge-inactive" : "badge-active"}>
                        {u.estado}
                      </span>
                    </td>
                    <td>
                      <span className={u.accesoAutorizado ? "badge-active" : "badge-inactive"}>
                        {u.accesoAutorizado ? "Autorizado" : "Pendiente"}
                      </span>
                    </td>
                    <td>{inversionesPorUsuario[u.id] ?? "—"}</td>
                    <td>
                      {u.rol !== "ADMIN" && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {!u.accesoAutorizado && (
                            <button
                              className="btn-secondary"
                              onClick={() => manejarAutorizar(u.id)}
                              disabled={accionandoId === u.id}
                            >
                              Autorizar
                            </button>
                          )}
                          <button
                            className="btn-secondary"
                            onClick={() => manejarBloqueo(u.id, bloqueado)}
                            disabled={accionandoId === u.id}
                          >
                            {bloqueado ? "Desbloquear" : "Bloquear"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}

export default Admin;