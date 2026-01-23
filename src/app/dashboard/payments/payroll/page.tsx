import {
  generateMonthlyPayroll,
  processTeacherPayment,
} from "@/actions/payment-actions";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, Play } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  // Fetch Payroll for this month
  const payrolls = await prisma.payroll.findMany({
    where: { month: currentMonth, year: currentYear },
    include: { teacher: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Teacher Payroll</h2>
          <p className="text-slate-400">
            Month: {currentMonth}/{currentYear}
          </p>
        </div>

        {/* GENERATOR BUTTON (Simulates "System pays by itself") */}
        <form
          action={async () => {
            "use server";
            await generateMonthlyPayroll(currentMonth, currentYear);
          }}
        >
          <Button className="bg-primary text-black font-bold">
            <Play className="mr-2 h-4 w-4" /> Run Monthly Payroll
          </Button>
        </form>
      </div>

      <div className="bg-black border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow>
              <TableHead className="text-slate-300">Teacher</TableHead>
              <TableHead className="text-slate-300">Bank Details</TableHead>
              <TableHead className="text-slate-300">Salary</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-300">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payrolls.map((p) => (
              <TableRow key={p.id} className="border-slate-800">
                <TableCell className="text-white font-medium">
                  {p.teacher.fullName}
                </TableCell>
                <TableCell className="text-slate-400 text-sm">
                  {p.teacher.bankName || "N/A"} -{" "}
                  {p.teacher.bankAccountNumber || "N/A"}
                </TableCell>
                <TableCell className="text-white">{p.amount} ETB</TableCell>
                <TableCell>
                  {p.status === "PROCESSED" ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Paid
                    </span>
                  ) : (
                    <span className="text-amber-500">Pending</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {p.status === "PENDING" && (
                    <form
                      action={async () => {
                        "use server";
                        await processTeacherPayment(p.id);
                      }}
                    >
                      <Button
                        size="sm"
                        className="bg-green-700 hover:bg-green-600 text-white"
                      >
                        Mark Paid
                      </Button>
                    </form>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {payrolls.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-slate-500 py-8"
                >
                  No payroll generated for this month yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
