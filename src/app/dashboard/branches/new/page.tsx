"use client";

import { useActionState, useEffect, useRef } from "react";
import { createBranch } from "@/actions/branch-actions";
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
import { School } from "lucide-react";

export default function NewBranchPage() {
  const [state, action, isPending] = useActionState(createBranch, null);
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
    <div className="flex flex-col items-center justify-center pt-10">
      <Card className="w-full max-w-lg border border-slate-800 bg-black shadow-2xl">
        <CardHeader className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <School className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-white text-xl">
                Register New Branch
              </CardTitle>
              <CardDescription>Add a new location.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} action={action} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">
                Branch Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Bole Branch"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location" className="text-slate-300">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. Bole Road"
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-slate-300">
                Currency
              </Label>
              <Select name="currency" required defaultValue="ETB">
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="ETB">ETB</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-black font-bold"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Branch"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
