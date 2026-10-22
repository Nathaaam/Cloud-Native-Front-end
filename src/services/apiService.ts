const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8090/api/v1";

function getAuthHeaders(token?: string) {
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function extraerMensajeError(
  response: Response,
  fallback: string
) {
  try {
    const body = await response.json();

    if (body?.errores && typeof body.errores === "object") {
      const primerError = Object.values(body.errores)[0];

      if (primerError) {
        return String(primerError);
      }
    }

    if (body?.message) {
      return String(body.message);
    }

    if (body?.error) {
      return String(body.error);
    }
  } catch {
    // El body no era JSON.
  }

  return `${fallback} (HTTP ${response.status})`;
}

// ==================== AUTENTICACIÓN ====================

export async function obtenerMiPerfil(token: string) {
  const response = await fetch(`${API_URL}/usuarios/me`, {
    method: "GET",
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo perfil"
      )
    );
  }

  return await response.json();
}

export async function registrarUsuario(
  data: {
    nombre: string;
    apellido: string;
  },
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/registro`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error registrando usuario"
      )
    );
  }

  return await response.json();
}

// ==================== FONDOS ====================

export async function obtenerFondos(token: string) {
  const response = await fetch(`${API_URL}/fondos`, {
    headers: getAuthHeaders(token),
  });

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo fondos"
      )
    );
  }

  return await response.json();
}

export async function obtenerFondosActivos(
  token: string
) {
  const response = await fetch(
    `${API_URL}/fondos/activos`,
    {
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo fondos activos"
      )
    );
  }

  return await response.json();
}

export async function crearFondo(
  data: any,
  token: string
) {
  const response = await fetch(`${API_URL}/fondos`, {
    method: "POST",
    headers: getAuthHeaders(token),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error creando fondo"
      )
    );
  }

  return await response.json();
}

export async function actualizarValorCuota(
  fondoId: number,
  nuevoValor: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/fondos/${fondoId}/valor-cuota`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ nuevoValor }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error actualizando valor cuota"
      )
    );
  }

  return await response.json();
}

// ==================== INVERSIONES ====================

export async function crearInversion(
  data: any,
  token: string
) {
  const response = await fetch(
    `${API_URL}/inversiones`,
    {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error creando inversión"
      )
    );
  }

  return await response.json();
}

export async function obtenerMisInversiones(
  usuarioId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/inversiones/mis-inversiones?usuarioId=${usuarioId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo inversiones"
      )
    );
  }

  return await response.json();
}

export async function obtenerRendimiento(
  usuarioId: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/inversiones/rendimiento?usuarioId=${usuarioId}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo rendimiento"
      )
    );
  }

  return await response.json();
}

// ==================== USUARIOS ====================

export async function obtenerUsuario(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}`,
    {
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo usuario"
      )
    );
  }

  return await response.json();
}

// ==================== ADMINISTRACIÓN ====================

export async function obtenerTodosUsuarios(
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios`,
    {
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error obteniendo usuarios"
      )
    );
  }

  return await response.json();
}

export async function autorizarUsuario(
  id: number,
  autorizado: boolean,
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/autorizar`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ autorizado }),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error autorizando usuario"
      )
    );
  }

  return await response.json();
}

export async function bloquearUsuario(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/bloquear`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error bloqueando usuario"
      )
    );
  }

  return await response.json();
}

export async function desbloquearUsuario(
  id: number,
  token: string
) {
  const response = await fetch(
    `${API_URL}/usuarios/${id}/desbloquear`,
    {
      method: "PUT",
      headers: getAuthHeaders(token),
    }
  );

  if (!response.ok) {
    throw new Error(
      await extraerMensajeError(
        response,
        "Error desbloqueando usuario"
      )
    );
  }

  return await response.json();
}