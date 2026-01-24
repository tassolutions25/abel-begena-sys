import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddPricingPlanForm from "@/components/forms/AddPricingPlanForm";
import SetPriceForm from "@/components/forms/SetPriceForm";
import TeacherFinancialForm from "@/components/forms/TeacherFinancialForm";
import AddBankForm from "@/components/forms/AddBankForm"; // <--- Import
import DeleteButton from "@/components/ui/delete-button";
import { deleteBank } from "@/actions/bank-actions";

export default async function PaymentSettings() {
  const plans = await prisma.pricingPlan.findMany({
    orderBy: { duration: "asc" },
  });
  const courses = await prisma.course.findMany({
    include: { prices: true },
    orderBy: { name: "asc" },
  });
  const teachers = await prisma.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { fullName: "asc" },
  });

  // FETCH BANKS
  const banks = await prisma.bank.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Financial Settings</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 1. PLANS */}
        <Card className="bg-black border-slate-800">
          {/* ... (Keep Plan Logic) ... */}
          <CardHeader>
            <CardTitle className="text-white">
              1. Create Pricing Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AddPricingPlanForm />
          </CardContent>
        </Card>

        {/* 4. MANAGE BANKS (NEW) */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Supported Banks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddBankForm />
            <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
              {banks.map((b) => (
                <div
                  key={b.id}
                  className="flex justify-between items-center p-2 bg-slate-900 rounded border border-slate-800 text-sm"
                >
                  <span className="text-white">
                    {b.name}{" "}
                    <span className="text-slate-500 text-xs">
                      (Code: {b.code})
                    </span>
                  </span>
                  <DeleteButton id={b.id} deleteAction={deleteBank} />
                </div>
              ))}
              {banks.length === 0 && (
                <p className="text-slate-500 text-xs">No banks added yet.</p>
              )}
            </div>
            {/* CHEAT SHEET FOR THE USER */}
            <div className="text-[10px] text-slate-500 mt-2 p-2 bg-slate-900/50 rounded">
              <strong>Common Codes:</strong> CBE (9), Awash (1), Dashen (2),
              Abyssinia (3), Hibret (4), Wegagen (5), Nib (6), CBO (12),
              Telebirr (85), M-Pesa (86)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. PRICE MATRIX (Keep as is) */}
      <Card className="bg-black border-slate-800">
        {/* ... (Keep Price Matrix) ... */}
        <CardHeader>
          <CardTitle className="text-white">2. Set Class Prices</CardTitle>
        </CardHeader>
        <CardContent>
          {/* ... (Existing Matrix Code) ... */}
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
                      const price =
                        course.prices.find((cp) => cp.pricingPlanId === plan.id)
                          ?.amount || 0;
                      return (
                        <td key={plan.id} className="px-4 py-3">
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
        </CardContent>
      </Card>

      {/* 3. TEACHER SALARIES */}
      <Card className="bg-black border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">
            3. Teacher Salaries & Banking
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {teachers.map((t) => (
            <div
              key={t.id}
              className="p-4 border border-slate-800 rounded bg-slate-900/30"
            >
              <div className="mb-4">
                <p className="text-white font-bold text-lg">{t.fullName}</p>
                <p className="text-slate-500 text-xs">{t.email}</p>
              </div>
              {/* PASS BANKS TO FORM */}
              <TeacherFinancialForm teacher={t} banks={banks} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
