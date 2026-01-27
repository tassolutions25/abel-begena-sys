import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { logoutAction } from "@/actions/auth-actions";
import InitiatePaymentBtn from "@/components/payments/InitiatePayment";

// Force dynamic to ensure latest payment status
export const dynamic = "force-dynamic";

export default async function StudentPortal() {
  // 1. Check Session
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // 2. Fetch Student Data with Relations
  const student = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      enrollments: {
        include: {
          course: true,
          shift: true,
          pricingPlan: true, // Get Plan Info
        },
        where: { active: true },
      },
      paymentsMade: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!student) redirect("/login");

  // 3. Helper to Calculate Price (Same logic as Admin side)
  const getDynamicPrice = async (courseId: string, planId: string | null) => {
    if (!planId) return 0;
    const priceRecord = await prisma.coursePrice.findUnique({
      where: { courseId_pricingPlanId: { courseId, pricingPlanId: planId } },
    });
    return priceRecord?.amount || 0;
  };

  // 4. Pre-calculate prices for rendering
  const enrollmentsWithPrice = await Promise.all(
    student.enrollments.map(async (e) => {
      const price = await getDynamicPrice(e.courseId, e.pricingPlanId);
      return { ...e, currentPrice: price };
    }),
  );

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
              Hello, {student.fullName.split(" ")[0]}
            </h1>
            <p className="text-slate-400 text-sm">Student Portal</p>
          </div>
        </div>
        <form action={logoutAction}>
          <Button
            variant="outline"
            size="sm"
            className="border-slate-800 bg-slate-900 text-slate-400 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </form>
      </div>

      <div className="w-full max-w-2xl space-y-6">
        {/* SECTION 1: TUITION FEES (PAYMENT) */}
        <Card className="bg-slate-900 border-slate-800 border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="text-white">Tuition Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollmentsWithPrice.length === 0 ? (
              <p className="text-slate-500">
                You are not enrolled in any classes.
              </p>
            ) : (
              enrollmentsWithPrice.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="flex flex-col gap-3 p-4 bg-black rounded border border-slate-800"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-bold text-lg">
                        {enrollment.course.name}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {enrollment.shift.name} Shift
                      </p>
                      <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded mt-1 inline-block">
                        {enrollment.pricingPlan?.name || "Standard Plan"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-white font-mono text-xl block">
                        {enrollment.currentPrice > 0
                          ? `${enrollment.currentPrice} ETB`
                          : "N/A"}
                      </span>
                      <span className="text-xs text-slate-500">Monthly</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    {enrollment.currentPrice > 0 ? (
                      <InitiatePaymentBtn
                        studentId={student.id}
                        amount={enrollment.currentPrice}
                        reason={`Tuition: ${enrollment.course.name}`}
                      />
                    ) : (
                      <p className="text-xs text-red-500">
                        Contact admin to set price.
                      </p>
                    )}
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
                  className="flex justify-between items-center text-sm border-b border-slate-800 pb-3 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-slate-300">{pay.reason}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(pay.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-white font-medium">
                      {pay.amount} ETB
                    </span>
                    <span
                      className={`text-[10px] uppercase px-2 py-0.5 rounded border ${
                        pay.status === "SUCCESS"
                          ? "text-green-400 border-green-900 bg-green-900/20"
                          : pay.status === "PENDING"
                            ? "text-amber-400 border-amber-900 bg-amber-900/20"
                            : "text-red-400 border-red-900 bg-red-900/20"
                      }`}
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
