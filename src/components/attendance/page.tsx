import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import AttendanceSheet from "@/components/attendance/AttendanceSheet";
import { DayOfWeek } from "@prisma/client";

export const dynamic = "force-dynamic";

// Helper: Convert Date to Prisma Enum (e.g. "2024-02-01" -> "THURSDAY")
function getPrismaDay(dateString: string): DayOfWeek {
  const dayIndex = new Date(dateString).getDay();
  const days: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return days[dayIndex];
}

type SearchParams = Promise<{ date?: string; shift?: string; course?: string }>;

export default async function StudentAttendancePage(props: {
  searchParams: SearchParams;
}) {
  const params = await props.searchParams;

  // 1. Get Filters (Default to Today)
  const date = params.date || new Date().toISOString().split("T")[0];
  const selectedShift = params.shift || "";
  const selectedCourse = params.course || "";

  // 2. Fetch Dropdowns
  const shifts = await prisma.shift.findMany({ orderBy: { startTime: "asc" } });
  const courses = await prisma.course.findMany({ orderBy: { name: "asc" } });

  // 3. Determine Day of Week (To filter students who don't have class today)
  const targetDay = getPrismaDay(date);

  let students: any[] = [];

  // 4. FETCH STUDENTS (Only if filters are active)
  if (selectedShift && selectedCourse) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        shiftId: selectedShift,
        courseId: selectedCourse,
        active: true,
        // CRITICAL: Only show students who selected THIS day (e.g. MONDAY)
        selectedDays: { has: targetDay },
      },
      include: {
        student: true,
        // Fetch if attendance was ALREADY taken for this specific date
        attendance: {
          where: { date: new Date(date) },
        },
      },
      orderBy: { student: { fullName: "asc" } },
    });

    // Transform data for the UI
    students = enrollments.map((e) => ({
      enrollmentId: e.id,
      studentName: e.student.fullName,
      // If record exists, use it. If not, default to "PRESENT" (easier for admins) or "ABSENT"
      currentStatus: e.attendance[0]?.status || "UNMARKED",
    }));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Student Attendance</h2>
          <p className="text-slate-400">
            Select a Class and Shift to mark attendance.
          </p>
        </div>
      </div>

      {/* --- FILTER BAR --- */}
      <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
        <form className="flex flex-wrap gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Date</label>
            <input
              type="date"
              name="date"
              defaultValue={date}
              className="flex h-10 w-full rounded-md border border-slate-700 bg-black px-3 text-white focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Class Instrument
            </label>
            <select
              name="course"
              defaultValue={selectedCourse}
              className="flex h-10 w-[200px] rounded-md border border-slate-700 bg-black px-3 text-white focus:border-primary focus:outline-none"
            >
              <option value="">-- Select Class --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">
              Time Shift
            </label>
            <select
              name="shift"
              defaultValue={selectedShift}
              className="flex h-10 w-[200px] rounded-md border border-slate-700 bg-black px-3 text-white focus:border-primary focus:outline-none"
            >
              <option value="">-- Select Shift --</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.startTime})
                </option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            className="bg-primary text-black font-bold hover:bg-amber-600"
          >
            <Filter className="mr-2 h-4 w-4" /> Load List
          </Button>
        </form>
      </div>

      {/* --- THE ATTENDANCE SHEET (The "Place" to take attendance) --- */}
      {selectedShift && selectedCourse ? (
        <AttendanceSheet students={students} date={date} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-black border border-slate-800 border-dashed rounded-xl">
          <Filter className="h-10 w-10 mb-4 opacity-50" />
          <p>Please select a Class and Shift above to see the student list.</p>
        </div>
      )}
    </div>
  );
}
