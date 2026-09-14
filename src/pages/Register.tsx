import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Css/Register.css";

function Register({ volver }: any) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { registrar } = useAuth();

  async function crearCuenta() {
    if (!nombre || !apellido || !correo || !password) {
      setError("Completa todos los campos");
      return;
    }

    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validar requisitos de contraseña: 8+ chars, 1 mayúscula, 1 número, 1 símbolo
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(.{8,})$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener: 8+ caracteres, 1 mayúscula, 1 número y 1 símbolo especial (!@#$%^&*)");
      return;
    }

    setCargando(true);
    setError("");

    try {
      await registrar({ 
        nombre, 
        apellido, 
        correo, 
        password,
        passwordConfirm,
        rol: "CLIENTE" 
      });
      alert("Cuenta creada correctamente");
      volver();
    } catch (err: any) {
      setError(err.message || "Error en registro");
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <h1>Banco Cloud</h1>
        <h2>Crear cuenta</h2>

        {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          disabled={cargando}
        />

        <input
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          disabled={cargando}
        />

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

        <input
          type="password"
          placeholder="Confirmar contraseña"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
          disabled={cargando}
        />

        <button onClick={crearCuenta} disabled={cargando}>
          {cargando ? "Registrando..." : "Crear cuenta"}
        </button>

        <button className="register-button" onClick={volver} disabled={cargando}>
          Volver
        </button>
      </div>
    </main>
  );
}

export default Register;
