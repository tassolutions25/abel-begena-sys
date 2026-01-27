import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, DollarSign, School, Activity, Clock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const studentCount = await prisma.user.count({ where: { role: "STUDENT" } });
  const branchCount = await prisma.branch.count();

  const revenueAgg = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });
  const totalRevenue = revenueAgg._sum.amount || 0;

  // 1. Get Course Distribution
  const courses = await prisma.course.findMany({
    include: { _count: { select: { enrollments: true } } },
  });

  // 2. NEW: Get Shift Distribution
  const shifts = await prisma.shift.findMany({
    orderBy: { startTime: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });

  // 3. Get Recent Students
  const recentStudents = await prisma.user.findMany({
    where: { role: "STUDENT" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { branch: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">
          Dashboard Overview
        </h2>
        <p className="text-slate-400">Real-time school performance.</p>
      </div>

      {/* TOP CARDS */}
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
            <div className="text-2xl font-bold text-white">
              {totalRevenue.toLocaleString()} ETB
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ANALYTICS SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* LEFT: Course & Shift Distribution */}
        <div className="col-span-4 space-y-4">
          {/* 1. Class Stats */}
          <Card className="bg-black border border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-lg">
                Class Enrollment
              </CardTitle>
              <p className="text-sm text-slate-500">Students per instrument</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courses.map((course) => {
                  // Calculate simple percentage based on total students (approx)
                  const totalEnrolled = courses.reduce(
                    (acc, c) => acc + c._count.enrollments,
                    0,
                  );
                  const percentage =
                    totalEnrolled > 0
                      ? Math.round(
                          (course._count.enrollments / totalEnrolled) * 100,
                        )
                      : 0;
                  return (
                    <div key={course.id}>
                      <div className="flex justify-between text-sm mb-1 text-slate-300">
                        <span>{course.name}</span>
                        <span className="text-primary">
                          {course._count.enrollments} Students
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
                {courses.length === 0 && (
                  <p className="text-slate-500 text-sm">No classes defined.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Shift Stats (NEW) */}
          <Card className="bg-black border border-slate-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="text-primary h-5 w-5" />
                <CardTitle className="text-white text-lg">
                  Shift Density
                </CardTitle>
              </div>
              <p className="text-sm text-slate-500">Students per time slot</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {shifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="bg-slate-900 p-3 rounded border border-slate-800"
                  >
                    <div className="text-sm font-medium text-slate-300">
                      {shift.name}
                    </div>
                    <div className="text-xs text-slate-500 mb-2">
                      {shift.startTime} - {shift.endTime}
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {shift._count.enrollments}
                    </div>
                    <p className="text-xs text-primary">Students Enrolled</p>
                  </div>
                ))}
                {shifts.length === 0 && (
                  <p className="text-slate-500 text-sm col-span-2">
                    No shifts defined.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: Recent Activity */}
        <Card className="col-span-3 bg-black border border-slate-800 h-fit">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="text-primary h-5 w-5" />
              <CardTitle className="text-white">Recent Registrations</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student) => (
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
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {student.branch?.name || "No Branch"}
                  </div>
                </div>
              ))}
              {recentStudents.length === 0 && (
                <p className="text-slate-500">No recent activity.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
