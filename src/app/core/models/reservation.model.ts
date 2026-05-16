// Modelos de reservaciones alineados con los DTOs del reservation-service.

export type ReservationStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface ReservationRequest {
  customerId:  number;
  tableId:     number;
  date:        string;   // 'YYYY-MM-DD'
  startTime:   string;   // 'HH:mm'
  endTime:     string;   // 'HH:mm'
  guestsCount: number;
  notes?:      string;
}

export interface ReservationResponse {
  id:            number;
  customerId:    number;
  customerName:  string;
  tableId:       number;
  tableZoneName: string;
  tableNumber:   number;
  date:          string;
  startTime:     string;
  endTime:       string;
  guestsCount:   number;
  status:        ReservationStatus;
  notes:         string;
  createdAt:     string;
  updatedAt:     string;
}
