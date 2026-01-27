"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";

export default function TeacherAttendanceFilter() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Get current date from URL or default to today
  const currentDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  const handleDateChange = (newDate: string) => {
    const params = new URLSearchParams(searchParams);

    if (newDate) {
      params.set("date", newDate);
    } else {
      params.delete("date");
    }

    // Update URL immediately without page reload
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-slate-400">Filter Date:</label>
      <Input
        type="date"
        value={currentDate}
        onChange={(e) => handleDateChange(e.target.value)}
        className="bg-slate-900 border border-slate-700 text-white w-auto"
      />
    </div>
  );
}
