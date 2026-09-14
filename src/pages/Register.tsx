import { useState } from "react";
import { guardarUsuario } from "../services/storageService";
import "./Login.css";


function Register({ volver }: any) {


  const [nombre,setNombre] = useState("");

  const [apellido,setApellido] = useState("");

  const [correo,setCorreo] = useState("");

  const [password,setPassword] = useState("");



  function registrar(){


    if(
      !nombre ||
      !apellido ||
      !correo ||
      !password
    ){

      alert("Completa todos los campos");

      return;

    }



    const usuario = {

      nombre,

      apellido,

      correo,

      password

    };



    guardarUsuario(usuario);



    alert("Usuario creado correctamente");



    volver();


  }



  return (

    <main className="auth-page">


      <div className="auth-card">


        <h1>
          Banco Cloud
        </h1>


        <h2>
          Crear cuenta
        </h2>



        <input

          placeholder="Nombre"

          value={nombre}

          onChange={(e)=>setNombre(e.target.value)}

        />



        <input

          placeholder="Apellido"

          value={apellido}

          onChange={(e)=>setApellido(e.target.value)}

        />



        <input

          placeholder="Correo"

          value={correo}

          onChange={(e)=>setCorreo(e.target.value)}

        />



        <input

          type="password"

          placeholder="Contraseña"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />



        <button onClick={registrar}>

          Registrarse

        </button>



        <button

          className="register-button"

          onClick={volver}

        >

          Volver al login

        </button>



      </div>


    </main>

  );

}



export default Register;