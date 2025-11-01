export interface PricingSetting {
  id: number;
  category: string;
  type: string;
  label: string;
  price: number;
  created_at: Date;
  updated_at: Date;
}

export interface PricingUpdate {
  category: string;
  type: string;
  price: number;
}

export interface PricingGroup {
  entrance: {
    adult: number;
    kids_senior_pwd: number;
  };
  swimming: {
    adult: number;
    kids_senior_pwd: number;
  };
  event: {
    whole_day: number;
    evening: number;
    morning: number;
  };
  night_swimming: {
    per_head: number;
  };
}
