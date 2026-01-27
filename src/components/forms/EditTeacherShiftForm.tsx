"use client";
import { useActionState, useEffect, useState } from "react";
import { updateTeacherShift } from "@/actions/teacher-actions";
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

export default function EditTeacherShiftForm({
  shift,
  onSuccess,
}: {
  shift: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateTeacherShift, null);

  // Manage checkboxes state manually to handle pre-filling
  const [selectedDays, setSelectedDays] = useState<string[]>(
    shift.workDays || [],
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  return (
    <form action={action} className="space-y-4 mt-2">
      <input type="hidden" name="id" value={shift.id} />

      <div className="space-y-2">
        <Label>Shift Name</Label>
        <Input
          name="name"
          defaultValue={shift.name}
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
            defaultValue={shift.startTime}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="w-1/2 space-y-2">
          <Label>End Time</Label>
          <Input
            name="endTime"
            type="time"
            defaultValue={shift.endTime}
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
              {/* Hidden input to ensure value is submitted */}
              <input
                type="checkbox"
                name="workDays"
                value={day.id}
                checked={selectedDays.includes(day.id)}
                readOnly
                className="hidden"
              />

              <Checkbox
                id={`edit-${shift.id}-${day.id}`}
                checked={selectedDays.includes(day.id)}
                onCheckedChange={() => toggleDay(day.id)}
                className="border-slate-600 data-[state=checked]:bg-primary"
              />
              <label
                htmlFor={`edit-${shift.id}-${day.id}`}
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
        Save Changes
      </Button>
    </form>
  );
}
