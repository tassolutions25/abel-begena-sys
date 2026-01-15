import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DollarSign,
  School,
  ArrowUpRight,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  // 1. Fetch Analytics Data
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const branchCount = await prisma.branch.count();

  // 2. Fetch Recent Registrations
  const recentStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { branch: true },
  });

  return (
    <div className="space-y-6">
      {/* --- HEADER --- */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Dashboard Overview
        </h2>
        <p className="text-slate-400">Real-time school performance.</p>
      </div>

      {/* --- CARDS SECTION --- */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{studentCount}</div>
            <p className="text-xs text-slate-500 mt-1 flex items-center">
              <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" /> Active
              Enrollments
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Active Branches
            </CardTitle>
            <School className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{branchCount}</div>
            <p className="text-xs text-slate-500 mt-1">Addis Ababa & Chicago</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary bg-card text-card-foreground">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$0.00</div>
            <p className="text-xs text-slate-500 mt-1">Pending Integration</p>
          </CardContent>
        </Card>
      </div>

      {/* --- RECENT ACTIVITY SECTION --- */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-3 bg-black border border-slate-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" />
              <CardTitle className="text-white">Recent Registrations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No students registered yet.
                </p>
              ) : (
                recentStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between border-b border-slate-900 pb-2 last:border-0"
                  >
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
                        <span className="text-xs font-bold text-primary">
                          {student.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none text-white">
                          {student.fullName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-slate-400">
                      {student.branch?.name || "No Branch"}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
