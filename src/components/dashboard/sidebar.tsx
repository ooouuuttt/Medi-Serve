"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ClipboardType,
  BarChart3,
  Bell,
  Pill,
  User,
  ClipboardCheck,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "General" },
  { href: "/dashboard/stock", label: "Stock", icon: Package, section: "Pharmacy" },
  { href: "/dashboard/prescriptions", label: "Prescriptions", icon: ClipboardType, section: "Pharmacy" },
  { href: "/dashboard/orders", label: "Orders", icon: ClipboardCheck, section: "Pharmacy" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, section: "Pharmacy" },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, section: "General" },
  { href: "/dashboard/profile", label: "Profile", icon: User, section: "General" },
];

const sections = ["General", "Pharmacy"];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-col border-r bg-card p-4 md:flex">
      <div className="flex items-center gap-2 mb-6">
        <Pill className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">MediServe</h1>
      </div>
      <nav className="flex flex-col gap-4">
        {sections.map(section => (
            <div key={section}>
                <h2 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{section}</h2>
                <div className="flex flex-col gap-1">
                    {navItems.filter(item => item.section === section).map((item) => (
                    <Link key={item.href} href={item.href} passHref>
                        <Button
                        variant={pathname === item.href ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 text-base h-11"
                        >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                        </Button>
                    </Link>
                    ))}
                </div>
            </div>
        ))}
      </nav>
    </aside>
  );
}
