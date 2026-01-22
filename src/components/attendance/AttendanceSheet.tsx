"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { submitAttendance } from "@/actions/attendance-actions";

type StudentRow = {
  enrollmentId: string;
  studentName: string;
  currentStatus?: string;
};

export default function AttendanceSheet({
  students,
  date,
}: {
  students: StudentRow[];
  date: string;
}) {
  // Store status: { "enrollmentId": "PRESENT" | "ABSENT" }
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const togglePresence = (id: string, checked: boolean) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: checked ? "PRESENT" : "ABSENT",
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    // Merge defaults (ABSENT) if not clicked, or use existing
    const payload: Record<string, string> = {};
    students.forEach((s) => {
      // If user changed it, use that. If not, use 'ABSENT' default or previous DB value
      payload[s.enrollmentId] =
        statuses[s.enrollmentId] || s.currentStatus || "ABSENT";
    });

    const res = await submitAttendance(date, payload);
    if (res.success) toast.success("Attendance Recorded");
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="rounded border border-slate-800 bg-black">
        {students.map((s) => {
          const isPresent =
            statuses[s.enrollmentId] === "PRESENT" ||
            (!statuses[s.enrollmentId] && s.currentStatus === "PRESENT");

          return (
            <div
              key={s.enrollmentId}
              className="flex items-center justify-between p-4 border-b border-slate-900 last:border-0 hover:bg-slate-900/50 transition"
            >
              <span className="text-white font-medium">{s.studentName}</span>
              <div className="flex items-center gap-2">
                <label
                  className={`text-sm ${
                    isPresent ? "text-green-500" : "text-slate-500"
                  }`}
                >
                  {isPresent ? "Present" : "Absent"}
                </label>
                <Checkbox
                  checked={isPresent}
                  onCheckedChange={(c) =>
                    togglePresence(s.enrollmentId, c as boolean)
                  }
                  className="border-slate-600 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
              </div>
            </div>
          );
        })}
        {students.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            No students enrolled in this shift.
          </div>
        )}
      </div>
      <Button
        onClick={handleSave}
        disabled={loading}
        className="w-full bg-primary text-black font-bold"
      >
        {loading ? "Saving..." : "Save Attendance"}
      </Button>
    </div>
  );
}
