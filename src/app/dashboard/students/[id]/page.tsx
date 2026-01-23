import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/ui/delete-button";
import { deleteEnrollment } from "@/actions/academic-actions";
import EditEnrollmentDialog from "@/components/dialogs/EditEnrollmentDialog";
import InitiatePaymentBtn from "@/components/payments/InitiatePayment";

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1. Fetch Student Info
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      branch: true,
      enrollments: {
        include: { course: true, shift: true },
        orderBy: { course: { name: "asc" } },
      },
    },
  });

  // 2. Fetch Shifts (Needed for the edit dropdown)
  const shifts = await prisma.shift.findMany();

  if (!student) return notFound();

  return (
    <div className="space-y-6">
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
            {/* FIXED: Phone Number Display */}
            <div className="flex items-center gap-3 text-slate-300">
              <Phone className="h-4 w-4 text-primary" />
              <span>{student.phone || "No Phone Recorded"}</span>
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
                    className="flex flex-col gap-2 p-4 bg-slate-900 rounded border border-slate-800"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-lg font-bold text-primary">
                          {enrollment.course.name}
                        </h4>
                        <div className="text-sm text-slate-400 mt-1">
                          <span className="text-white font-medium">
                            {enrollment.shift.name}
                          </span>
                          <span>
                            {" "}
                            ({enrollment.shift.startTime} -{" "}
                            {enrollment.shift.endTime})
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {/* NEW: Edit Button */}
                        <EditEnrollmentDialog
                          enrollment={enrollment}
                          shifts={shifts}
                        />
                        {/* Delete Button */}
                        <DeleteButton
                          id={enrollment.id}
                          deleteAction={deleteEnrollment}
                        />
                      </div>
                    </div>

                    {/* Program Details */}
                    <div className="mt-2 pt-2 border-t border-slate-800 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-500">Program:</span>
                        <span className="text-white">
                          {enrollment.programType === "THREE_MONTHS"
                            ? "3 Months"
                            : enrollment.programType === "SIX_MONTHS"
                              ? "6 Months"
                              : "9 Months"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-1">
                          Schedule:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {enrollment.selectedDays.map((day: string) => (
                            <span
                              key={day}
                              className="text-xs bg-black border border-slate-700 px-2 py-1 rounded text-slate-300 capitalize"
                            >
                              {day.toLowerCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 border-t border-slate-800 pt-3 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-slate-500">Tuition:</span>
                        <span className="text-white font-bold ml-2">
                          {enrollment.course.monthlyPrice} ETB
                        </span>
                      </div>
                      <InitiatePaymentBtn
                        studentId={student.id}
                        amount={enrollment.course.monthlyPrice}
                        reason={`Tuition: ${enrollment.course.name}`}
                      />
                    </div>
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
