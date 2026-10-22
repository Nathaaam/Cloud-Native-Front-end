import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Login.css";

function AdminLogin({ volver }: any) {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState("");

  const { login } = useAuth();

  async function entrar() {
    if (!email.trim() || !password) {
      setError(
        "Ingresa tu correo y contraseña."
      );
      return;
    }

    setCargando(true);
    setError("");

    try {
      await login(
        email.trim(),
        password
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo iniciar sesión."
      );

      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="admin-badge">
          🛡️ Acceso restringido
        </span>

        <h1>Banco Cloud</h1>

        <h2>Panel administrativo</h2>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
            }}
          >
            {error}
          </div>
        )}

        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          disabled={cargando}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          disabled={cargando}
        />

        <button
          onClick={entrar}
          disabled={cargando}
        >
          {cargando
            ? "Ingresando..."
            : "Ingresar como administrador"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          <span
            onClick={volver}
            style={{
              cursor: "pointer",
              color: "var(--accent-2)",
              textDecoration: "underline",
            }}
          >
            ← Volver al acceso de clientes
          </span>
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;