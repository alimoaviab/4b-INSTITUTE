"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  FileText,
  HelpCircle,
  FileEdit,
  GraduationCap,
  Calendar,
  AlertTriangle,
  LogOut,
  ShieldCheck
} from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  const navItems = [
    { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Students", href: "/admin/students", icon: Users },
    { title: "Applications", href: "/admin/applications", icon: FileText },
    { title: "Question Bank", href: "/admin/questions", icon: HelpCircle },
    { title: "Tests Config", href: "/admin/tests", icon: FileEdit },
    { title: "Results & Merit", href: "/admin/results", icon: GraduationCap },
    { title: "Interviews", href: "/admin/interviews", icon: Calendar },
    { title: "Violations", href: "/admin/violations", icon: AlertTriangle },
    { title: "Verification Logs", href: "/admin/verification-logs", icon: ShieldCheck },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full" style={{ backgroundColor: "#ffffff" }}>
        <Sidebar className="border-r border-gray-200" style={{ backgroundColor: "#ffffff" }}>
          <SidebarHeader className="border-b border-gray-200 p-4" style={{ backgroundColor: "#ffffff" }}>
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded-md">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <span className="font-semibold text-lg tracking-tight text-gray-900">Admin Portal</span>
            </div>
          </SidebarHeader>
          <SidebarContent style={{ backgroundColor: "#ffffff" }}>
            <SidebarMenu className="px-2 py-4">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link 
                        href={item.href} 
                        className={`flex items-center gap-3 ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-gray-200 p-4" style={{ backgroundColor: "#ffffff" }}>
            <Button variant="outline" className="w-full justify-start gap-2 text-gray-700 border-gray-300" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: "#ffffff" }}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
