"use client";
import { useActionState, useEffect } from "react";
import { updateCourse, updateShift } from "@/actions/academic-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function EditCourseForm({
  course,
  onSuccess,
}: {
  course: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateCourse, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-3 mt-4">
      <input type="hidden" name="id" value={course.id} />
      <Input
        name="name"
        defaultValue={course.name}
        className="bg-slate-900 border-slate-700 text-white"
        required
      />
      <Button disabled={isPending} className="w-full bg-primary text-black">
        Save Changes
      </Button>
    </form>
  );
}

export function EditShiftForm({
  shift,
  onSuccess,
}: {
  shift: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateShift, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-3 mt-4">
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
      <Button disabled={isPending} className="w-full bg-primary text-black">
        Save Changes
      </Button>
    </form>
  );
}
