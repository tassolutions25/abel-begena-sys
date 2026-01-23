import { verifyPaymentAction } from "@/actions/payment-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function VerifyPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref: string }>;
}) {
  const { tx_ref } = await searchParams;

  const result = await verifyPaymentAction(tx_ref);

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900">
        <CardHeader className="text-center">
          {result.success ? (
            <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          )}
          <CardTitle className="text-white text-xl">
            {result.success ? "Payment Successful" : "Payment Failed"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-slate-400">{result.message}</p>
          <p className="text-xs text-slate-500 font-mono">Ref: {tx_ref}</p>
          <Link href="/dashboard/payments">
            <Button className="w-full bg-primary text-black font-bold">
              Return to Dashboard
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
