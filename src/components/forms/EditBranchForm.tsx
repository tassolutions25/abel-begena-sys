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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

export default function EditBranchForm({
  branch,
  onSuccess,
}: {
  branch: any;
  onSuccess: () => void;
}) {
  const [state, action, isPending] = useActionState(updateBranch, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.refresh();
      onSuccess();
    } else if (state?.message) {
      toast.error(state.message);
    }
  }, [state, router, onSuccess]);

  return (
    <form action={action} className="space-y-4 mt-2">
      <input type="hidden" name="id" value={branch.id} />

      <div className="space-y-2">
        <Label htmlFor="name" className="text-slate-300">
          Branch Name
        </Label>
        <Input
          id="name"
          name="name"
          defaultValue={branch.name}
          className="bg-slate-900 border-slate-700 text-white focus:border-primary"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-slate-300">
          Address / Location
        </Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <Input
            id="location"
            name="location"
            defaultValue={branch.location}
            className="pl-9 bg-slate-900 border-slate-700 text-white focus:border-primary"
            required
          />
        </div>
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
            <SelectItem value="ETB">ETB (Ethiopian Birr)</SelectItem>
            <SelectItem value="USD">USD (US Dollar)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* NEW: Geolocation Section */}
      <div className="pt-4 border-t border-slate-800">
        <Label className="text-primary mb-2 block">
          GPS Coordinates (For Teacher Attendance)
        </Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="latitude" className="text-xs text-slate-400">
              Latitude
            </Label>
            <Input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="e.g. 9.0054"
              defaultValue={branch.latitude || ""}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude" className="text-xs text-slate-400">
              Longitude
            </Label>
            <Input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="e.g. 38.7636"
              defaultValue={branch.longitude || ""}
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">
          * You can find these on Google Maps by right-clicking a location.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-black font-bold mt-2"
        disabled={isPending}
      >
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
