import { useState, useEffect } from "react";
import { obtenerFondos, crearFondo, actualizarValorCuota } from "../services/apiService";
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

  useEffect(() => {
    if (!esAdmin()) {
      return;
    }
    cargarFondos();
  }, []);

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
    </main>
  );
}

export default Admin;
