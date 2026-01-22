import Link from "next/link";
import prisma from "@/lib/prisma";
import { deleteUser } from "@/actions/delete-actions";
import DeleteButton from "@/components/ui/delete-button";
import StudentEditDialog from "@/components/dialogs/StudentEditDialog"; // <--- Import Dialog
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
import EnrollDialog from "@/components/dialogs/EnrollDialog";

export const dynamic = "force-dynamic";

export default async function StudentsPage() {
  // 1. Fetch Students
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    include: { branch: true },
  });

  // 2. Fetch Branches (Needed for the Edit Dropdown)
  const branches = await prisma.branch.findMany({
    select: { id: true, name: true },
  });

  const courses = await prisma.course.findMany();
  const shifts = await prisma.shift.findMany();

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
                    className={`px-2 py-1 rounded text-xs ${
                      student.isActive
                        ? "bg-green-900/30 text-green-400"
                        : "bg-red-900/30 text-red-400"
                    }`}
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
                    />
                    <StudentEditDialog student={student} branches={branches} />
                    <DeleteButton id={student.id} deleteAction={deleteUser} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
