import prisma from "@/lib/prisma";
import {
  approveManualPayment,
  rejectManualPayment,
} from "@/actions/manual-payment-actions";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CheckCircle, ExternalLink, User } from "lucide-react";
import RejectPaymentButton from "@/components/payments/RejectPaymentButton";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const pending = await prisma.payment.findMany({
    where: { method: "MANUAL", status: "PENDING" },
    include: { student: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Payment Approvals</h2>
        <p className="text-slate-400">
          Verify manual bank transfers and receipts.
        </p>
      </div>

      <div className="bg-black border border-slate-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Student</TableHead>
              <TableHead className="text-slate-300">Details</TableHead>
              <TableHead className="text-slate-300">Amount</TableHead>
              <TableHead className="text-slate-300">Receipt</TableHead>
              <TableHead className="text-right text-slate-300">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map((p) => (
              <TableRow key={p.id} className="border-slate-800">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-primary text-xs">
                      {p.student.fullName.charAt(0)}
                    </div>
                    <span className="text-white font-medium">
                      {p.student.fullName}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-white text-sm">{p.reason}</span>
                    <span className="text-xs text-slate-500">
                      Month: {p.month}/{p.year}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-white font-mono">
                  {p.amount} ETB
                </TableCell>
                <TableCell>
                  <a
                    href={p.receiptUrl!}
                    target="_blank"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline bg-primary/10 px-2 py-1 rounded border border-primary/20"
                  >
                    View Slip <ExternalLink className="h-3 w-3" />
                  </a>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* APPROVE BUTTON */}
                    <form
                      action={async () => {
                        "use server";
                        await approveManualPayment([p.id]);
                      }}
                    >
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                      >
                        Approve
                      </Button>
                    </form>

                    {/* REJECT BUTTON */}
                    <RejectPaymentButton paymentId={p.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-20 text-slate-500 border-none"
                >
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>All clear! No pending manual payments to verify.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
