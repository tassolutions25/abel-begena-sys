"use client";
import { useActionState, useEffect } from "react";
import { updateTeacherShift } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditTeacherShiftForm({
  shift,
  onSuccess,
}: {
  shift: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateTeacherShift, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4 mt-4">
      <input type="hidden" name="id" value={shift.id} />
      <Input
        name="name"
        defaultValue={shift.name}
        className="bg-slate-900 border-slate-700 text-white"
        required
      />
      <div className="flex gap-2">
        <Input
          name="startTime"
          type="time"
          defaultValue={shift.startTime}
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
        <Input
          name="endTime"
          type="time"
          defaultValue={shift.endTime}
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>
      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        Save Changes
      </Button>
    </form>
  );
}
