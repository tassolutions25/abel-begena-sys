import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteUser } from "@/actions/delete-actions";
import DeleteButton from "@/components/ui/delete-button";
import StudentEditDialog from "@/components/dialogs/StudentEditDialog";
import EnrollDialog from "@/components/dialogs/EnrollDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ListFilter from "@/components/common/ListFilter"; // <--- Import Filter

export const dynamic = "force-dynamic";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; shift?: string; course?: string }>;
}) {
  const params = await searchParams;

  // 1. Build Filter Query
  const where: any = { role: "STUDENT" };

  if (params.branch) {
    where.branchId = params.branch;
  }

  // Complex Filter: Shift & Course are inside 'enrollments' relation
  if (params.shift || params.course) {
    where.enrollments = {
      some: {
        active: true,
        ...(params.shift && { shiftId: params.shift }),
        ...(params.course && { courseId: params.course }),
      },
    };
  }

  // 2. Fetch Data
  const students = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { branch: true },
  });

  // 3. Fetch Dropdown Options
  const branches = await prisma.branch.findMany();
  const shifts = await prisma.shift.findMany();
  const courses = await prisma.course.findMany();
  const plans = await prisma.pricingPlan.findMany();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Students List
          </h2>
          <p className="text-slate-400">Manage enrolled students.</p>
        </div>
        <Link href="/dashboard/students/new">
          <Button className="bg-primary text-black hover:bg-amber-600 font-bold">
            <Plus className="mr-2 h-4 w-4" /> Add Student
          </Button>
        </Link>
      </div>

      {/* FILTER COMPONENT */}
      <ListFilter
        branches={branches}
        shifts={shifts}
        courses={courses}
        showCourseFilter={true}
      />

      <div className="rounded-md border border-slate-800 bg-black">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800 hover:bg-slate-900">
              <TableHead className="text-slate-300">Full Name</TableHead>
              <TableHead className="text-slate-300">Branch</TableHead>
              <TableHead className="text-slate-300">Email</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-300">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow
                key={student.id}
                className="border-slate-800 hover:bg-slate-900/50"
              >
                <TableCell className="font-medium text-white">
                  <Link
                    href={`/dashboard/students/${student.id}`}
                    className="hover:text-primary hover:underline"
                  >
                    {student.fullName}
                  </Link>
                </TableCell>
                <TableCell className="text-slate-400">
                  {student.branch?.name || "N/A"}
                </TableCell>
                <TableCell className="text-slate-400">
                  {student.email}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs ${student.isActive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"}`}
                  >
                    {student.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <EnrollDialog
                      studentId={student.id}
                      courses={courses}
                      shifts={shifts}
                      plans={plans}
                    />
                    <StudentEditDialog student={student} branches={branches} />
                    <DeleteButton id={student.id} deleteAction={deleteUser} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {students.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center h-24 text-slate-500"
                >
                  No students found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
