"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type FilterProps = {
  branches: any[];
  courses: any[];
  shifts: any[];
};

export default function AttendanceFilter({
  branches,
  courses,
  shifts,
}: FilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Helper to update URL params
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Replace URL without scrolling to top
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Get current values
  const currentDate =
    searchParams.get("date") || new Date().toISOString().split("T")[0];
  const currentBranch = searchParams.get("branch") || "";
  const currentCourse = searchParams.get("course") || "";
  const currentShift = searchParams.get("shift") || "";

  return (
    <div className="flex flex-wrap gap-4 bg-black p-4 border border-slate-800 rounded-lg items-end mb-6">
      {/* DATE SELECTOR */}
      <div className="space-y-2 w-full md:w-auto">
        <Label className="text-xs text-slate-400">Date</Label>
        <Input
          type="date"
          value={currentDate}
          onChange={(e) => handleFilterChange("date", e.target.value)}
          className="bg-slate-900 border-slate-700 text-white w-full md:w-[160px]"
        />
      </div>

      {/* BRANCH SELECTOR */}
      <div className="space-y-2 w-full md:w-auto">
        <Label className="text-xs text-slate-400">Branch</Label>
        <Select
          value={currentBranch}
          onValueChange={(val) => handleFilterChange("branch", val)}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-full md:w-[180px]">
            <SelectValue placeholder="All Branches" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectItem value="all">All Branches</SelectItem>
            {branches.map((b) => (
              <SelectItem key={b.id} value={b.id}>
                {b.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* COURSE SELECTOR */}
      <div className="space-y-2 w-full md:w-auto">
        <Label className="text-xs text-slate-400">Class Category</Label>
        <Select
          value={currentCourse}
          onValueChange={(val) => handleFilterChange("course", val)}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-full md:w-[180px]">
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

      {/* SHIFT SELECTOR */}
      <div className="space-y-2 w-full md:w-auto">
        <Label className="text-xs text-slate-400">Shift</Label>
        <Select
          value={currentShift}
          onValueChange={(val) => handleFilterChange("shift", val)}
        >
          <SelectTrigger className="bg-slate-900 border-slate-700 text-white w-full md:w-[220px]">
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
    </div>
  );
}
