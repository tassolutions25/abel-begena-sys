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
import { Plus } from "lucide-react";
import RegisterUserForm from "@/components/forms/RegisterUserForm"; // Reusing the generic form

export default function AddAdminDialog() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary text-black hover:bg-amber-600 font-bold">
          <Plus className="mr-2 h-4 w-4" /> New Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-black border-slate-800 text-white">
        <DialogHeader>
          <DialogTitle>Register New Admin</DialogTitle>
        </DialogHeader>
        {/* We pass a prop to force the form to register an ADMIN */}
        <RegisterUserForm forcedRole="ADMIN" onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
