"use client";
import { useActionState } from "react";
import { createTeacherShift } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useEffect } from "react";

export default function AddTeacherShiftForm() {
  const [state, action, isPending] = useActionState(createTeacherShift, null);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <Input
        name="name"
        placeholder="Shift Name (e.g. Full Time)"
        className="bg-slate-900 border-slate-700 text-white"
        required
      />
      <div className="flex gap-2">
        <Input
          name="startTime"
          type="time"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
        <Input
          name="endTime"
          type="time"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        Add Shift
      </Button>
    </form>
  );
}
