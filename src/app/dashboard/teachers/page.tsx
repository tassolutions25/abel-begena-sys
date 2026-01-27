import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteUser } from "@/actions/delete-actions";
import DeleteButton from "@/components/ui/delete-button";
import { Button } from "@/components/ui/button";
import { Plus, Clock, ClipboardList } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditTeacherDialog } from "@/components/dialogs/TeacherDialogs";
import ListFilter from "@/components/common/ListFilter"; // <--- Import Filter

export const dynamic = "force-dynamic";

export default async function TeachersListPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; shift?: string }>;
}) {
  const params = await searchParams;

  // 1. Build Filter
  const where: any = { role: "TEACHER" };

  if (params.branch) where.branchId = params.branch;
  if (params.shift) where.teacherShiftId = params.shift;

  // 2. Fetch Data
  const teachers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      branch: true,
      teacherShift: true,
    },
  });

  // 3. Dropdown Options
  const branches = await prisma.branch.findMany();
  const shifts = await prisma.teacherShift.findMany(); // Teacher Shifts

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Teachers
          </h2>
          <p className="text-slate-400">Manage staff and work schedules.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/teachers/shifts">
            <Button
              variant="outline"
              className="border-slate-700 bg-black text-slate-300 hover:bg-slate-900"
            >
              <Clock className="mr-2 h-4 w-4" /> Shifts
            </Button>
          </Link>
          <Link href="/dashboard/teachers/attendance">
            <Button
              variant="outline"
              className="border-slate-700 bg-black text-slate-300 hover:bg-slate-900"
            >
              <ClipboardList className="mr-2 h-4 w-4" /> Attendance
            </Button>
          </Link>
          <Link href="/dashboard/teachers/new">
            <Button className="bg-primary text-black hover:bg-amber-600 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Register Teacher
            </Button>
          </Link>
        </div>
      </div>

      {/* FILTER COMPONENT */}
      <ListFilter
        branches={branches}
        shifts={shifts}
        showCourseFilter={false} // Teachers don't have classes directly linked this way usually
      />

      <div className="rounded-md border border-slate-800 bg-black">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-slate-300">Teacher Name</TableHead>
              <TableHead className="text-slate-300">Branch</TableHead>
              <TableHead className="text-slate-300">Work Shift</TableHead>
              <TableHead className="text-slate-300">Contact</TableHead>
              <TableHead className="text-right text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow
                key={teacher.id}
                className="border-slate-800 hover:bg-slate-900/50"
              >
                <TableCell>
                  <Link
                    href={`/dashboard/teachers/${teacher.id}`}
                    className="hover:text-primary hover:underline font-bold text-white"
                  >
                    {teacher.fullName}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-400">
                  {teacher.branch?.name || "Unassigned"}
                </TableCell>
                <TableCell>
                  {teacher.teacherShift ? (
                    <span className="bg-slate-900 border border-slate-700 text-xs px-2 py-1 rounded text-white block w-fit">
                      {teacher.teacherShift.name}
                      <span className="text-slate-500 block text-[10px]">
                        {teacher.teacherShift.startTime} -{" "}
                        {teacher.teacherShift.endTime}
                      </span>
                    </span>
                  ) : (
                    <span className="text-red-400 text-xs">No Shift</span>
                  )}
                </TableCell>
                <TableCell className="text-slate-400 text-sm">
                  <div>{teacher.email}</div>
                  <div className="text-xs text-slate-500">{teacher.phone}</div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EditTeacherDialog
                      teacher={teacher}
                      branches={branches}
                      shifts={shifts}
                    />
                    <DeleteButton id={teacher.id} deleteAction={deleteUser} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  No teachers found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
