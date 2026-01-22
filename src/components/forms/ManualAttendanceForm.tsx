"use client";
import { useActionState, useEffect } from "react";
import { adminManualAttendance } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ManualAttendanceForm({
  teachers,
  onSuccess,
}: {
  teachers: any[];
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(
    adminManualAttendance,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    } else if (state?.message) toast.error(state.message);
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label>Select Teacher</Label>
        <Select name="userId" required>
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
            <SelectValue placeholder="Teacher" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            {teachers.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.fullName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Date</Label>
        <Input
          name="date"
          type="date"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Clock In</Label>
          <Input
            name="checkIn"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Clock Out</Label>
          <Input
            name="checkOut"
            type="time"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>

      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        Add Attendance
      </Button>
    </form>
  );
}
