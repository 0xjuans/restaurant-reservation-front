// Modelos de autenticación alineados con los DTOs del backend (auth-service).

export interface LoginRequest {
  email:    string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName:  string;
  email:     string;
  password:  string;
  phone:     string;
}

// Respuesta del backend al autenticar o registrar (alineada con AuthResponse.java)
export interface AuthResponse {
  userId:    number;
  email:     string;
  roles:     string[];
  token:     string;
  expiresIn: number;
}
