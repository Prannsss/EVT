export interface WalkInLog {
  id: number;
  client_name: string;
  guest_names: string | null;
  address: string | null;
  accommodation_id: number | null;
  check_in_date: string;
  adults: number;
  kids: number;
  pwd: number;
  amount_paid: number;
  checked_out: boolean;
  checked_out_at: string | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  accommodation_name?: string;
  created_by_name?: string;
}

export interface CreateWalkInLogData {
  client_name: string;
  guest_names?: string;
  address?: string;
  accommodation_id?: number;
  check_in_date: string;
  adults?: number;
  kids?: number;
  pwd?: number;
  amount_paid?: number;
  created_by?: number;
}

export interface UpdateWalkInLogData {
  client_name?: string;
  guest_names?: string;
  address?: string;
  accommodation_id?: number;
  check_in_date?: string;
  adults?: number;
  kids?: number;
  pwd?: number;
  amount_paid?: number;
}
