import prisma from "@/lib/prisma";
import {
  EditPriceForm,
  TeacherFinancialForm,
} from "@/components/forms/PaymentSettingsForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PaymentSettings() {
  const courses = await prisma.course.findMany();
  const teachers = await prisma.user.findMany({ where: { role: "TEACHER" } });

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-white">Financial Settings</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* COURSE PRICES */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Class Tuition Fees</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.map((c) => (
              <div
                key={c.id}
                className="p-4 border border-slate-800 rounded bg-slate-900/50"
              >
                <p className="text-primary font-bold mb-2">{c.name}</p>
                <EditPriceForm course={c} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* TEACHER SALARIES */}
        <Card className="bg-black border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Teacher Salaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="p-4 border border-slate-800 rounded bg-slate-900/50"
              >
                <p className="text-white font-bold mb-2">{t.fullName}</p>
                <TeacherFinancialForm teacher={t} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
