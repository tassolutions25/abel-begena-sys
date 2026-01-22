"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

// Import the forms we created in the previous steps
import EditTeacherShiftForm from "@/components/forms/EditTeacherShiftForm";
import EditAttendanceLogForm from "@/components/forms/EditAttendanceLogForm";

// --- DIALOG 1: Edit Teacher Shift ---
export function EditTeacherShiftDialog({ shift }: { shift: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Edit Work Shift</DialogTitle>
        </DialogHeader>
        <EditTeacherShiftForm shift={shift} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

// --- DIALOG 2: Edit Attendance Log (Admin Fix) ---
export function EditAttendanceLogDialog({ log }: { log: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Correct Attendance Log</DialogTitle>
        </DialogHeader>
        <EditAttendanceLogForm log={log} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
