export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: Date;
  check_out_date: Date | null;
  adults: number;
  kids: number;
  pwd: number;
  overnight_stay: boolean;
  overnight_swimming: boolean;
  total_price: number;
  status: 'pending' | 'approved' | 'cancelled';
  proof_of_payment_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BookingCreate {
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  check_out_date?: string;
  adults: number;
  kids: number;
  pwd: number;
  overnight_stay: boolean;
  overnight_swimming: boolean;
  total_price: number;
  proof_of_payment_url?: string;
}

export interface BookingUpdate {
  status?: 'pending' | 'approved' | 'cancelled';
  proof_of_payment_url?: string;
}
