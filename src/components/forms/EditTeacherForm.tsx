"use client";
import { useActionState, useEffect } from "react";
import { updateTeacher } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function EditTeacherForm({
  teacher,
  branches,
  shifts,
  onSuccess,
}: {
  teacher: any;
  branches: any[];
  shifts: any[];
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateTeacher, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={teacher.id} />

      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          name="fullName"
          defaultValue={teacher.fullName}
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            name="email"
            defaultValue={teacher.email}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            name="phone"
            defaultValue={teacher.phone || ""}
            className="bg-slate-900 border-slate-700 text-white"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Branch</Label>
          <Select name="branchId" defaultValue={teacher.branchId}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Shift</Label>
          <Select name="teacherShiftId" defaultValue={teacher.teacherShiftId}>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {shifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        disabled={isPending}
        className="w-full bg-primary text-black mt-2"
      >
        Save Changes
      </Button>
    </form>
  );
}
