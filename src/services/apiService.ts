const API_URL = "http://localhost:8090/api/v1";

// Obtener token del localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// ==================== AUTENTICACIÓN ====================

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Error en la autenticación");
  }

  const data = await response.json();
  if (data.token) {
    localStorage.setItem("authToken", data.token);
  }
  return data;
}

export async function logout() {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error en logout");
  }

  localStorage.removeItem("authToken");
  return await response.json();
}

export async function verifyToken() {
  const response = await fetch(`${API_URL}/auth/verify`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    localStorage.removeItem("authToken");
    throw new Error("Token inválido");
  }

  return await response.json();
}

// ==================== FONDOS ====================

export async function obtenerFondos() {
  const response = await fetch(`${API_URL}/fondos`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo fondos");
  }

  return await response.json();
}

export async function obtenerFondosActivos() {
  const response = await fetch(`${API_URL}/fondos/activos`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo fondos activos");
  }

  return await response.json();
}

export async function crearFondo(data: any) {
  const response = await fetch(`${API_URL}/fondos`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error creando fondo");
  }

  return await response.json();
}

export async function actualizarValorCuota(fondoId: number, nuevoValor: number) {
  const response = await fetch(`${API_URL}/fondos/${fondoId}/valor-cuota`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ nuevoValorCuota: nuevoValor }),
  });

  if (!response.ok) {
    throw new Error("Error actualizando valor cuota");
  }

  return await response.json();
}

// ==================== INVERSIONES ====================

export async function crearInversion(data: any) {
  const response = await fetch(`${API_URL}/inversiones`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error creando inversión");
  }

  return await response.json();
}

export async function obtenerMisInversiones(usuarioId: number) {
  const response = await fetch(
    `${API_URL}/inversiones/mi-portafolio?usuarioId=${usuarioId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo portafolio");
  }

  return await response.json();
}

export async function obtenerRendimiento(usuarioId: number) {
  const response = await fetch(
    `${API_URL}/inversiones/rendimiento?usuarioId=${usuarioId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error("Error obteniendo rendimiento");
  }

  return await response.json();
}

export async function obtenerUsuario(id: number) {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo usuario");
  }

  return await response.json();
}