"use client";
import { useState, useEffect } from "react";
import { useActionState } from "react";
import { enrollStudent } from "@/actions/academic-actions";
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
import { BookOpen } from "lucide-react";
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

// 1. Accept 'plans' prop
export default function EnrollDialog({
  studentId,
  courses,
  shifts,
  plans,
}: {
  studentId: string;
  courses: any[];
  shifts: any[];
  plans: any[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(enrollStudent, null);

  // 2. Track Selected Plan ID to know required days
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);

  // Find the full plan object based on ID
  const activePlan = plans.find((p) => p.id === selectedPlanId);
  const requiredDays = activePlan ? activePlan.daysPerWeek : 0;

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
      setSelectedDays([]);
      setSelectedPlanId("");
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
          variant="secondary"
          className="bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600"
        >
          <BookOpen className="h-3 w-3 mr-1" /> Enroll
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-slate-800 text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll in Class</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="studentId" value={studentId} />

          <div className="space-y-2">
            <Label>Class Instrument</Label>
            <Select name="courseId" required>
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Time Shift</Label>
            <Select name="shiftId" required>
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

          {/* 3. DYNAMIC PLAN DROPDOWN */}
          <div className="space-y-2">
            <Label>Pricing Plan</Label>
            <Select
              name="pricingPlanId"
              onValueChange={setSelectedPlanId}
              required
            >
              <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                <SelectValue placeholder="Select Plan" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700 text-white">
                {plans.length === 0 ? (
                  <div className="p-2 text-xs text-slate-500">
                    No plans found. Go to Settings.
                  </div>
                ) : (
                  plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.duration} Months)
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex justify-between items-center">
              <Label>Select Learning Days</Label>
              <span
                className={`text-xs ${selectedDays.length === requiredDays ? "text-green-500" : "text-amber-500"}`}
              >
                {requiredDays > 0
                  ? `Selected: ${selectedDays.length} / ${requiredDays}`
                  : "Select a plan first"}
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
                    id={day.id}
                    checked={selectedDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                    disabled={!activePlan} // Disable if no plan selected
                    className="border-slate-600 data-[state=checked]:bg-primary"
                  />
                  <label
                    htmlFor={day.id}
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
            disabled={
              isPending ||
              (activePlan ? selectedDays.length !== requiredDays : true)
            }
          >
            {isPending ? "Enrolling..." : "Confirm Enrollment"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
