export type TimeSlotType = 'morning' | 'night' | 'whole_day';

export interface Booking {
  id: number;
  user_id: number;
  accommodation_id: number;
  check_in_date: Date;
  time_slot: TimeSlotType;
  booking_time: string;
  check_out_date: Date | null;
  adults: number;
  kids: number;
  pwd: number;
  senior: number;
  adult_swimming: number;
  kid_swimming: number;
  pwd_swimming: number;
  senior_swimming: number;
  guest_names: string | null;
  overnight_stay: boolean;
  overnight_swimming: boolean;
  total_price: number;
  status: 'pending' | 'approved' | 'cancelled' | 'completed';
  checked_out_at: Date | null;
  proof_of_payment_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BookingCreate {
  user_id: number;
  accommodation_id: number;
  check_in_date: string;
  time_slot?: TimeSlotType;
  booking_time: string;
  check_out_date?: string;
  adults: number;
  kids: number;
  pwd: number;
  senior: number;
  adult_swimming?: number;
  kid_swimming?: number;
  pwd_swimming?: number;
  senior_swimming?: number;
  overnight_stay: boolean;
  overnight_swimming: boolean;
  total_price: number;
  proof_of_payment_url?: string;
}

export interface BookingUpdate {
  status?: 'pending' | 'approved' | 'cancelled' | 'completed';
  time_slot?: TimeSlotType;
  proof_of_payment_url?: string;
  guest_names?: string;
  checked_out_at?: string;
}
