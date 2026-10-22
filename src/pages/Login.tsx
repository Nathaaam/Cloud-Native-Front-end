import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Login.css";

function Login({
  onLogin,
  irRegistro,
  irAccesoAdmin,
}: any) {
  const [email, setEmail] = useState("");
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

      onLogin?.();
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "Correo o contraseña incorrectos."
      );

      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Banco Cloud</h1>

        <h2>Iniciar sesión</h2>

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
            : "Ingresar"}
        </button>

        <p
          style={{
            textAlign: "center",
            marginTop: "15px",
            fontSize: "14px",
          }}
        >
          ¿No tienes cuenta?{" "}
          <span
            onClick={irRegistro}
            style={{
              cursor: "pointer",
              color: "blue",
              textDecoration: "underline",
            }}
          >
            Regístrate aquí
          </span>
        </p>

        <button
          type="button"
          className="admin-access-link"
          onClick={irAccesoAdmin}
          disabled={cargando}
        >
          🛡️ Acceso administrativo
        </button>
      </div>
    </main>
  );
}

export default Login;