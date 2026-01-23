import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const recentPayments = await prisma.payment.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { student: true },
  });

  // Calculate Total Revenue (Success only)
  const revenue = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Financials</h2>
          <p className="text-slate-400">Manage Tuition & Salaries</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/payments/payroll">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 bg-black hover:bg-slate-900"
            >
              <Users className="mr-2 h-4 w-4" /> Payroll
            </Button>
          </Link>
          <Link href="/dashboard/payments/settings">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 bg-black hover:bg-slate-900"
            >
              <Settings className="mr-2 h-4 w-4" /> Settings
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-black border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-400 text-sm">
              Total Revenue (Verified)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {revenue._sum.amount || 0} ETB
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-black border border-slate-800 rounded-lg p-1">
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-white font-bold">Recent Student Payments</h3>
        </div>
        <Table>
          <TableHeader className="bg-slate-900">
            <TableRow className="border-slate-800">
              <TableHead className="text-slate-300">Student</TableHead>
              <TableHead className="text-slate-300">Reason</TableHead>
              <TableHead className="text-slate-300">Amount</TableHead>
              <TableHead className="text-slate-300">Status</TableHead>
              <TableHead className="text-slate-300">Ref</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPayments.map((p) => (
              <TableRow key={p.id} className="border-slate-800">
                <TableCell className="text-white font-medium">
                  {p.student.fullName}
                </TableCell>
                <TableCell className="text-slate-400">{p.reason}</TableCell>
                <TableCell className="text-white">{p.amount} ETB</TableCell>
                <TableCell>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      p.status === "SUCCESS"
                        ? "bg-green-900/30 text-green-400"
                        : p.status === "PENDING"
                          ? "bg-amber-900/30 text-amber-400"
                          : "bg-red-900/30 text-red-400"
                    }`}
                  >
                    {p.status}
                  </span>
                </TableCell>
                <TableCell className="text-slate-500 text-xs font-mono">
                  {p.txRef}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
