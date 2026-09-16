const API_URL = "http://localhost:8090/api/v1";

// Obtener token del localStorage
function getAuthHeaders() {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Extrae el mensaje de error real que manda el backend (ErrorResponse / errores de validación),
// en vez de mostrar siempre un texto genérico que no ayuda a diagnosticar.
async function extraerMensajeError(response: Response, fallback: string) {
  try {
    const body = await response.json();

    if (body?.errores && typeof body.errores === "object") {
      const primerError = Object.values(body.errores)[0];
      if (primerError) return String(primerError);
    }

    if (body?.message) return String(body.message);
    if (body?.error) return String(body.error);
  } catch {
    // El body no era JSON (ej. servidor caído, HTML de error, etc.)
  }

  return `${fallback} (HTTP ${response.status})`;
}

// ==================== AUTENTICACIÓN ====================

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error en la autenticación"));
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
    throw new Error(await extraerMensajeError(response, "Error en logout"));
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
    throw new Error(await extraerMensajeError(response, "Token inválido"));
  }

  return await response.json();
}

// ==================== FONDOS ====================

export async function obtenerFondos() {
  const response = await fetch(`${API_URL}/fondos`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error obteniendo fondos"));
  }

  return await response.json();
}

export async function obtenerFondosActivos() {
  const response = await fetch(`${API_URL}/fondos/activos`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error obteniendo fondos activos"));
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
    throw new Error(await extraerMensajeError(response, "Error creando fondo"));
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
    throw new Error(await extraerMensajeError(response, "Error actualizando valor cuota"));
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
    throw new Error(await extraerMensajeError(response, "Error creando inversión"));
  }

  return await response.json();
}

export async function obtenerMisInversiones(usuarioId: number) {
  const response = await fetch(
    `${API_URL}/inversiones/mis-inversiones?usuarioId=${usuarioId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error obteniendo inversiones"));
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
    throw new Error(await extraerMensajeError(response, "Error obteniendo rendimiento"));
  }

  return await response.json();
}

export async function obtenerUsuario(id: number) {
  const response = await fetch(`${API_URL}/usuarios/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error obteniendo usuario"));
  }

  return await response.json();
}

// ==================== ADMINISTRACIÓN DE USUARIOS ====================

export async function obtenerTodosUsuarios() {
  const response = await fetch(`${API_URL}/usuarios`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error obteniendo usuarios"));
  }

  return await response.json();
}

export async function autorizarUsuario(id: number, autorizado: boolean) {
  const response = await fetch(`${API_URL}/usuarios/${id}/autorizar`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ autorizado }),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error autorizando usuario"));
  }

  return await response.json();
}

export async function bloquearUsuario(id: number) {
  const response = await fetch(`${API_URL}/usuarios/${id}/bloquear`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error bloqueando usuario"));
  }

  return await response.json();
}

export async function desbloquearUsuario(id: number) {
  const response = await fetch(`${API_URL}/usuarios/${id}/desbloquear`, {
    method: "PUT",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await extraerMensajeError(response, "Error desbloqueando usuario"));
  }

  return await response.json();
}