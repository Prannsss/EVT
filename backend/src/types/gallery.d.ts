export interface Gallery {
  id: number;
  title: string | null;
  image_url: string;
  description: string | null;
  uploaded_at: Date;
}

export interface GalleryCreate {
  title?: string;
  image_url: string;
  description?: string;
}
