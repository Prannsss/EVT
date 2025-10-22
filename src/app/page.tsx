
'use client';

import Image from "next/image";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { PlaceHolderImages } from "../lib/placeholder-images";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardContent } from "../components/ui/card";
import { ScrollArea, ScrollBar } from "../components/ui/scroll-area";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const tourImages = PlaceHolderImages.filter(p => p.id.startsWith('tour-'));

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-[60vh] md:h-[80vh]">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-black/50" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-primary-foreground px-4">
          <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            Welcome to Elimar Spring Garden
          </h1>
          <p className="mt-4 max-w-2xl text-lg md:text-xl italic">
            Discover a sanctuary of peace and tranquility nestled in the heart of nature. Your perfect escape awaits.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/signup">Book Your Stay</Link>
          </Button>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">About Us</h2>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground italic">
                Founded on the principles of harmony with nature, Elimar Spring Garden is more than just a resort—it's an experience. We are dedicated to providing a serene and luxurious retreat where our guests can reconnect with the environment and themselves. Our commitment to sustainability and local culture is at the heart of everything we do, ensuring an unforgettable stay that is both indulgent and responsible.
            </p>
        </div>
      </section>

      <section className="container py-12 md:py-24">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">3D Tour</h2>
            <p className="mt-2 text-muted-foreground italic">Take a virtual walk through our beautiful resort.</p>
        </div>
        <Tabs defaultValue="1" className="w-full">
          <div className="flex justify-center">
             <ScrollArea className="max-w-full whitespace-nowrap rounded-md">
                <TabsList>
                  {Array.from({ length: 15 }, (_, i) => (
                    <TabsTrigger key={i + 1} value={`${i + 1}`}>
                      {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {tourImages.map((image, index) => (
             <TabsContent key={image.id} value={`${index + 1}`}>
                <Card>
                  <CardContent className="p-4">
                      <div className="relative aspect-video">
                        <Image
                            src={image.imageUrl}
                            alt={image.description}
                            fill
                            className="object-cover rounded-md"
                            data-ai-hint={image.imageHint}
                        />
                      </div>
                  </CardContent>
                </Card>
             </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
