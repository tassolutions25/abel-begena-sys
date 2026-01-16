"use client";

import { useActionState, useEffect } from "react";
import { updateBranch } from "@/actions/update-actions";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the shape of the data we are editing
type BranchData = {
  id: string;
  name: string;
  location: string;
  currency: string;
};

export default function EditBranchForm({ branch }: { branch: BranchData }) {
  const [state, action, isPending] = useActionState(updateBranch, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.push("/dashboard/branches"); // Redirect back to list
      router.refresh();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <Card className="w-full max-w-lg border border-slate-800 bg-black">
      <CardHeader>
        <CardTitle className="text-white">Edit Branch Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-5">
          <input type="hidden" name="id" value={branch.id} />

          <div className="space-y-2">
            <Label htmlFor="name" className="text-slate-300">
              Branch Name
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={branch.name}
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
              defaultValue={branch.location}
              className="bg-slate-900 border-slate-700 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-slate-300">
              Currency
            </Label>
            <Select name="currency" defaultValue={branch.currency}>
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
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
