// Modelos de clientes alineados con los DTOs del customer-service.

export interface CustomerRequest {
  firstName: string;
  lastName:  string;
  phone:     string;
}

export interface CustomerResponse {
  id:        number;
  userId:    number;
  firstName: string;
  lastName:  string;
  email:     string;
  phone:     string;
  createdAt: string;
  updatedAt: string;
}
