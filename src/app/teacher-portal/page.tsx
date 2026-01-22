import prisma from "@/lib/prisma";
import TeacherActionButtons from "@/components/teacher/TeacherClockInButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, Clock } from "lucide-react";

export default async function TeacherPortal() {
  // SIMULATION: In a real app, you get this ID from the session
  // For demo, we just pick the first teacher found in DB
  const teacher = await prisma.user.findFirst({
    where: { role: "TEACHER" },
    include: { teacherShift: true },
  });

  if (!teacher)
    return (
      <div className="text-white p-10">
        No teacher account found. Please register one in Admin Dashboard.
      </div>
    );

  // Check today's status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await prisma.teacherAttendance.findUnique({
    where: { date_userId: { date: today, userId: teacher.id } },
  });

  // Determine State
  let status: "NONE" | "WORKING" | "DONE" = "NONE";
  if (attendance) {
    if (attendance.checkOut) status = "DONE";
    else status = "WORKING";
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 bg-primary rounded-full mx-auto flex items-center justify-center">
            <UserCheck className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {teacher.fullName}
          </h1>
          <p className="text-slate-400">Teacher Portal</p>
        </div>

        {/* Shift Info */}
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="flex items-center justify-between p-4">
            <span className="text-slate-400">Your Shift:</span>
            <span className="text-white font-bold">
              {teacher.teacherShift?.name} ({teacher.teacherShift?.startTime} -{" "}
              {teacher.teacherShift?.endTime})
            </span>
          </CardContent>
        </Card>

        {/* CLOCK IN ACTION */}
        <Card className="bg-slate-900 border-slate-800 border-t-4 border-t-primary">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-white">Daily Attendance</CardTitle>
            <p className="text-sm text-slate-500">
              {new Date().toDateString()}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col items-center pt-4 space-y-4">
            {/* STATUS DISPLAY */}
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
              <div className="text-center">
                <p className="text-slate-300 font-medium">Worked today:</p>
                <p className="text-slate-500 text-sm">
                  {attendance?.checkIn?.toLocaleTimeString()} -{" "}
                  {attendance?.checkOut?.toLocaleTimeString()}
                </p>
              </div>
            )}

            {/* BUTTONS */}
            <TeacherActionButtons userId={teacher.id} status={status} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
