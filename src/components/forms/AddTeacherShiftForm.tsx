"use client";
import { useActionState, useEffect } from "react";
import { createTeacherShift } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const DAYS = [
  { id: "MONDAY", label: "Mon" },
  { id: "TUESDAY", label: "Tue" },
  { id: "WEDNESDAY", label: "Wed" },
  { id: "THURSDAY", label: "Thu" },
  { id: "FRIDAY", label: "Fri" },
  { id: "SATURDAY", label: "Sat" },
  { id: "SUNDAY", label: "Sun" },
];

export default function AddTeacherShiftForm() {
  const [state, action, isPending] = useActionState(createTeacherShift, null);

  useEffect(() => {
    if (state?.success) toast.success(state.message);
    else if (state?.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label>Shift Name</Label>
        <Input
          name="name"
          placeholder="e.g. Weekday Regular"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      <div className="flex gap-4">
        <div className="w-1/2 space-y-2">
          <Label>Start Time</Label>
          <Input
            name="startTime"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="w-1/2 space-y-2">
          <Label>End Time</Label>
          <Input
            name="endTime"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label>Working Days</Label>
        <div className="flex flex-wrap gap-4 p-3 border border-slate-800 rounded bg-slate-900/50">
          {DAYS.map((day) => (
            <div key={day.id} className="flex items-center space-x-2">
              <Checkbox
                id={`new-${day.id}`}
                name="workDays"
                value={day.id}
                className="border-slate-600 data-[state=checked]:bg-primary"
              />
              <label
                htmlFor={`new-${day.id}`}
                className="text-sm cursor-pointer text-slate-300"
              >
                {day.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        {isPending ? "Creating..." : "Create Shift"}
      </Button>
    </form>
  );
}
