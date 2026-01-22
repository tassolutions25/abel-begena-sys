"use client";
import { useState } from "react";
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
import { useEffect } from "react"; // Import useEffect

export default function EnrollDialog({
  studentId,
  courses,
  shifts,
}: {
  studentId: string;
  courses: any[];
  shifts: any[];
}) {
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(enrollStudent, null);

  // Close dialog on success
  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      setOpen(false);
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

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
      <DialogContent className="bg-black border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Enroll in Class</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4">
          <input type="hidden" name="studentId" value={studentId} />

          <Select name="courseId" required>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Select Class (e.g. Begena)" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Button
            type="submit"
            className="w-full bg-primary text-black"
            disabled={isPending}
          >
            Confirm Enrollment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
