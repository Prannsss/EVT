export interface Gallery {
  id: number;
  image_url: string;
  description: string | null;
  uploaded_at: Date;
}

export interface GalleryCreate {
  image_url: string;
  description?: string;
}
