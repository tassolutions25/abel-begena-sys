"use client";

import { useActionState } from "react"; // <--- NEW HOOK
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

// Mock branches - We will replace this with real DB data soon
const branches = [
  { id: "addis-bole", name: "Addis Ababa - Bole" },
  { id: "addis-piassa", name: "Addis Ababa - Piassa" },
  { id: "chicago-main", name: "Chicago - Main" },
];

export default function RegisterUserForm({
  forcedRole,
  onSuccess,
}: {
  forcedRole?: string;
  onSuccess?: () => void;
}) {
  // NEW: useActionState returns [state, action, isPending]
  const [state, action, isPending] = useActionState(createUser, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <Card className="w-full max-w-lg shadow-lg border-t-4 border-t-amber-500">
      <CardHeader>
        <CardTitle>New Registration</CardTitle>
        <CardDescription>Add a new Student, Teacher, or Admin.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Abel Tesfaye"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="abel@begena.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {forcedRole ? (
              <input type="hidden" name="role" value={forcedRole} />
            ) : (
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STUDENT">Student</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {!forcedRole && (
              <div className="space-y-2">
                <Label htmlFor="branchId">Branch</Label>
                <Select name="branchId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700"
            disabled={isPending}
          >
            {isPending ? "Registering..." : "Register User"}
          </Button>

          <Button>Register</Button>
        </form>
      </CardContent>
    </Card>
  );
}
