"use client";
import { useActionState, useEffect, useRef } from "react";
import { registerTeacher } from "@/actions/teacher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Import Router
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TeacherRegisterForm({
  branches,
  shifts,
}: {
  branches: any[];
  shifts: any[];
}) {
  const [state, action, isPending] = useActionState(registerTeacher, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/dashboard/teachers"); // <--- REDIRECT HERE
    } else if (state?.message) toast.error(state.message);
  }, [state, router]);

  return (
    <div>
      {/* BACK BUTTON */}
      <Link
        href="/dashboard/teachers"
        className="inline-flex items-center text-slate-400 hover:text-white mb-4 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Teachers List
      </Link>

      <Card className="bg-black border-slate-800">
        <CardContent className="pt-6">
          <form action={action} className="space-y-4">
            {/* ... (Keep existing inputs: Name, Email, Phone, Password) ... */}
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                name="fullName"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Phone</Label>
                <Input
                  name="phone"
                  className="bg-slate-900 border-slate-700 text-white"
                  required
                />
              </div>
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

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label>Assigned Branch</Label>
                <Select name="branchId" required>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                    <SelectValue placeholder="Select Branch" />
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
                <Label>Work Shift</Label>
                <Select name="teacherShiftId" required>
                  <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
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

            <Button
              disabled={isPending}
              className="w-full bg-primary text-black font-bold mt-4"
            >
              {isPending ? "Registering..." : "Register Teacher"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
