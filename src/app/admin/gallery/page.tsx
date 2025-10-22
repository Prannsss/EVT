
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

export default function AdminGalleryPage() {
  const galleryImages = PlaceHolderImages.filter(p => p.id.startsWith('tour-')).slice(0, 4);

  return (
    <div>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold font-headline">Manage Gallery</h1>
            <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Gallery Images</CardTitle>
                <CardDescription>Drag and drop to reorder images.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {galleryImages.map(image => (
                        <div key={image.id} className="relative aspect-square">
                            <Image 
                                src={image.imageUrl} 
                                alt={image.description}
                                fill
                                className="object-cover rounded-md"
                            />
                        </div>
                    ))}
                     <div className="flex items-center justify-center aspect-square border-2 border-dashed border-muted-foreground rounded-md">
                        <p className="text-muted-foreground">No more images.</p>
                     </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
