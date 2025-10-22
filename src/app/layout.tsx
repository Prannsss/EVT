
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
import { AdminSidebar } from '@/components/admin-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';


function AuthLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
     <html lang="en" suppressHydrationWarning>
         <head>
          <title>Elimar Spring Garden</title>
          <meta name="description" content="A serene resort nestled in nature. Book your escape." />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
        </head>
        <body className={cn('min-h-screen bg-background text-foreground font-body', theme)}>
            {children}
            <div className="fixed top-4 right-4">
              <ThemeToggle />
            </div>
            <Toaster />
        </body>
      </html>
  )
}

function AdminPageLayout({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <title>Admin - Elimar Spring Garden</title>
                <meta name="description" content="Admin dashboard for Elimar Spring Garden." />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
            </head>
            <body className={cn('min-h-screen bg-background text-foreground font-body', theme)}>
                <SidebarProvider>
                    <AdminSidebar />
                    <SidebarInset className="p-8">
                        {children}
                    </SidebarInset>
                </SidebarProvider>
                <div className="fixed top-4 right-4">
                    <ThemeToggle />
                </div>
                <Toaster />
            </body>
        </html>
    )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');


  if (isAuthPage) {
    return (
      <ThemeProvider>
        <AuthLayout>{children}</AuthLayout>
      </ThemeProvider>
    );
  }

  if (isAdminPage) {
    return (
         <ThemeProvider>
            <AdminPageLayout>{children}</AdminPageLayout>
        </ThemeProvider>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Elimar Spring Garden</title>
        <meta name="description" content="A serene resort nestled in nature. Book your escape." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&family=Instrument+Sans:ital,wght@0,400..700;1,400..700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased flex flex-col',
          'font-body'
        )}
      >
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-primary text-primary-foreground py-8 px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
              <div className="container grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col gap-2">
                  <h3 className="font-bold font-headline text-lg">Elimar Spring Garden</h3>
                  <p className="text-sm">A sanctuary of peace and tranquility.</p>
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg mb-2">Quick Links</h3>
                  <nav className="flex flex-col gap-2 text-sm">
                    <Link href="/" className="hover:underline">Home</Link>
                    <Link href="/client/accommodations" className="hover:underline">Accommodations</Link>
                    <Link href="/client/gallery" className="hover:underline">Gallery</Link>
                    <Link href="/login" className="hover:underline">Login</Link>
                  </nav>
                </div>
                <div>
                  <h3 className="font-bold font-headline text-lg mb-2">Contact Us</h3>
                  <div className="text-sm space-y-2">
                    <p>123 Nature Lane, Serenity Valley</p>
                    <p>Email: contact@elimarspring.com</p>
                    <p>Phone: (123) 456-7890</p>
                  </div>
                </div>
              </div>
              <div className="container mt-8 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} Elimar Spring Garden. All rights reserved.</p>
              </div>
            </footer>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
