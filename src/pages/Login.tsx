import { useState } from "react";
import "./Login.css";


function Login({ onLogin, irRegistro }: any) {


  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");



  function entrar() {

    if (email && password) {

      onLogin();

    }

  }



  return (

    <main className="auth-page">


      <div className="auth-card">


        <h1>
          Banco Cloud
        </h1>


        <h2>
          Iniciar sesión
        </h2>



        <input

          placeholder="Correo"

          value={email}

          onChange={(e) => setEmail(e.target.value)}

        />



        <input

          type="password"

          placeholder="Contraseña"

          value={password}

          onChange={(e) => setPassword(e.target.value)}

        />



        <button onClick={entrar}>

          Entrar

        </button>



        <button

          className="register-button"

          onClick={irRegistro}

        >

          Crear cuenta

        </button>



      </div>


    </main>

  );

}



export default Login;