import { generateMonthlyPayroll } from "@/actions/payroll-actions";
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
import { CheckCircle, Play, AlertCircle, RefreshCw } from "lucide-react"; // <--- Import RefreshCw
import BulkPayButton from "@/components/payments/BulkPayButton";

export const dynamic = "force-dynamic";

export default async function PayrollPage() {
  const date = new Date();
  const currentMonth = date.getMonth() + 1;
  const currentYear = date.getFullYear();

  // Fetch Payroll for this month
  const payrolls = await prisma.payroll.findMany({
    where: { month: currentMonth, year: currentYear },
    include: { teacher: true },
    orderBy: { teacher: { fullName: "asc" } },
  });

  // Calculate Totals
  const pendingPayrolls = payrolls.filter((p) => p.status === "PENDING");
  const totalAmount = pendingPayrolls.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Teacher Payroll</h2>
          <p className="text-slate-400">
            Month: {currentMonth}/{currentYear}
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-2">
          {payrolls.length === 0 ? (
            // 1. GENERATE BUTTON (If list is empty)
            <form
              action={async () => {
                "use server";
                await generateMonthlyPayroll(currentMonth, currentYear);
              }}
            >
              <Button className="bg-primary text-black font-bold">
                <Play className="mr-2 h-4 w-4" /> Generate List
              </Button>
            </form>
          ) : (
            <>
              {/* 2. REFRESH BUTTON (Always visible if list exists) */}
              <form
                action={async () => {
                  "use server";
                  await generateMonthlyPayroll(currentMonth, currentYear);
                }}
              >
                <Button
                  variant="outline"
                  className="border-slate-700 bg-black text-slate-300 hover:bg-slate-900"
                >
                  <RefreshCw className="mr-2 h-4 w-4" /> Sync / Add New
                </Button>
              </form>

              {/* 3. CONFIRM BUTTON (If there are pending items) */}
              {pendingPayrolls.length > 0 ? (
                <BulkPayButton
                  month={currentMonth}
                  year={currentYear}
                  totalAmount={totalAmount}
                  count={pendingPayrolls.length}
                />
              ) : (
                <Button disabled className="bg-slate-800 text-slate-500">
                  <CheckCircle className="mr-2 h-4 w-4" /> All Paid
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* SUMMARY CARD */}
      {pendingPayrolls.length > 0 && (
        <div className="p-4 bg-amber-900/10 border border-amber-900/50 rounded flex gap-3 items-center text-amber-200">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">
            <strong>Action Required:</strong> Please review the list below.
            Click "Confirm & Pay All" to transfer{" "}
            <strong>{totalAmount} ETB</strong> to{" "}
            <strong>{pendingPayrolls.length} teachers</strong>.
          </p>
        </div>
      )}

      {/* TABLE (Keep as is) */}
      <div className="bg-black border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow>
              <TableHead className="text-slate-300">Teacher</TableHead>
              <TableHead className="text-slate-300">Bank Details</TableHead>
              <TableHead className="text-slate-300">Salary</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-300">
                Transfer Ref
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
                  <div className="flex flex-col">
                    <span className="text-white">
                      {p.teacher.bankName || "No Bank Set"}
                    </span>
                    <span className="text-xs">
                      {p.teacher.bankAccountNumber || "Missing Account"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-white">{p.amount} ETB</TableCell>
                <TableCell>
                  {p.status === "PROCESSED" ? (
                    <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-xs border border-green-900">
                      Paid
                    </span>
                  ) : (
                    <span className="text-amber-500 bg-amber-900/20 px-2 py-1 rounded text-xs border border-amber-900">
                      Pending
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right text-xs font-mono text-slate-500">
                  {p.transferRef || "-"}
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
