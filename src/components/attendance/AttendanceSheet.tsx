"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { submitAttendance } from "@/actions/attendance-actions"; // Ensure this action exists
import { CheckCheck, Save } from "lucide-react";

type StudentRow = {
  enrollmentId: string;
  studentName: string;
  currentStatus: string; // "PRESENT", "ABSENT", "UNMARKED"
};

export default function AttendanceSheet({
  students,
  date,
}: {
  students: StudentRow[];
  date: string;
}) {
  // Store presence status: { "enrollmentId": true/false }
  // Initialize based on DB data (If DB says PRESENT, set true. If UNMARKED, set true by default for ease)
  const [presenceMap, setPresenceMap] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      students.forEach((s) => {
        // If previously marked PRESENT, check it. If New, assume PRESENT (easier for admins to just uncheck absentees)
        initial[s.enrollmentId] =
          s.currentStatus === "PRESENT" || s.currentStatus === "UNMARKED";
      });
      return initial;
    },
  );

  const [loading, setLoading] = useState(false);

  const toggleOne = (id: string, checked: boolean) => {
    setPresenceMap((prev) => ({ ...prev, [id]: checked }));
  };

  const markAll = (status: boolean) => {
    const newMap: Record<string, boolean> = {};
    students.forEach((s) => (newMap[s.enrollmentId] = status));
    setPresenceMap(newMap);
  };

  const handleSave = async () => {
    setLoading(true);

    // Prepare Payload: { "enrollmentId": "PRESENT" | "ABSENT" }
    const payload: Record<string, string> = {};
    Object.keys(presenceMap).forEach((key) => {
      payload[key] = presenceMap[key] ? "PRESENT" : "ABSENT";
    });

    const res = await submitAttendance(date, payload);

    if (res.success) {
      toast.success("Attendance Record Saved!");
    } else {
      toast.error("Failed to save.");
    }
    setLoading(false);
  };

  if (students.length === 0) {
    return (
      <div className="p-10 text-center bg-slate-900/50 rounded-xl border border-slate-800 text-slate-400">
        No students found for this specific Day, Class, and Shift.
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* BULK ACTIONS */}
      <div className="flex justify-end gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => markAll(true)}
          className="text-green-500 border-slate-700 hover:bg-slate-900"
        >
          Mark All Present
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => markAll(false)}
          className="text-red-500 border-slate-700 hover:bg-slate-900"
        >
          Mark All Absent
        </Button>
      </div>

      {/* STUDENT LIST */}
      <div className="rounded-xl border border-slate-800 bg-black overflow-hidden">
        {students.map((student, index) => (
          <div
            key={student.enrollmentId}
            className="flex items-center justify-between p-4 border-b border-slate-800 last:border-0 hover:bg-slate-900/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-slate-500 font-mono text-sm">
                {(index + 1).toString().padStart(2, "0")}
              </span>
              <span className="text-white font-medium text-lg">
                {student.studentName}
              </span>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-800">
              <label
                htmlFor={student.enrollmentId}
                className={`text-sm font-bold cursor-pointer transition-colors ${presenceMap[student.enrollmentId] ? "text-green-400" : "text-slate-500"}`}
              >
                {presenceMap[student.enrollmentId] ? "PRESENT" : "ABSENT"}
              </label>
              <Checkbox
                id={student.enrollmentId}
                checked={presenceMap[student.enrollmentId]}
                onCheckedChange={(c) =>
                  toggleOne(student.enrollmentId, c as boolean)
                }
                className="h-6 w-6 border-slate-600 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* SAVE BUTTON */}
      <div className="sticky bottom-4">
        <Button
          onClick={handleSave}
          disabled={loading}
          className="w-full h-14 text-lg bg-primary hover:bg-amber-600 text-black font-bold shadow-2xl shadow-primary/20 rounded-xl"
        >
          {loading ? (
            "Saving Records..."
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5" /> Save Attendance
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
