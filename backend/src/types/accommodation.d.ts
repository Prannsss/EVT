export interface Accommodation {
  id: number;
  name: string;
  type: 'room' | 'cottage';
  capacity: string;
  description: string | null;
  price: number;
  inclusions: string | null;
  image_url: string | null;
  panoramic_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface AccommodationCreate {
  name: string;
  type: 'room' | 'cottage';
  capacity: string;
  description?: string;
  price: number;
  inclusions?: string;
  image_url?: string;
  panoramic_url?: string;
}

export interface AccommodationUpdate {
  name?: string;
  type?: 'room' | 'cottage';
  capacity?: string;
  description?: string;
  price?: number;
  inclusions?: string;
  image_url?: string;
  panoramic_url?: string;
}
