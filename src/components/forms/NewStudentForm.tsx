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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

type BranchOption = {
  id: string;
  name: string;
};

export default function NewStudentForm({
  branches,
}: {
  branches: BranchOption[];
}) {
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
    <Card className="border border-slate-800 bg-black shadow-2xl">
      <CardContent className="pt-6">
        <form ref={formRef} action={action} className="space-y-5">
          {/* Hidden input to force role to STUDENT */}
          <input type="hidden" name="role" value="STUDENT" />

          <div className="space-y-2">
            <Label htmlFor="avatar" className="text-slate-300">
              Profile Picture
            </Label>
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              className="bg-slate-900 border-slate-700 text-white file:text-primary file:font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Student Name"
                className="bg-slate-900 border-slate-700 text-white focus-visible:ring-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                placeholder="+251..."
                className="bg-slate-900 border-slate-700 text-white focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="student@email.com"
              className="bg-slate-900 border-slate-700 text-white focus-visible:ring-primary"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Default Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                className="bg-slate-900 border-slate-700 text-white focus-visible:ring-primary"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branchId" className="text-slate-300">
                Select Branch
              </Label>
              <Select name="branchId" required>
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white focus:ring-primary">
                  <SelectValue placeholder="Choose Branch" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  {branches.length === 0 ? (
                    <div className="p-2 text-sm text-slate-500">
                      No branches found. Create one first!
                    </div>
                  ) : (
                    branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-primary text-black hover:bg-amber-600 font-bold mt-4"
            disabled={isPending}
          >
            {isPending ? "Registering Student..." : "Register Student"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
