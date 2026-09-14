export interface Usuario {

  nombre: string;

  apellido: string;

  correo: string;

  password: string;

}



export function guardarUsuario(usuario: Usuario) {

  localStorage.setItem(
    "usuario",
    JSON.stringify(usuario)
  );

}



export function obtenerUsuario() {

  const usuario = localStorage.getItem("usuario");


  if (!usuario) {

    return null;

  }


  return JSON.parse(usuario);

}



export function cerrarSesion() {

  localStorage.removeItem("usuario");

}