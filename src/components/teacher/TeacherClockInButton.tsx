"use client";
import { useState } from "react";
import { teacherClockIn, teacherClockOut } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fingerprint, LogOut } from "lucide-react";

export default function TeacherActionButtons({
  userId,
  status,
}: {
  userId: string;
  status: "NONE" | "WORKING" | "DONE";
}) {
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    const res = await teacherClockIn(userId);
    if (res.success) toast.success(res.message);
    else {
      toast.error(res.message);
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    const res = await teacherClockOut(userId);
    if (res.success) toast.success(res.message);
    else {
      toast.error(res.message);
      setLoading(false);
    }
  };

  if (status === "DONE") {
    return (
      <div className="w-full p-6 bg-slate-900 rounded-xl border border-slate-700 text-center">
        <h3 className="text-green-500 font-bold text-xl">Shift Complete</h3>
        <p className="text-slate-500">See you tomorrow!</p>
      </div>
    );
  }

  if (status === "WORKING") {
    return (
      <Button
        onClick={handleClockOut}
        disabled={loading}
        className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95"
      >
        {loading ? (
          "Processing..."
        ) : (
          <div className="flex items-center gap-2">
            <LogOut className="h-6 w-6" /> Clock Out
          </div>
        )}
      </Button>
    );
  }

  // Status === NONE
  return (
    <Button
      onClick={handleClockIn}
      disabled={loading}
      className="w-full h-16 text-lg bg-primary hover:bg-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
    >
      {loading ? (
        "Processing..."
      ) : (
        <div className="flex items-center gap-2">
          <Fingerprint className="h-6 w-6" /> Clock In
        </div>
      )}
    </Button>
  );
}
