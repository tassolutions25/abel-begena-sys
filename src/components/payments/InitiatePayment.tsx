"use client";
import { useState } from "react";
import { initiateStudentPayment } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner"; // Using Sonner for better alerts

export default function InitiatePaymentBtn({ studentId, amount, reason }: any) {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    const date = new Date();

    const res = await initiateStudentPayment(
      studentId,
      amount,
      date.getMonth() + 1,
      date.getFullYear(),
      reason,
    );

    if (res.success && res.checkoutUrl) {
      // Redirect to Chapa
      window.location.href = res.checkoutUrl;
    } else {
      // Show error cleanly
      console.error("Payment Error:", res.message);
      toast.error(res.message || "Payment initialization failed.");
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white font-bold"
    >
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <span>Pay {amount} ETB</span>
        </div>
      )}
    </Button>
  );
}
