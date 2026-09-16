import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Login.css";

function AdminLogin({ volver, onAdminLoginSuccess }: any) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login, logout } = useAuth();

  async function entrar() {
    if (!correo || !password) {
      setError("Ingresa correo y contraseña");
      return;
    }

    setCargando(true);
    setError("");

    try {
      await login(correo, password);

      // login() ya guardó el usuario en localStorage de forma síncrona;
      // lo leemos de ahí para verificar el rol antes de dejar pasar.
      const guardado = JSON.parse(localStorage.getItem("usuario") || "{}");

      if (!guardado.rol || !guardado.rol.includes("ADMIN")) {
        logout();
        setError("Esta cuenta no tiene permisos de administrador.");
        return;
      }

      // Es admin: avisamos al padre para que aterrice directo en el panel admin.
      onAdminLoginSuccess?.();
    } catch (err: any) {
      setError(err.message || "Error en la autenticación");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="admin-badge">🛡️ Acceso restringido</span>
        <h1>Banco Cloud</h1>
        <h2>Panel administrativo</h2>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <input
          type="email"
          placeholder="Correo administrativo"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          disabled={cargando}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={cargando}
        />

        <button onClick={entrar} disabled={cargando}>
          {cargando ? "Verificando..." : "Ingresar como administrador"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          <span
            onClick={volver}
            style={{ cursor: "pointer", color: "var(--accent-2)", textDecoration: "underline" }}
          >
            ← Volver al acceso de clientes
          </span>
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;