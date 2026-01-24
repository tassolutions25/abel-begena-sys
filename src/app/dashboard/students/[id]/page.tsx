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

  // 1. Fetch Student Info with all relations
  const student = await prisma.user.findUnique({
    where: { id },
    include: {
      branch: true,
      enrollments: {
        include: {
          course: true,
          shift: true,
          pricingPlan: true, // <--- Get the Plan
        },
        orderBy: { course: { name: "asc" } },
      },
    },
  });

  if (!student) return notFound();

  // 2. Fetch Shifts & Plans (Needed for the edit dropdowns)
  const shifts = await prisma.shift.findMany();
  const plans = await prisma.pricingPlan.findMany();

  // 3. Helper to find specific price from the junction table
  const getDynamicPrice = async (courseId: string, planId: string | null) => {
    if (!planId) return 0;
    const priceRecord = await prisma.coursePrice.findUnique({
      where: { courseId_pricingPlanId: { courseId, pricingPlanId: planId } },
    });
    return priceRecord?.amount || 0;
  };

  // 4. Pre-process Enrollments (Fix for Async/Await in JSX)
  // We calculate the price for every enrollment BEFORE rendering
  const enrichedEnrollments = await Promise.all(
    student.enrollments.map(async (enrollment) => {
      const price = await getDynamicPrice(
        enrollment.courseId,
        enrollment.pricingPlanId,
      );
      return { ...enrollment, currentPrice: price };
    }),
  );

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
            {enrichedEnrollments.length === 0 ? (
              <p className="text-slate-500">
                Student is not enrolled in any classes yet.
              </p>
            ) : (
              <div className="space-y-3">
                {enrichedEnrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="flex flex-col gap-2 p-4 bg-slate-900 rounded border border-slate-800"
                  >
                    {/* Top Row: Course Name & Actions */}
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
                        <EditEnrollmentDialog
                          enrollment={enrollment}
                          shifts={shifts}
                          plans={plans}
                        />
                        <DeleteButton
                          id={enrollment.id}
                          deleteAction={deleteEnrollment}
                        />
                      </div>
                    </div>

                    {/* Middle Row: Plan Details & Schedule */}
                    <div className="mt-2 pt-2 border-t border-slate-800 text-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-500">Plan:</span>
                        <span className="text-white font-medium">
                          {enrollment.pricingPlan?.name || "No Plan Selected"}
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

                    {/* Bottom Row: Payment */}
                    <div className="mt-4 border-t border-slate-800 pt-3 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-slate-500">Monthly Tuition:</span>
                        <span className="text-white font-bold ml-2">
                          {enrollment.currentPrice > 0
                            ? `${enrollment.currentPrice} ETB`
                            : "Price Not Set"}
                        </span>
                      </div>

                      {enrollment.currentPrice > 0 ? (
                        <InitiatePaymentBtn
                          studentId={student.id}
                          amount={enrollment.currentPrice}
                          reason={`Tuition: ${enrollment.course.name}`}
                        />
                      ) : (
                        <span className="text-xs text-red-500 bg-red-900/10 px-2 py-1 rounded border border-red-900">
                          Set Price in Settings
                        </span>
                      )}
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
