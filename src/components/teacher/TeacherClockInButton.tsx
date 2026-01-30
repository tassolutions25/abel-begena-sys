"use client";
import { useState } from "react";
import { teacherClockIn, teacherClockOut } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LogOut, MapPin, Loader2 } from "lucide-react";

export default function TeacherActionButtons({
  userId,
  status,
}: {
  userId: string;
  status: "NONE" | "WORKING" | "DONE";
}) {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleClockIn = async () => {
    setLoading(true);
    setStatusMsg("Locating...");

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setStatusMsg("Verifying location...");
        const { latitude, longitude } = position.coords;

        // Server Action call
        const res = await teacherClockIn(userId, latitude, longitude);

        if (res.success) {
          toast.success(res.message);
        } else {
          // THIS DISPLAYS THE "YOU ARE TOO FAR" MESSAGE
          toast.error(res.message, {
            duration: 5000, // Show for 5 seconds
            style: { border: "1px solid red", color: "red" },
          });
        }
        setLoading(false);
        setStatusMsg("");
      },
      (error) => {
        console.error(error);
        toast.error("Location Access Denied. Please enable GPS.");
        setLoading(false);
        setStatusMsg("");
      },
      {
        enableHighAccuracy: true, // Request precise GPS
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleClockOut = async () => {
    setLoading(true);
    const res = await teacherClockOut(userId);
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setLoading(false);
  };

  if (status === "DONE") {
    return (
      <div className="w-full p-6 bg-slate-900 rounded-xl border border-slate-700 text-center">
        <h3 className="text-green-500 font-bold text-xl">Shift Complete</h3>
        <p className="text-slate-500 text-sm mt-1">See you next time!</p>
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
          <Loader2 className="animate-spin" />
        ) : (
          <>
            <LogOut className="mr-2" /> Clock Out
          </>
        )}
      </Button>
    );
  }

  return (
    <div className="space-y-2 w-full">
      <Button
        onClick={handleClockIn}
        disabled={loading}
        className="w-full h-16 text-lg bg-primary hover:bg-amber-600 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <Loader2 className="animate-spin h-5 w-5" /> {statusMsg}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <MapPin className="h-6 w-6" />
            <span>Tap to Clock In</span>
          </div>
        )}
      </Button>
      <p className="text-xs text-center text-slate-500">
        * GPS Location is required.
      </p>
    </div>
  );
}
