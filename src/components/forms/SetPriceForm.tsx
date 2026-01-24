"use client";

import { useActionState, useEffect } from "react";
import { setCoursePrice } from "@/actions/pricing-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type Props = {
  courseId: string;
  planId: string;
  currentPrice: number;
};

export default function SetPriceForm({
  courseId,
  planId,
  currentPrice,
}: Props) {
  const [state, action, isPending] = useActionState(setCoursePrice, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action} className="flex items-center">
      <input type="hidden" name="courseId" value={courseId} />
      <input type="hidden" name="planId" value={planId} />

      <div className="relative">
        <input
          name="amount"
          type="number"
          step="any"
          defaultValue={currentPrice}
          placeholder="0"
          className="w-24 bg-black border border-slate-700 text-white text-right pr-2 rounded h-8 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-sm"
        />
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        variant="ghost"
        className="h-8 w-8 p-0 text-green-500 hover:text-green-400 hover:bg-green-900/20 ml-1"
      >
        {isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <span>✓</span>
        )}
      </Button>
    </form>
  );
}
