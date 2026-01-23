"use client";

import { useActionState, useEffect, useRef } from "react";
import { createUser } from "@/actions/admin-actions";
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

// Accept new prop 'adminMode'
export default function RegisterUserForm({
  adminMode = false,
  forcedRole,
  onSuccess,
}: {
  adminMode?: boolean;
  forcedRole?: string;
  onSuccess?: () => void;
}) {
  const [state, action, isPending] = useActionState(createUser, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
      if (onSuccess) onSuccess();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, onSuccess]);

  return (
    <form ref={formRef} action={action} className="space-y-4">
      {/* ROLE SELECTION LOGIC */}
      {forcedRole ? (
        <input type="hidden" name="role" value={forcedRole} />
      ) : (
        <div className="space-y-2">
          <Label>Role</Label>
          <Select name="role" required>
            <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700 text-white">
              {adminMode ? (
                // Options for Admin Mode
                <>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </>
              ) : (
                // Options for Regular Mode (Students/Teachers registered here)
                <>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Full Name</Label>
        <Input
          name="fullName"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          name="email"
          type="email"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          name="password"
          type="password"
          className="bg-slate-900 border-slate-700 text-white"
          required
        />
      </div>

      {/* BRANCH SELECTION (Hide if in Admin Mode) */}
      {!adminMode && !forcedRole && (
        <div className="space-y-2">
          <Label>Branch</Label>
          {/* NOTE: If you have branch data, map it here. For now simpler input or fetch via client */}
          <Input
            name="branchId"
            placeholder="Enter Branch ID"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      )}

      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold mt-2"
      >
        {isPending ? "Registering..." : "Register User"}
      </Button>
    </form>
  );
}
