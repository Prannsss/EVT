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
      <section className="relative w-full h-[60vh] md:h-[80vh]">
        {heroImage && (
          <Image
            src="/assets/main.png"
            alt="Elimar Spring Garden Hero Image"
            fill
            className="object-cover"
            priority
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
            {isLoggedIn ? (
              <Link href="/client/booking">View Your Bookings</Link>
            ) : (
              <Link href="/signup">Book Your Stay</Link>
            )}
          </Button>
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
