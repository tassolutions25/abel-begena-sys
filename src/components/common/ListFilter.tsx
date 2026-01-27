"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

type Props = {
  branches: any[];
  shifts?: any[]; // Optional because teachers might use different shift model
  courses?: any[]; // Only for students
  showCourseFilter?: boolean;
};

export default function ListFilter({
  branches,
  shifts,
  courses,
  showCourseFilter,
}: Props) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    router.replace(pathname);
  };

  return (
    <div className="flex flex-wrap gap-2 mb-6 items-center bg-slate-900/50 p-2 rounded border border-slate-800">
      <Filter className="w-4 h-4 text-slate-500 mr-2" />

      {/* BRANCH FILTER */}
      <Select
        value={searchParams.get("branch") || ""}
        onValueChange={(val) => handleFilter("branch", val)}
      >
        <SelectTrigger className="w-[180px] bg-black border-slate-700 text-white h-9">
          <SelectValue placeholder="Filter by Branch" />
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

      {/* SHIFT FILTER */}
      {shifts && (
        <Select
          value={searchParams.get("shift") || ""}
          onValueChange={(val) => handleFilter("shift", val)}
        >
          <SelectTrigger className="w-[180px] bg-black border-slate-700 text-white h-9">
            <SelectValue placeholder="Filter by Shift" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectItem value="all">All Shifts</SelectItem>
            {shifts.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* COURSE FILTER (For Students) */}
      {showCourseFilter && courses && (
        <Select
          value={searchParams.get("course") || ""}
          onValueChange={(val) => handleFilter("course", val)}
        >
          <SelectTrigger className="w-[180px] bg-black border-slate-700 text-white h-9">
            <SelectValue placeholder="Filter by Class" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700 text-white">
            <SelectItem value="all">All Classes</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* CLEAR BUTTON */}
      {(searchParams.get("branch") ||
        searchParams.get("shift") ||
        searchParams.get("course")) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          <X className="w-3 h-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}
