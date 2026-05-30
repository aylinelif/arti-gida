export type ReservationStatus = 'pending' | 'completed' | 'cancelled';

export interface Reservation {
  id: number;
  listingId: number;
  listingTitle: string;
  establishmentName: string;
  pickupTime: string;
  status: ReservationStatus;
  reservedAt: string;
}

export interface BusinessReservation {
  id: number;
  listingId: number;
  listingTitle: string;
  customerName: string;
  customerEmail: string;
  pickupTime: string;
  status: ReservationStatus;
  reservedAt: string;
}
