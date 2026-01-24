"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPricingPlan } from "@/actions/pricing-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddPricingPlanForm() {
  const [state, action, isPending] = useActionState(createPricingPlan, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-wrap gap-4 items-end"
    >
      <div className="space-y-1">
        <Label className="text-xs text-slate-400">Plan Name</Label>
        <Input
          name="name"
          placeholder="e.g. Regular 3 Months"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <div className="space-y-1 w-24">
        <Label className="text-xs text-slate-400">Months</Label>
        <Input
          name="duration"
          type="number"
          placeholder="3"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <div className="space-y-1 w-24">
        <Label className="text-xs text-slate-400">Days/Wk</Label>
        <Input
          name="days"
          type="number"
          placeholder="3"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-primary text-black font-bold"
      >
        {isPending ? "Adding..." : "Add Plan"}
      </Button>
    </form>
  );
}
