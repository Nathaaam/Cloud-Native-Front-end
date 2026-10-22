import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Register.css";

function Register({ volver }: any) {
  const [nombre, setNombre] =
    useState("");

  const [apellido, setApellido] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [codigo, setCodigo] =
    useState("");

  const [esperandoCodigo, setEsperandoCodigo] =
    useState(false);

  const [error, setError] =
    useState("");

  const [cargando, setCargando] =
    useState(false);

  const {
    registrar,
    confirmarRegistro,
  } = useAuth();

  async function crearCuenta() {
    if (
      !nombre.trim() ||
      !apellido.trim() ||
      !email.trim() ||
      !password
    ) {
      setError(
        "Completa todos los campos."
      );
      return;
    }

    setCargando(true);
    setError("");

    try {
      await registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        password,
      });

      setEsperandoCodigo(true);
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo crear la cuenta."
      );
    } finally {
      setCargando(false);
    }
  }

  async function confirmarCuenta() {
    if (!codigo.trim()) {
      setError(
        "Ingresa el código recibido por correo."
      );
      return;
    }

    setCargando(true);
    setError("");

    try {
      await confirmarRegistro(
        email.trim(),
        codigo.trim(),
        nombre.trim(),
        apellido.trim(),
        password
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err.message ||
          "No se pudo confirmar la cuenta."
      );
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Banco Cloud</h1>

        <h2>
          {esperandoCodigo
            ? "Confirmar cuenta"
            : "Crear cuenta"}
        </h2>

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

        {!esperandoCodigo ? (
          <>
            <input
              placeholder="Nombre"
              value={nombre}
              onChange={(e) =>
                setNombre(e.target.value)
              }
              disabled={cargando}
            />

            <input
              placeholder="Apellido"
              value={apellido}
              onChange={(e) =>
                setApellido(e.target.value)
              }
              disabled={cargando}
            />

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
              onClick={crearCuenta}
              disabled={cargando}
            >
              {cargando
                ? "Creando cuenta..."
                : "Crear cuenta"}
            </button>
          </>
        ) : (
          <>
            <p
              style={{
                textAlign: "center",
                fontSize: "14px",
              }}
            >
              Hemos enviado un código de
              confirmación a:
            </p>

            <strong
              style={{
                display: "block",
                textAlign: "center",
                marginBottom: "15px",
              }}
            >
              {email}
            </strong>

            <input
              type="text"
              placeholder="Código de confirmación"
              value={codigo}
              onChange={(e) =>
                setCodigo(e.target.value)
              }
              disabled={cargando}
            />

            <button
              onClick={confirmarCuenta}
              disabled={cargando}
            >
              {cargando
                ? "Confirmando..."
                : "Confirmar cuenta"}
            </button>
          </>
        )}

        <button
          className="register-button"
          onClick={volver}
          disabled={cargando}
        >
          Volver
        </button>
      </div>
    </main>
  );
}

export default Register;