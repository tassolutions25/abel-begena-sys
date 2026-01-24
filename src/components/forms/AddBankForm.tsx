"use client";
import { useActionState, useEffect, useRef } from "react";
import { createBank } from "@/actions/bank-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AddBankForm() {
  const [state, action, isPending] = useActionState(createBank, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={action} className="flex gap-2 items-end">
      <div className="space-y-1 w-full">
        <Label className="text-xs text-slate-400">Bank Name</Label>
        <Input
          name="name"
          placeholder="e.g. CBE"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <div className="space-y-1 w-24 shrink-0">
        <Label className="text-xs text-slate-400">Bank Code</Label>
        <Input
          name="code"
          placeholder="e.g. 9"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <Button disabled={isPending} className="bg-primary text-black font-bold">
        Add
      </Button>
    </form>
  );
}
