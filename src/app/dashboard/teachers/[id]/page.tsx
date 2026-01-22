import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, MapPin, Clock, Phone, Mail } from "lucide-react";
import DeleteButton from "@/components/ui/delete-button";
import { deleteUser } from "@/actions/delete-actions";
import { EditTeacherDialog } from "@/components/dialogs/TeacherDialogs";

export default async function TeacherDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch teacher with branch and shift
  const teacher = await prisma.user.findUnique({
    where: { id },
    include: { branch: true, teacherShift: true },
  });

  const branches = await prisma.branch.findMany();
  const shifts = await prisma.teacherShift.findMany();

  if (!teacher) return notFound();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/teachers">
        <Button
          variant="ghost"
          className="text-slate-400 pl-0 hover:text-white hover:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white">{teacher.fullName}</h1>
          <p className="text-slate-400">Teacher Profile</p>
        </div>
        <div className="flex gap-2">
          <EditTeacherDialog
            teacher={teacher}
            branches={branches}
            shifts={shifts}
          />
          <DeleteButton id={teacher.id} deleteAction={deleteUser} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> {teacher.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> {teacher.phone}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Work Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              {teacher.branch?.name || "No Branch"}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              {teacher.teacherShift
                ? `${teacher.teacherShift.name} (${teacher.teacherShift.startTime} - ${teacher.teacherShift.endTime})`
                : "No Shift"}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
