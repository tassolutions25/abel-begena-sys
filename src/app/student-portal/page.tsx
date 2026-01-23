import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, CreditCard, User } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import InitiatePaymentBtn from "@/components/payments/InitiatePayment";

export default async function StudentPortal() {
  // 1. Check Session
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // 2. Fetch Student Data (Classes & Prices)
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        include: { course: true, shift: true }, // Get Course Price
        where: { active: true },
      },
      paymentsMade: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!student) redirect("/login");

  return (
    <div className="min-h-screen bg-black p-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
            <User className="h-6 w-6 text-black" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">
              Hello, {student.fullName}
            </h1>
            <p className="text-slate-400 text-sm">Student Portal</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 text-slate-400"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </form>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* SECTION 1: PAYMENTS DUE */}
        <Card className="bg-slate-900 border-slate-800 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-white">Tuition Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.enrollments.length === 0 ? (
              <p className="text-slate-500">
                You are not enrolled in any classes.
              </p>
            ) : (
              student.enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex justify-between items-center p-3 bg-black rounded border border-slate-800"
                >
                  <div>
                    <p className="text-white font-bold">
                      {enrollment.course.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {enrollment.shift.name}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-white font-mono">
                      {enrollment.course.monthlyPrice} ETB
                    </span>
                    {/* This Button handles the Chapa Logic */}
                    <InitiatePaymentBtn
                      studentId={student.id}
                      amount={enrollment.course.monthlyPrice}
                      reason={`Tuition: ${enrollment.course.name}`}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* SECTION 2: PAYMENT HISTORY */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {student.paymentsMade.map((pay) => (
                <div
                  key={pay.id}
                  className="flex justify-between text-sm border-b border-slate-800 pb-2"
                >
                  <span className="text-slate-300">{pay.reason}</span>
                  <div className="flex gap-3">
                    <span className="text-white">{pay.amount} ETB</span>
                    <span
                      className={
                        pay.status === "SUCCESS"
                          ? "text-green-500"
                          : pay.status === "PENDING"
                            ? "text-amber-500"
                            : "text-red-500"
                      }
                    >
                      {pay.status}
                    </span>
                  </div>
                </div>
              ))}
              {student.paymentsMade.length === 0 && (
                <p className="text-slate-500 text-sm">No payments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
