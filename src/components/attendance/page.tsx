import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import AttendanceSheet from "@/components/attendance/AttendanceSheet";
import { redirect } from "next/navigation";

// Define Page Props
type Props = {
  searchParams: { date?: string; shift?: string; course?: string };
};

export default async function AttendancePage({ searchParams }: Props) {
  // Await searchParams because in Next 15 it's a promise
  const params = await searchParams; // <--- VITAL FIX FOR NEXT 15

  const date = params.date || new Date().toISOString().split("T")[0];
  const selectedShift = params.shift || "";
  const selectedCourse = params.course || "";

  const shifts = await prisma.shift.findMany();
  const courses = await prisma.course.findMany();

  // Fetch Students ONLY if filters are selected
  let students: any[] = [];

  if (selectedShift && selectedCourse) {
    const enrollments = await prisma.enrollment.findMany({
      where: { shiftId: selectedShift, courseId: selectedCourse, active: true },
      include: {
        student: true,
        attendance: { where: { date: new Date(date) } },
      },
    });

    students = enrollments.map((e) => ({
      enrollmentId: e.id,
      studentName: e.student.fullName,
      currentStatus: e.attendance[0]?.status || undefined,
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Daily Attendance</h2>
      </div>

      {/* FILTER BAR - Simple GET Form for server-side filtering */}
      <form className="flex flex-wrap gap-4 bg-black p-4 border border-slate-800 rounded-lg items-end">
        <div className="space-y-1">
          <label className="text-xs text-slate-400">Date</label>
          <input
            type="date"
            name="date"
            defaultValue={date}
            className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-900 px-3 text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Class Category</label>
          <select
            name="course"
            defaultValue={selectedCourse}
            className="flex h-10 w-[180px] rounded-md border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value="">Select Class</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Shift</label>
          <select
            name="shift"
            defaultValue={selectedShift}
            className="flex h-10 w-[200px] rounded-md border border-slate-700 bg-slate-900 px-3 text-white"
          >
            <option value="">Select Shift</option>
            {shifts.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.startTime})
              </option>
            ))}
          </select>
        </div>

        <Button
          type="submit"
          className="bg-slate-800 text-white border border-slate-700 hover:bg-slate-700"
        >
          <Filter className="mr-2 h-4 w-4" /> Load List
        </Button>
      </form>

      {/* ATTENDANCE SHEET */}
      {selectedShift && selectedCourse ? (
        <AttendanceSheet students={students} date={date} />
      ) : (
        <div className="text-center py-20 text-slate-500 bg-black border border-slate-800 rounded border-dashed">
          Please select a Date, Class, and Shift to take attendance.
        </div>
      )}
    </div>
  );
}
