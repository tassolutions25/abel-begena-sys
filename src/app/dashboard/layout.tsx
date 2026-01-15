import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    // Changed bg-slate-50 to bg-black (or bg-background)
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 text-foreground">
        {children}
      </main>
    </div>
  );
}