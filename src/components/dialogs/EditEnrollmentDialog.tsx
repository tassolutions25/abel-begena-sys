"use client";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { updateEnrollment } from "@/actions/academic-actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const DAYS = [
  { id: "MONDAY", label: "Monday" },
  { id: "TUESDAY", label: "Tuesday" },
  { id: "WEDNESDAY", label: "Wednesday" },
  { id: "THURSDAY", label: "Thursday" },
  { id: "FRIDAY", label: "Friday" },
  { id: "SATURDAY", label: "Saturday" },
  { id: "SUNDAY", label: "Sunday" },
];

export default function EditEnrollmentDialog({
  enrollment,
  shifts,
}: {
  enrollment: any;
  shifts: any[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(updateEnrollment, null);

  // Initialize state
  const [program, setProgram] = useState(enrollment.programType);
  const [selectedDays, setSelectedDays] = useState<string[]>(
    enrollment.selectedDays
  );

  const requiredDays =
    program === "THREE_MONTHS" ? 5 : program === "SIX_MONTHS" ? 3 : 2;

  // 1. FIX: Sync state when the 'enrollment' prop updates (after a save)
  useEffect(() => {
    setProgram(enrollment.programType);
    setSelectedDays(enrollment.selectedDays);
  }, [enrollment]);

  // 2. Handle Server Action success
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  const handleDayToggle = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-slate-800 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Enrollment: {enrollment.course.name}</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="enrollmentId" value={enrollment.id} />

          <div className="space-y-2">
            <Label>Time Shift</Label>
            <Select name="shiftId" defaultValue={enrollment.shiftId}>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {shifts.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} ({s.startTime})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Program Duration</Label>
            <Select
              name="programType"
              value={program}
              onValueChange={setProgram}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                <SelectItem value="THREE_MONTHS">3 Months (5 Days)</SelectItem>
                <SelectItem value="SIX_MONTHS">6 Months (3 Days)</SelectItem>
                <SelectItem value="NINE_MONTHS">9 Months (2 Days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <Label>Select Days</Label>
              <span
                className={`text-xs ${
                  selectedDays.length === requiredDays
                    ? "text-green-500"
                    : "text-amber-500"
                }`}
              >
                Selected: {selectedDays.length} / {requiredDays}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {DAYS.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="days"
                    value={day.id}
                    checked={selectedDays.includes(day.id)}
                    className="hidden"
                    readOnly
                  />
                  <Checkbox
                    id={`edit-${enrollment.id}-${day.id}`} // Unique ID fix
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                    className="border-slate-600 data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={`edit-${enrollment.id}-${day.id}`}
                    className="text-sm cursor-pointer text-slate-300"
                  >
                    {day.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-black font-bold mt-4"
            disabled={isPending || selectedDays.length !== requiredDays}
          >
            {isPending ? "Updating..." : "Update Enrollment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
