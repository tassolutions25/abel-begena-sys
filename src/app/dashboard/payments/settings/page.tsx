import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddPricingPlanForm from "@/components/forms/AddPricingPlanForm";
import SetPriceForm from "@/components/forms/SetPriceForm"; // <--- IMPORT THIS

export default async function PaymentSettings() {
  const plans = await prisma.pricingPlan.findMany({
    orderBy: { duration: "asc" },
  });
  const courses = await prisma.course.findMany({
    include: { prices: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Financial Settings</h2>

      {/* 1. CREATE PLANS */}
      <Card className="bg-black border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">1. Create Pricing Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <AddPricingPlanForm />

          <div className="mt-4 flex gap-2 flex-wrap">
            {plans.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900 px-3 py-1 rounded border border-slate-800 text-sm text-slate-300"
              >
                {p.name} ({p.duration} Mo, {p.daysPerWeek} Days)
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2. PRICE MATRIX */}
      <Card className="bg-black border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            2. Set Class Prices (Monthly Fee)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <p className="text-slate-500">Create a plan above first.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-slate-400 uppercase bg-slate-900">
                  <tr>
                    <th className="px-4 py-3">Class Name</th>
                    {plans.map((p) => (
                      <th key={p.id} className="px-4 py-3">
                        {p.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-slate-800">
                      <td className="px-4 py-3 font-medium text-white">
                        {course.name}
                      </td>
                      {plans.map((plan) => {
                        // Find existing price
                        const price =
                          course.prices.find(
                            (cp) => cp.pricingPlanId === plan.id,
                          )?.amount || 0;

                        return (
                          <td key={plan.id} className="px-4 py-3">
                            {/* USE THE NEW COMPONENT HERE */}
                            <SetPriceForm
                              courseId={course.id}
                              planId={plan.id}
                              currentPrice={price}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
