"use client";

import { useActionState, useEffect } from "react";
import { updateTeacherFinancials } from "@/actions/payment-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function TeacherFinancialForm({
  teacher,
  banks,
}: {
  teacher: any;
  banks: any[];
}) {
  const [state, action, isPending] = useActionState(
    updateTeacherFinancials,
    null,
  );

  useEffect(() => {
    if (state?.success) toast.success(state.message);
  }, [state]);

  // Find current bank ID based on the saved code (if exists)
  const currentBankId = banks.find((b) => b.code === teacher.bankCode)?.id;

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={teacher.id} />

      <div className="space-y-2">
        <Label className="text-slate-400 text-xs">
          Monthly Base Salary (ETB)
        </Label>
        <Input
          name="salary"
          type="number"
          defaultValue={teacher.baseSalary}
          className="bg-black border-slate-700 text-white"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Bank Name</Label>
          {/* DROPDOWN FOR BANKS */}
          <Select name="bankId" defaultValue={currentBankId} required>
            <SelectTrigger className="bg-black border-slate-700 text-white">
              <SelectValue placeholder="Select Bank" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {banks.length === 0 ? (
                <div className="p-2 text-xs text-slate-500">
                  No banks added yet.
                </div>
              ) : (
                banks.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-slate-400 text-xs">Account Number</Label>
          <Input
            name="account"
            defaultValue={teacher.bankAccountNumber || ""}
            placeholder="1000..."
            className="bg-black border-slate-700 text-white"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200"
      >
        {isPending ? "Updating..." : "Update Info"}
      </Button>
    </form>
  );
}
