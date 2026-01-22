// Allows admin to set 10:00 manually if teacher forgot.
"use client";
import { useActionState, useEffect } from "react";
import { adminUpdateAttendance } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function EditAttendanceLogForm({
  log,
  onSuccess,
}: {
  log: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(
    adminUpdateAttendance,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  // Helper to extract HH:MM from Date object for input[type="time"]
  const formatTime = (date?: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <form action={action} className="space-y-4 mt-2">
      <input type="hidden" name="id" value={log.id} />

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Clock In Time</Label>
          <Input
            name="checkIn"
            type="time"
            defaultValue={formatTime(log.checkIn)}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Clock Out Time</Label>
          <Input
            name="checkOut"
            type="time"
            defaultValue={formatTime(log.checkOut)}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>

      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        Update Log
      </Button>
    </form>
  );
}
