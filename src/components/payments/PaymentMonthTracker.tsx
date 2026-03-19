"use client";

import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function PaymentMonthTracker({ payments }: { payments: any[] }) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4">
      <h4 className="text-white text-sm font-bold mb-4 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-primary" />
        Payment Tracking ({currentYear})
      </h4>

      <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
        {MONTHS.map((name, i) => {
          const monthNum = i + 1;
          const record = payments.find(
            (p) => p.month === monthNum && p.year === currentYear,
          );

          let statusColor = "border-slate-800 text-slate-600 bg-black/20";
          let Icon = null;

          if (record?.status === "SUCCESS") {
            statusColor = "border-green-900 text-green-500 bg-green-900/10";
            Icon = <CheckCircle2 className="h-3 w-3" />;
          } else if (record?.status === "PENDING") {
            statusColor = "border-amber-900 text-amber-500 bg-amber-900/10";
            Icon = <Clock className="h-3 w-3" />;
          }

          return (
            <div
              key={name}
              className={`flex flex-col items-center justify-center py-2 rounded border text-[10px] font-bold ${statusColor}`}
            >
              <span>{name.toUpperCase()}</span>
              <div className="mt-1">
                {Icon || <AlertCircle className="h-3 w-3 opacity-20" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex gap-4 text-[10px]">
        <div className="flex items-center gap-1 text-green-500">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div> Paid
        </div>
        <div className="flex items-center gap-1 text-amber-500">
          <div className="w-2 h-2 bg-amber-500 rounded-full"></div> Pending
          Approval
        </div>
        <div className="flex items-center gap-1 text-slate-500">
          <div className="w-2 h-2 bg-slate-800 rounded-full"></div> Unpaid
        </div>
      </div>
    </div>
  );
}
