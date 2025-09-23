"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, LifeBuoy, LogOut, Menu, User, Pill, LayoutDashboard, Package, ClipboardType, BarChart3 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import placeholderImages from '@/lib/placeholder-images.json';
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/stock", label: "Stock", icon: Package },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: ClipboardType },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

const pageTitles: { [key: string]: string } = {
    '/dashboard': 'Dashboard',
    '/dashboard/stock': 'Stock Management',
    '/dashboard/prescriptions': 'Prescription Handling',
    '/dashboard/analytics': 'Analytics & Reports',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/profile': 'User Profile',
}


export function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const userAvatar = placeholderImages.placeholderImages.find(p => p.id === 'user-avatar');
    const pageTitle = pageTitles[pathname] || 'MediServe';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <Link href="/dashboard" className="mb-8 flex items-center gap-2">
                <Pill className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">MediServe</span>
            </Link>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    pathname === item.href && "bg-secondary text-primary"
                )}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/notifications">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10 border-2 border-primary/50">
                {userAvatar && <AvatarImage src={userAvatar.imageUrl} data-ai-hint={userAvatar.imageHint} />}
                <AvatarFallback>MO</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Medico Owner</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LifeBuoy className="mr-2 h-4 w-4" />
              <span>Support</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/login')}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
