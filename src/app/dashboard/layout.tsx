import { Sidebar } from "@/components/layout/Sidebar";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // If not logged in, or if logged in as STUDENT/TEACHER, kick them out
  if (
    !session ||
    (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")
  ) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 text-foreground">
        {children}
      </main>
    </div>
  );
}
