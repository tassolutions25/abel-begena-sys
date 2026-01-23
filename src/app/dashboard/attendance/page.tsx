import prisma from "@/lib/prisma";
import AttendanceSheet from "@/components/attendance/AttendanceSheet";
import AttendanceFilter from "@/components/attendance/AttendanceFilter"; // <--- Import New Component
import { DayOfWeek } from "@prisma/client";

export const dynamic = "force-dynamic";

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

type SearchParams = Promise<{
  date?: string;
  shift?: string;
  course?: string;
  branch?: string;
}>;

export default async function AttendancePage(props: {
  searchParams: SearchParams;
}) {
  const params = await props.searchParams;

  const date = params.date || new Date().toISOString().split("T")[0];
  const selectedShift = params.shift || "";
  const selectedCourse = params.course || "";
  const selectedBranch = params.branch || "";

  // 1. Fetch Dropdown Data
  const [shifts, courses, branches] = await Promise.all([
    prisma.shift.findMany(),
    prisma.course.findMany(),
    prisma.branch.findMany(),
  ]);

  // 2. Determine Day
  const targetDay = getPrismaDay(date);

  // 3. Fetch Students based on Filters
  let students: any[] = [];

  if (selectedShift && selectedCourse) {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        shiftId: selectedShift,
        courseId: selectedCourse,
        active: true,
        selectedDays: {
          has: targetDay,
        },
        student: selectedBranch ? { branchId: selectedBranch } : undefined,
      },
      include: {
        student: true,
        attendance: { where: { date: new Date(date) } },
      },
      orderBy: {
        student: { fullName: "asc" },
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
        <h2 className="text-3xl font-bold text-white">Student Attendance</h2>
      </div>

      {/* REPLACED FORM WITH AUTO-FILTER COMPONENT */}
      <AttendanceFilter branches={branches} courses={courses} shifts={shifts} />

      {/* ATTENDANCE SHEET */}
      {selectedShift && selectedCourse ? (
        <AttendanceSheet students={students} date={date} />
      ) : (
        <div className="text-center py-20 text-slate-500 bg-black border border-slate-800 rounded border-dashed">
          Select a Class and Shift to load the student list.
        </div>
      )}
    </div>
  );
}
