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
