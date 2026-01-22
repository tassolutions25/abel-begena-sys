"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import EditBranchForm from "@/components/forms/EditBranchForm";

export default function BranchEditDialog({ branch }: { branch: any }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-black border border-slate-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Edit Branch Details
          </DialogTitle>
        </DialogHeader>

        {/* We pass the branch data and a function to close the modal */}
        <EditBranchForm branch={branch} onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
