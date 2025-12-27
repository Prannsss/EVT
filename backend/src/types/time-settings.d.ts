export interface TimeSlotSetting {
  id: number;
  slot_type: 'morning' | 'night' | 'whole_day';
  accommodation_type: 'cottage' | 'room' | 'all';
  start_time: string;
  end_time: string;
  is_overnight: boolean;
  is_enabled: boolean;
  label: string | null;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface TimeSlotSettingUpdate {
  start_time?: string;
  end_time?: string;
  is_overnight?: boolean;
  is_enabled?: boolean;
  label?: string;
  description?: string;
}

export interface TimeSlotSettingCreate {
  slot_type: 'morning' | 'night' | 'whole_day';
  accommodation_type: 'cottage' | 'room' | 'all';
  start_time: string;
  end_time: string;
  is_overnight?: boolean;
  is_enabled?: boolean;
  label?: string;
  description?: string;
}
