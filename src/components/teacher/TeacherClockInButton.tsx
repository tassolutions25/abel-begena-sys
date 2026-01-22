"use client";
import { useState } from "react";
import { teacherClockIn, teacherClockOut } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Fingerprint, LogOut, MapPin } from "lucide-react";

export default function TeacherActionButtons({
  userId,
  status,
}: {
  userId: string;
  status: "NONE" | "WORKING" | "DONE";
}) {
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState("");

  const handleClockIn = async () => {
    setLoading(true);
    setLocationStatus("Getting Location...");

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setLocationStatus("Verifying...");
        const { latitude, longitude } = position.coords;

        // Pass coords to server
        const res = await teacherClockIn(userId, latitude, longitude);

        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
        setLoading(false);
        setLocationStatus("");
      },
      (error) => {
        toast.error("Please allow Location Access to clock in.");
        setLoading(false);
        setLocationStatus("");
      },
      { enableHighAccuracy: true } // Request best GPS signal
    );
  };

  // Clock Out doesn't strictly need GPS, but you can add it if you want
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
      </div>
    );
  }

  if (status === "WORKING") {
    return (
      <Button
        onClick={handleClockOut}
        disabled={loading}
        className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg"
      >
        {loading ? (
          "Processing..."
        ) : (
          <>
            <LogOut className="mr-2" /> Clock Out
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClockIn}
        disabled={loading}
        className="w-full h-16 text-lg bg-primary hover:bg-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
      >
        {loading ? (
          locationStatus || "Processing..."
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            <span>Tap to Clock In</span>
          </div>
        )}
      </Button>
      <p className="text-xs text-center text-slate-500">
        * Location access required to verify you are at the branch.
      </p>
    </div>
  );
}
