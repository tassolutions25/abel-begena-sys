import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/ui/delete-button";
import { deleteEnrollment } from "@/actions/academic-actions";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      branch: true,
      enrollments: {
        include: { course: true, shift: true },
      },
    },
  });

  if (!student) return notFound();

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/students">
        <Button
          variant="ghost"
          className="text-slate-400 pl-0 hover:text-white hover:bg-transparent"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
        </Button>
      </Link>

      {/* Header Section */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">{student.fullName}</h1>
          <p className="text-slate-500">Student Profile</p>
        </div>
        <span
          className={`px-3 py-1 rounded text-sm ${
            student.isActive
              ? "bg-green-900/30 text-green-400"
              : "bg-red-900/30 text-red-400"
          }`}
        >
          {student.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* LEFT: Personal Info */}
        <Card className="bg-black border-slate-800 md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-white">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-slate-300">
              <Mail className="h-4 w-4 text-primary" />{" "}
              <span>{student.email}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="h-4 w-4 text-primary" />{" "}
              <span>{student.phone || "No Phone"}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-300">
              <MapPin className="h-4 w-4 text-primary" />{" "}
              <span>{student.branch?.name}</span>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Academic Enrollments */}
        <Card className="bg-black border-slate-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white">Academic Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            {student.enrollments.length === 0 ? (
              <p className="text-slate-500">
                Student is not enrolled in any classes yet.
              </p>
            ) : (
              <div className="space-y-3">
                {student.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex items-center justify-between p-4 bg-slate-900 rounded border border-slate-800"
                  >
                    <div>
                      <h4 className="text-lg font-bold text-primary">
                        {enrollment.course.name}
                      </h4>
                      <p className="text-sm text-slate-400">
                        Shift:{" "}
                        <span className="text-white">
                          {enrollment.shift.name}
                        </span>
                        <span className="ml-2 text-slate-500">
                          ({enrollment.shift.startTime} -{" "}
                          {enrollment.shift.endTime})
                        </span>
                      </p>
                    </div>
                    <DeleteButton
                      id={enrollment.id}
                      deleteAction={deleteEnrollment}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
