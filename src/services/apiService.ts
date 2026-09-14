import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = "https://tu-api-gateway.amazonaws.com/prod"; 
export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {

  const session = await fetchAuthSession();
  const token = session.tokens?.accessToken?.toString();

  if (!token) {
    throw new Error("Usuario no autenticado");
  }


  const headers = new Headers(options.headers || {});
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");


  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status}`);
  }

  return response.json();
};