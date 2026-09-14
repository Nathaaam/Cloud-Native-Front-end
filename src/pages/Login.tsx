import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Login.css";

function Login({ onLogin, irRegistro }: any) {
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();

  async function entrar() {
    if (!correo || !password) {
      setError("Ingresa correo y contraseña");
      return;
    }

    setCargando(true);
    setError("");

    try {
      await login(correo, password);
      onLogin();
    } catch (err: any) {
      setError(err.message || "Error en la autenticación");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Banco Cloud</h1>
        <h2>Iniciar sesión</h2>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <input
          type="email"
          placeholder="Correo"
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
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p style={{ textAlign: "center", marginTop: "15px", fontSize: "14px" }}>
          ¿No tienes cuenta?{" "}
          <span
            onClick={irRegistro}
            style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
          >
            Regístrate aquí
          </span>
        </p>
      </div>
    </main>
  );
}

export default Login;
