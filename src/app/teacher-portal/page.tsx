import prisma from "@/lib/prisma";
import TeacherActionButtons from "@/components/teacher/TeacherClockInButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, LogOut } from "lucide-react";
import { getSession } from "@/lib/session"; // Import Session
import { redirect } from "next/navigation";
import { logoutAction } from "@/actions/auth-actions"; // Import Logout
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { resumeShift } from "@/actions/teacher-actions";

const formatEAT = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Addis_Ababa",
  }).format(date);
};

export const dynamic = "force-dynamic";

export default async function TeacherPortal() {
  // 1. GET SESSION (Who is logged in?)
  const session = await getSession();

  // 2. PROTECT ROUTE
  if (!session || session.role !== "TEACHER") {
    redirect("/login");
  }

  // 3. FETCH DATA FOR *THIS* TEACHER
  const teacher = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { teacherShift: true },
  });

  if (!teacher) {
    // Safety fallback
    redirect("/login");
  }

  // 4. CHECK ATTENDANCE STATUS
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Use UTC logic if you kept it, otherwise standard date
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const attendance = await prisma.teacherAttendance.findUnique({
    where: { date_userId: { date: todayUTC, userId: teacher.id } },
  });

  let status: "NONE" | "WORKING" | "DONE" = "NONE";
  if (attendance) {
    if (attendance.checkOut) status = "DONE";
    else status = "WORKING";
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
      {/* LOGOUT BUTTON */}
      <form action={logoutAction} className="absolute top-4 right-4">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-800 bg-black text-slate-400 hover:text-white hover:bg-slate-900"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sign Out
        </Button>
      </form>

      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-primary rounded-full mx-auto flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Hi, {teacher.fullName.split(" ")[0]}
          </h1>
          <p className="text-slate-400">Teacher Portal</p>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-slate-400">Your Shift:</span>
            <span className="text-white font-bold">
              {teacher.teacherShift
                ? `${teacher.teacherShift.name} (${teacher.teacherShift.startTime})`
                : "No Shift Assigned"}
            </span>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white">Daily Attendance</CardTitle>
            <p className="text-sm text-slate-500">
              {new Date().toDateString()}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4 space-y-4">
            {status === "WORKING" && (
              <div className="text-center">
                <p className="text-green-500 font-bold text-lg animate-pulse">
                  ● Currently Working
                </p>
                <p className="text-slate-400 text-sm">
                  Started at {attendance?.checkIn?.toLocaleTimeString()}
                </p>
              </div>
            )}
            {status === "DONE" && (
              <div className="text-center w-full">
                <p className="text-slate-300 font-medium">Shift Record:</p>
                <p className="text-slate-500 text-sm mb-4">
                  {formatEAT(attendance!.checkIn!)} -{" "}
                  {formatEAT(attendance!.checkOut!)}
                </p>

                {/* NEW: RESUME BUTTON (Fixes the "Oops I clocked out" issue) */}
                <form action={resumeShift} className="w-full">
                  <input
                    type="hidden"
                    name="attendanceId"
                    value={attendance!.id}
                  />
                  <Button
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  >
                    <Play className="mr-2 h-4 w-4" /> Resume Shift
                  </Button>
                </form>
              </div>
            )}

            <TeacherActionButtons userId={teacher.id} status={status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
