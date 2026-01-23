"use client";
import { useActionState } from "react";
import {
  updateCoursePrice,
  updateTeacherFinancials,
} from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditPriceForm({ course }: { course: any }) {
  const [state, action] = useActionState(updateCoursePrice, null);
  return (
    <form action={action} className="flex gap-2 items-end">
      <input type="hidden" name="id" value={course.id} />
      <div className="w-full">
        <Label className="text-xs text-slate-400">Monthly Price (ETB)</Label>
        <Input
          name="price"
          defaultValue={course.monthlyPrice}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>
      <Button className="bg-primary text-black font-bold">Save</Button>
    </form>
  );
}

export function TeacherFinancialForm({ teacher }: { teacher: any }) {
  const [state, action] = useActionState(updateTeacherFinancials, null);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={teacher.id} />
      <div className="space-y-2">
        <Label>Monthly Base Salary (ETB)</Label>
        <Input
          name="salary"
          defaultValue={teacher.baseSalary}
          className="bg-slate-900 border-slate-700 text-white"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Bank Name</Label>
          <Input
            name="bankName"
            defaultValue={teacher.bankName || ""}
            placeholder="e.g. CBE"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label>Account Number</Label>
          <Input
            name="account"
            defaultValue={teacher.bankAccountNumber || ""}
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>
      <Button className="w-full bg-slate-800 text-slate-200">
        Update Info
      </Button>
    </form>
  );
}
