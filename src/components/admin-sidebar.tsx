
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, GalleryHorizontal } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from './ui/sidebar';

const navLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Calendar },
  { href: '/admin/clients', label: 'Clients', icon: Users },
  { href: '/admin/gallery', label: 'Gallery', icon: GalleryHorizontal },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <SidebarProvider>
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2 p-2">
                    <SidebarTrigger />
                    <Link href="/" className="font-bold font-headline text-lg group-data-[collapsible=icon]:hidden">
                    Elimar Admin
                    </Link>
                </div>
            </SidebarHeader>
            <SidebarContent>
            <SidebarMenu>
                {navLinks.map((link) => (
                <SidebarMenuItem key={link.href}>
                    <Link href={link.href} passHref legacyBehavior>
                    <SidebarMenuButton
                        isActive={pathname.startsWith(link.href)}
                        tooltip={link.label}
                    >
                        <link.icon />
                        <span>{link.label}</span>
                    </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
                ))}
            </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    </SidebarProvider>
  );
}
