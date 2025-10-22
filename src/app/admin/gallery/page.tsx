 'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AdminGalleryPage() {
  const galleryImages = PlaceHolderImages.filter(p => p.id.startsWith('tour-')).slice(0, 4);

  return (
    <>
      <Card className="shadow-lg relative">
        {/* absolute positioned action to match screenshot cursor position */}
        <div className="absolute top-6 right-6">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">
            <Upload className="mr-2 h-4 w-4" />
            Add New Gallery
          </Button>
        </div>
        <CardHeader>
          <CardTitle>Gallery Images</CardTitle>
          <CardDescription>Upload images to showcase the place</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map(image => (
              <div key={image.id} className="relative aspect-square group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <Image 
                  src={image.imageUrl} 
                  alt={image.description}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
            <div className="flex items-center justify-center aspect-square border-2 border-dashed border-muted-foreground rounded-lg hover:border-primary transition-colors">
              <p className="text-muted-foreground">No more images.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
