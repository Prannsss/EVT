
'use client';

import type { Metadata } from 'next';
import { ThemeProvider, useTheme } from '../components/theme-provider';
import { Header } from '../components/header';
import { Toaster } from '../components/ui/toaster';
import { cn } from '../lib/utils';
import './globals.css';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { MapPin, Phone, Home, ImageIcon, LogIn } from 'lucide-react';


function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
     <>
        {children}
        <div className="fixed top-4 right-4">
          <ThemeToggle />
        </div>
        <Toaster />
     </>
  )
}

function AdminPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <Toaster />
        </>
    )
}

function ClientPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Toaster />
    </>
  )
}

function MainPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="bg-primary text-primary-foreground py-12 mt-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col gap-3">
              <h3 className="font-bold font-headline text-xl mb-2">Elimar Spring Garden</h3>
              <p className="text-sm opacity-90">A sanctuary of peace and tranquility.</p>
            </div>
            <div>
              <h3 className="font-bold font-headline text-xl mb-4">Quick Links</h3>
              <nav className="flex flex-col gap-3 text-sm">
                <Link href="/" className="hover:underline flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
                <Link href="/client/accommodations" className="hover:underline flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <Home className="w-4 h-4" />
                  Accommodations
                </Link>
                <Link href="/client/gallery" className="hover:underline flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <ImageIcon className="w-4 h-4" />
                  Gallery
                </Link>
                <Link href="/login" className="hover:underline flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              </nav>
            </div>
            <div>
              <h3 className="font-bold font-headline text-xl mb-4">Contact Us</h3>
              <div className="text-sm space-y-3">
                <p className="flex items-start gap-2 opacity-90">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>Barangay Binaobao, Dumangas, Philippines, 5006</span>
                </p>
                <p className="flex items-center gap-2 opacity-90">
                  <Phone className="w-4 h-4 shrink-0" />
                  <span>+(63) 905 556 5755</span>
                </p>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-primary-foreground/20 text-center text-sm opacity-75">
            <p>&copy; {new Date().getFullYear()} Elimar Spring Garden. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <Toaster />
    </>
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup' || pathname === '/verify-email';
  const isAdminPage = pathname.startsWith('/admin');
  const isClientPage = pathname.startsWith('/client');

  return (
    <html lang="en" suppressHydrationWarning className={!isAuthPage && !isAdminPage ? "scroll-smooth" : ""}>
      <head>
        <title>{isAdminPage ? 'Admin - ' : ''}Elimar Spring Garden</title>
        <meta name="description" content="A serene resort nestled in nature. Book your escape." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background text-foreground font-body antialiased', isClientPage || (!isAuthPage && !isAdminPage) ? 'flex flex-col' : '')}>
        <ThemeProvider>
          {isAuthPage && <AuthLayout>{children}</AuthLayout>}
          {isAdminPage && <AdminPageLayout>{children}</AdminPageLayout>}
          {isClientPage && <ClientPageLayout>{children}</ClientPageLayout>}
          {!isAuthPage && !isAdminPage && !isClientPage && <MainPageLayout>{children}</MainPageLayout>}
        </ThemeProvider>
      </body>
    </html>
  );
}
