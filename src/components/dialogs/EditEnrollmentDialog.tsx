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
  plans,
}: {
  enrollment: any;
  shifts: any[];
  plans: any[]; // <--- Accept Plans
}) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(updateEnrollment, null);

  // Initialize with existing data
  const [selectedPlanId, setSelectedPlanId] = useState(
    enrollment.pricingPlanId || "",
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(
    enrollment.selectedDays,
  );

  const activePlan = plans.find((p) => p.id === selectedPlanId);
  const requiredDays = activePlan ? activePlan.daysPerWeek : 0;

  useEffect(() => {
    setSelectedPlanId(enrollment.pricingPlanId || "");
    setSelectedDays(enrollment.selectedDays);
  }, [enrollment]);

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
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
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
                <SelectValue />
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
            <Label>Pricing Plan</Label>
            <Select
              name="pricingPlanId"
              value={selectedPlanId}
              onValueChange={setSelectedPlanId}
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {plans.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <Label>Select Days</Label>
              <span
                className={`text-xs ${selectedDays.length === requiredDays ? "text-green-500" : "text-amber-500"}`}
              >
                {requiredDays > 0
                  ? `Selected: ${selectedDays.length} / ${requiredDays}`
                  : "Select a plan"}
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
                    id={`edit-${enrollment.id}-${day.id}`}
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
