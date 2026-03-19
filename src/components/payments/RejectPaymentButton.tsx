"use client";

import { useState, useTransition } from "react";
import { rejectManualPayment } from "@/actions/manual-payment-actions";
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
import { Button } from "@/components/ui/button";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function RejectPaymentButton({
  paymentId,
}: {
  paymentId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleReject = () => {
    startTransition(async () => {
      const res = await rejectManualPayment(paymentId);
      if (res.success) {
        toast.success(res.message);
        setOpen(false); // Close the dialog on success
      } else {
        toast.error(res.message);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {/* 1. The Trigger Button (The Trash Icon) */}
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="destructive"
          className="bg-red-900/20 text-red-500 border border-red-900 hover:bg-red-600 hover:text-white transition-colors h-9 w-9 p-0"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      {/* 2. The Popup Content */}
      <AlertDialogContent className="bg-black border border-slate-800 text-white shadow-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 text-red-500 mb-2">
            <AlertTriangle className="h-5 w-5" />
            <AlertDialogTitle>Reject & Delete Payment?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-slate-400 text-sm">
            This action will permanently delete this payment record and the
            associated bank receipt from our storage. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
            Cancel
          </AlertDialogCancel>

          <Button
            onClick={(e) => {
              e.preventDefault(); // Stop dialog from closing instantly
              handleReject();
            }}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Reject Payment"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
