"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  School,
  Banknote,
  CalendarCheck,
  LogOut,
  ShieldCheck,
  BookOpen,
  Clock,
} from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { name: "Branches", icon: School, href: "/dashboard/branches" },
  { name: "Students", icon: Users, href: "/dashboard/students" },
  { name: "Teachers", icon: Users, href: "/dashboard/teachers" },
  { name: "Teacher Shifts", icon: Clock, href: "/dashboard/teachers/shifts" },
  { name: "Academics", icon: BookOpen, href: "/dashboard/academics" },
  { name: "Attendance", icon: CalendarCheck, href: "/dashboard/attendance" },
  { name: "Payments", icon: Banknote, href: "/dashboard/payments" },
  { name: "Admins", icon: ShieldCheck, href: "/dashboard/admins" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    // FIX 1: h-screen ensures it takes the full viewport height
    <div className="flex h-screen w-64 flex-col border-r border-slate-800 bg-black text-white">
      {/* 1. Header (Pinned at Top) */}
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-800 bg-black px-6">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary flex items-center justify-center mb-1">
            <span className="text-primary font-bold text-xs">AB</span>
          </div>
          <h1 className="text-lg font-bold tracking-widest text-primary uppercase">
            Abel Begena
          </h1>
        </div>
      </div>

      {/* 2. Navigation (Scrollable Area) */}
      {/* FIX 2: overflow-y-auto makes this section scrollable if the list is long */}
      <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center rounded-md px-3 py-3 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                  : "text-slate-400 hover:bg-slate-900 hover:text-white"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 flex-shrink-0",
                  isActive
                    ? "text-black"
                    : "text-slate-400 group-hover:text-primary"
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* 3. Footer / Logout (Pinned at Bottom) */}
      <div className="border-t border-slate-800 p-4 shrink-0 bg-black">
        <form action={logoutAction}>
          <button className="flex w-full items-center justify-center rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900 transition-colors">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </form>
      </div>
    </div>
  );
}
