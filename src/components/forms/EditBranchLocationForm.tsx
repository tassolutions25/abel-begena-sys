"use client";
import { useActionState, useEffect } from "react";
import { updateBranchLocation } from "@/actions/branch-actions"; // We need to create this action
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditBranchLocationForm({
  branch,
  onSuccess,
}: {
  branch: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateBranchLocation, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      onSuccess();
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className="space-y-4 mt-2">
      <input type="hidden" name="id" value={branch.id} />
      <div className="flex gap-2">
        <div>
          <label className="text-xs text-slate-400">Latitude</label>
          <Input
            name="latitude"
            defaultValue={branch.latitude}
            placeholder="e.g. 9.005"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Longitude</label>
          <Input
            name="longitude"
            defaultValue={branch.longitude}
            placeholder="e.g. 38.763"
            className="bg-slate-900 border-slate-700 text-white"
          />
        </div>
      </div>
      <Button
        disabled={isPending}
        className="w-full bg-primary text-black font-bold"
      >
        Update Location
      </Button>
    </form>
  );
}
