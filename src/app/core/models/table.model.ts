// Modelos de mesas alineados con los DTOs del table-service.

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'MAINTENANCE';

export interface TableResponse {
  id:        number;
  zoneId:    number;
  zoneName:  string;
  number:    number;
  capacity:  number;
  status:    TableStatus;
  createdAt: string;
  updatedAt: string;
}
