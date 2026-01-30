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
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, School } from "lucide-react";

export default function NewBranchPage() {
  const [state, action, isPending] = useActionState(createBranch, null);
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      formRef.current?.reset();
      router.push("/dashboard/branches");
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-col items-center justify-center pt-10">
      <div className="w-full max-w-lg mb-4">
        {/* NEW: Back Button */}
        <Link href="/dashboard/branches">
          <Button
            variant="ghost"
            className="text-slate-400 pl-0 hover:text-white hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </Link>
      </div>
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
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div className="col-span-2 text-sm text-slate-400 font-medium">
                GPS Coordinates (Optional)
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Latitude</Label>
                <Input
                  name="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 9.005"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-400 text-xs">Longitude</Label>
                <Input
                  name="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 38.763"
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
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
