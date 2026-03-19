"use client";

import { useState, useTransition, useRef } from "react";
import { submitManualPayment } from "@/actions/manual-payment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ManualPaymentForm({
  studentId,
  planName,
  monthlyPrice,
  existingPayments,
}: any) {
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const toggleMonth = (index: number) => {
    setSelectedMonths((prev) =>
      prev.includes(index + 1)
        ? prev.filter((m) => m !== index + 1)
        : [...prev, index + 1],
    );
  };

  async function handleFormSubmit(formData: FormData) {
    // 1. Guard Clause: Prevent running if already loading
    if (isPending) return;

    if (selectedMonths.length === 0) {
      toast.error("Please select at least one month.");
      return;
    }

    // 2. Wrap in startTransition to manage "isPending" state automatically
    startTransition(async () => {
      formData.append("studentId", studentId);
      formData.append("months", JSON.stringify(selectedMonths));
      formData.append(
        "amount",
        (monthlyPrice * selectedMonths.length).toString(),
      );
      formData.append("year", new Date().getFullYear().toString());
      formData.append("planName", planName);

      const res = await submitManualPayment(formData);

      if (res.success) {
        toast.success(res.message);
        setSelectedMonths([]); // Clear selection
        formRef.current?.reset(); // Clear file input
      } else {
        toast.error(res.message);
      }
    });
  }

  const isMonthDisabled = (monthNum: number) => {
    return existingPayments.some(
      (p: any) =>
        p.month === monthNum &&
        p.year === new Date().getFullYear() &&
        (p.status === "SUCCESS" || p.status === "PENDING"),
    );
  };

  const getMonthStatus = (monthNum: number) => {
    const record = existingPayments.find(
      (p: any) => p.month === monthNum && p.year === new Date().getFullYear(),
    );
    return record?.status; // Returns "SUCCESS", "PENDING", or undefined
  };

  const hasDisabledMonths = MONTHS.some((_, i) => getMonthStatus(i + 1));

  return (
    <form
      ref={formRef}
      action={handleFormSubmit}
      className="space-y-4 p-4 bg-black border border-slate-800 rounded-lg"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-bold text-sm">Manual Bank Transfer</h3>
        {hasDisabledMonths && (
          <span className="text-[9px] text-amber-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Some months are locked
          </span>
        )}
      </div>

      {/* Months Grid */}
      <div className="grid grid-cols-3 gap-2">
        {/* {MONTHS.map((m, i) => (
          <div
            key={m}
            className={`flex items-center space-x-2 p-2 rounded border transition-colors ${
              selectedMonths.includes(i + 1)
                ? "bg-primary/10 border-primary/40"
                : "bg-slate-900 border-slate-800"
            }`}
          >
            <Checkbox
              id={`m-${i}`}
              checked={selectedMonths.includes(i + 1)}
              onCheckedChange={() => toggleMonth(i)}
              disabled={isPending} // Disable while uploading
            />
            <Label
              htmlFor={`m-${i}`}
              className="text-[10px] text-slate-300 cursor-pointer"
            >
              {m}
            </Label>
          </div>
        ))} */}

        {MONTHS.map((m, i) => {
          const status = getMonthStatus(i + 1);
          const isDisabled = status === "SUCCESS" || status === "PENDING";

          return (
            <div
              key={m}
              className={`flex items-center space-x-2 p-2 rounded border transition-all ${
                isDisabled
                  ? "bg-slate-900/20 border-slate-900 opacity-40"
                  : selectedMonths.includes(i + 1)
                    ? "bg-primary/10 border-primary/40"
                    : "bg-slate-900 border-slate-800 hover:border-slate-700"
              }`}
            >
              <Checkbox
                id={`m-${i}`}
                checked={selectedMonths.includes(i + 1)}
                onCheckedChange={() => toggleMonth(i)}
                disabled={isPending || isDisabled}
              />
              <div className="flex flex-col">
                <Label
                  htmlFor={`m-${i}`}
                  className={`text-[10px] font-medium cursor-pointer ${isDisabled ? "cursor-not-allowed" : ""}`}
                >
                  {m}
                </Label>
                {status === "SUCCESS" && (
                  <span className="text-[8px] text-green-500 font-bold">
                    PAID
                  </span>
                )}
                {status === "PENDING" && (
                  <span className="text-[8px] text-amber-500 font-bold">
                    PENDING
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning Text */}
      {selectedMonths.some((m) => getMonthStatus(m)) && (
        <div className="bg-red-900/20 border border-red-900 p-2 rounded text-[10px] text-red-400">
          Warning: One or more selected months already have a submission.
        </div>
      )}

      {/* File Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <Label className="text-slate-400 text-xs italic">
            Upload Payslip (JPG/PDF)
          </Label>
          <span className="text-white font-bold text-xs">
            Total: {monthlyPrice * selectedMonths.length} ETB
          </span>
        </div>
        <Input
          name="receipt"
          type="file"
          accept="image/*,application/pdf"
          className="bg-slate-900 border-slate-700 text-white text-xs"
          required
          disabled={isPending}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending || selectedMonths.length === 0}
        className={`w-full font-bold transition-all ${
          isPending
            ? "bg-slate-700 text-slate-400"
            : "bg-slate-200 text-black hover:bg-white"
        }`}
      >
        {isPending ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Uploading Receipt...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Submit Payment for Approval</span>
          </div>
        )}
      </Button>

      <p className="text-[10px] text-slate-500 text-center">
        Our admin will verify the transfer within 24 hours.
      </p>
    </form>
  );
}
