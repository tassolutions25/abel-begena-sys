"use client";
import { useState } from "react";
import { initiateStudentPayment } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";

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
      window.location.href = res.checkoutUrl; // Redirect to Chapa
    } else {
      alert("Error: " + res.message);
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handlePay}
      disabled={loading}
      size="sm"
      className="bg-green-600 hover:bg-green-700 text-white"
    >
      {loading ? (
        <Loader2 className="animate-spin h-4 w-4" />
      ) : (
        <CreditCard className="mr-2 h-4 w-4" />
      )}
      Pay {amount} ETB
    </Button>
  );
}
