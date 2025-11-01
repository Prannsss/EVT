export interface User {
  id: number;
  name: string;
  email: string;
  contact_number?: string;
  password: string;
  role: 'admin' | 'user';
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserCreate {
  name: string;
  email: string;
  contact_number?: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserPayload {
  id: number;
  email: string;
  role: 'admin' | 'user';
}
