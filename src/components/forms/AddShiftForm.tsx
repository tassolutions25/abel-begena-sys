"use client";

import { useActionState, useEffect, useRef } from "react";
import { createShift } from "@/actions/academic-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function AddShiftForm() {
  const [state, action, isPending] = useActionState(createShift, null);
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
    <form ref={formRef} action={action} className="space-y-3">
      <Input
        name="name"
        placeholder="Shift Name (e.g. Early Evening)"
        className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
        required
      />
      <div className="flex gap-2">
        <div className="w-1/2">
          <label className="text-xs text-slate-400 mb-1 block">
            Start Time
          </label>
          <Input
            name="startTime"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="w-1/2">
          <label className="text-xs text-slate-400 mb-1 block">End Time</label>
          <Input
            name="endTime"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full bg-primary text-black font-bold hover:bg-amber-600"
        disabled={isPending}
      >
        {isPending ? "Creating Shift..." : "Add Shift"}
      </Button>
    </form>
  );
}
