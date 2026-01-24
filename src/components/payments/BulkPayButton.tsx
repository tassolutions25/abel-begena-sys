"use client";

import { useState } from "react";
import { processBulkPayroll } from "@/actions/payroll-actions";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function BulkPayButton({
  month,
  year,
  totalAmount,
  count,
}: any) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const res = await processBulkPayroll(month, year);

    if (res.success) {
      toast.success(res.message);
      setOpen(false);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700 text-white font-bold">
          <Send className="mr-2 h-4 w-4" /> Confirm & Pay All
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-black border border-slate-800 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Bulk Salary Transfer</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            You are about to instruct the system to send{" "}
            <span className="text-white font-bold">{totalAmount} ETB</span> to{" "}
            <span className="text-white font-bold">{count} Teachers</span>.
            <br />
            <br />
            This action interacts with the Bank/Chapa API and cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="bg-slate-900 border-slate-700 text-white">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handlePay();
            }}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm Transfer"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
