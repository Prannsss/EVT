
"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import * as React from "react";

import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { ThemeToggle } from "./theme-toggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/client/accommodations", label: "Accommodations" },
  { href: "/client/gallery", label: "Gallery" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20">
        {/* Desktop Nav: Left side */}
        <div className="flex-1 hidden md:flex">
          <Link href="/" className="flex items-center">
            <span className="font-bold font-headline ml-2">
              Elimar Spring Garden
            </span>
          </Link>
        </div>

        {/* Desktop Nav: Center */}
        <div className="flex-1 justify-center hidden md:flex">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname === link.href ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                 <Link href="/" className="flex items-center gap-2 mb-6" onClick={() => setOpen(false)}>
                    <span className="font-bold font-headline">Elimar Spring</span>
                </Link>
                <nav className="grid gap-4 text-lg">
                    {navLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                            <Link
                              href={link.href}
                              className={cn(
                                "transition-colors hover:text-foreground",
                                pathname === link.href ? "text-foreground" : "text-muted-foreground"
                              )}
                            >
                              {link.label}
                            </Link>
                        </SheetClose>
                    ))}
                </nav>
              </SheetContent>
            </Sheet>
        </div>
        
        {/* Mobile Title */}
        <div className="absolute left-1/2 -translate-x-1/2 md:hidden">
             <Link href="/" className="flex items-center">
                <span className="font-bold font-headline text-lg">
                    Elimar
                </span>
            </Link>
        </div>
        
        <div className="flex-1 flex items-center justify-end gap-2">
          <ThemeToggle />
          <Button asChild>
              <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
