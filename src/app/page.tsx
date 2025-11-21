'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { PlaceHolderImages } from "../lib/placeholder-images";
import Tour3D from "../components/Tour3D";

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');
  const tourImages = PlaceHolderImages.filter(p => p.id.startsWith('tour-'));
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="flex flex-col">
      <section className="relative w-full h-screen">
        {heroImage && (
          <Image
            src="/assets/main.png"
            alt="Elimar Spring Garden Hero Image"
            fill
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4">
          <div className="flex flex-col items-start">
            <p className="text-xl md:text-2xl mb-2 font-bold">Welcome to</p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline tracking-tight uppercase text-yellow-400">
              ELIMAR SPRING GARDEN
            </h1>
          </div>
          <Button asChild size="lg" className="mt-12 bg-blue-500 hover:bg-blue-600 text-white px-12 py-6 text-xl rounded-full">
            <Link href="/signup">Book Now</Link>
          </Button>
        </div>
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-8 h-12 border-2 border-white rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white rounded-full"></div>
          </div>
        </div>
      </section>

      <section className="bg-background py-16 md:py-20">
        <div className="page-container text-center">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">About Us</h2>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground italic">
                Founded on the principles of harmony with nature, Elimar Spring Garden is more than just a resort—it's an experience. We are dedicated to providing a serene and luxurious retreat where our guests can reconnect with the environment and themselves. Our commitment to sustainability and local culture is at the heart of everything we do, ensuring an unforgettable stay that is both indulgent and responsible.
            </p>
        </div>
      </section>

      <section className="page-container py-12 md:py-24">
        <Tour3D />
      </section>
    </div>
  );
}
