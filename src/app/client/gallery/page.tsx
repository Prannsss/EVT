
import { HardHat } from 'lucide-react';

export default function GalleryPage() {
  return (
    <div className="container flex flex-col items-center justify-center text-center min-h-[calc(100vh-20rem)] py-12">
      <HardHat className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-4xl font-headline font-bold">Under Development</h1>
      <p className="mt-4 text-lg text-muted-foreground italic">
        Explore the beauty of Elimar Spring Garden through our photo gallery, coming soon.
      </p>
    </div>
  );
}
